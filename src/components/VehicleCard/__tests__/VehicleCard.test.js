import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import VehicleCard from '..';

describe('<VehicleCard />', () => {
  it('renders a spaced price and handles missing or invalid media', () => {
    const { getByText, queryByRole } = render(
      <VehicleCard vehicle={{ id: 'xe', price: '£30,000', media: [null, {}] }} />,
    );

    expect(getByText('From £30,000')).not.toBeNull();
    expect(queryByRole('img')).toBeNull();
  });

  it('renders the square and wide images when available', () => {
    const { getByRole, container } = render(
      <VehicleCard vehicle={{
        id: 'xe',
        price: '£30,000',
        media: [{ url: '/1x1/xe.jpg' }, { url: '/16x9/xe.jpg' }],
      }}
      />,
    );

    expect(getByRole('img').getAttribute('src')).toBe('/1x1/xe.jpg');
    expect(container.querySelector('source').getAttribute('srcset')).toBe('/16x9/xe.jpg');
  });

  it('opens the selected vehicle details and returns focus when closed', () => {
    const { getByRole, getByText, container } = render(
      <VehicleCard vehicle={{
        id: 'ipace',
        price: '£65,100',
        meta: {
          bodystyles: ['SUV'],
          drivetrain: ['AWD'],
          passengers: 4,
          emissions: { template: 'CO2 Emissions $value g/km', value: 0 },
        },
      }}
      />,
    );
    const dialog = container.querySelector('dialog');
    dialog.showModal = jest.fn(() => dialog.setAttribute('open', ''));
    dialog.close = jest.fn(() => {
      dialog.removeAttribute('open');
      fireEvent(dialog, new Event('close'));
    });
    const trigger = getByRole('button', { name: 'View details for I-PACE' });
    fireEvent.click(trigger);

    expect(dialog.showModal).toHaveBeenCalledTimes(1);
    expect(getByRole('dialog', { name: 'I-PACE details' })).toBe(dialog);
    expect(getByText('CO2 Emissions 0 g/km')).not.toBeNull();
    expect(getByText('SUV')).not.toBeNull();
    expect(getByText('AWD')).not.toBeNull();
    expect(getByText('4')).not.toBeNull();

    fireEvent.click(getByRole('button', { name: 'Close' }));
    expect(dialog.close).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(trigger);
  });

  it('shows a fallback when additional details are missing', () => {
    const { container, getByRole, getByText } = render(
      <VehicleCard vehicle={{ id: 'xe', price: '£30,000' }} />,
    );
    const dialog = container.querySelector('dialog');
    dialog.showModal = () => dialog.setAttribute('open', '');
    fireEvent.click(getByRole('button', { name: 'View details for XE' }));
    expect(getByText('No additional details are available.')).not.toBeNull();
  });
});
