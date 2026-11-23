import React from 'react';
import { render, waitFor } from '@testing-library/react';
import useData from '../useData';
import getData from '../../../api';

jest.mock('../../../api');

function TestComponent() {
  const [loading, error, vehicles] = useData();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="error">{error}</span>
      <span data-testid="vehicles">{JSON.stringify(vehicles)}</span>
    </div>
  );
}

describe('useData', () => {
  beforeEach(() => {
    getData.mockReset();
  });

  it('starts loading and returns vehicles on success', async () => {
    const vehicles = [{ id: 'xe' }];
    getData.mockResolvedValue(vehicles);
    const { getByTestId } = render(<TestComponent />);
    expect(getByTestId('loading').textContent).toBe('true');
    expect(getByTestId('error').textContent).toBe('');
    expect(getByTestId('vehicles').textContent).toBe('[]');

    await waitFor(() => expect(getByTestId('loading').textContent).toBe('false'));
    expect(getByTestId('vehicles').textContent).toBe(JSON.stringify(vehicles));
    expect(getByTestId('error').textContent).toBe('');
  });

  it.each([
    [new Error('Unavailable'), 'Unavailable'],
    ['failure', 'Unable to load vehicles'],
    [null, 'Unable to load vehicles'],
  ])('reports a readable error for rejection %s', async (reason, message) => {
    getData.mockRejectedValue(reason);
    const { getByTestId } = render(<TestComponent />);

    await waitFor(() => expect(getByTestId('loading').textContent).toBe('false'));
    expect(getByTestId('error').textContent).toBe(message);
    expect(getByTestId('vehicles').textContent).toBe('[]');
  });
});
