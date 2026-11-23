import React from 'react';
import { render } from '@testing-library/react';
import VehicleList from '..';
import useData from '../useData';

jest.mock('../useData');

describe('<VehicleList /> Tests', () => {
  it('Should show loading state if it not falsy', () => {
    useData.mockReturnValue([true, 'An error occurred', 'results']);
    const { queryByTestId } = render(<VehicleList />);

    expect(queryByTestId('loading')).not.toBeNull();
    expect(queryByTestId('error')).toBeNull();
    expect(queryByTestId('results')).toBeNull();
  });

  it('Should show error if it is not falsy and loading is finished', () => {
    useData.mockReturnValue([false, 'An error occurred', 'results']);
    const { queryByTestId } = render(<VehicleList />);

    expect(queryByTestId('loading')).toBeNull();
    expect(queryByTestId('error')).not.toBeNull();
    expect(queryByTestId('results')).toBeNull();
  });

  it('Should show results if loading successfully finished', () => {
    useData.mockReturnValue([false, false, []]);
    const { queryByTestId } = render(<VehicleList />);

    expect(queryByTestId('loading')).toBeNull();
    expect(queryByTestId('error')).toBeNull();
    expect(queryByTestId('results')).not.toBeNull();
  });

  it('assigns staggered delays with a cap to vehicle cards', () => {
    const vehicles = Array.from({ length: 12 }, (_, index) => ({
      id: `vehicle-${index}`,
      price: '£30,000',
    }));
    useData.mockReturnValue([false, false, vehicles]);
    const { getAllByRole, rerender } = render(<VehicleList />);
    const items = getAllByRole('listitem');

    expect(items[0].style.getPropertyValue('--fade-delay')).toBe('0ms');
    expect(items[1].style.getPropertyValue('--fade-delay')).toBe('50ms');
    expect(items[11].style.getPropertyValue('--fade-delay')).toBe('500ms');

    rerender(<VehicleList />);
    expect(getAllByRole('listitem')[1]).toBe(items[1]);
  });
});
