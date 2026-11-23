import React from 'react';
import { render } from '@testing-library/react';
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
});
