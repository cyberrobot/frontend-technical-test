import getData from '..';
import { request } from '../helpers';

jest.mock('../helpers');

describe('getData Tests', () => {
  beforeEach(() => {
    request.mockReset();
  });

  const safelyCallApi = async () => {
    try {
      return await getData();
    } catch (e) {
      return null;
    }
  };

  it('Should fail if initial api call is failed', () => {
    request.mockRejectedValueOnce('An error occurred');

    return expect(() => getData()).rejects.not.toBeFalsy();
  });

  it('Should make an api call to receive a list of general vehicle information', async () => {
    expect.assertions(1);
    request.mockResolvedValueOnce([]);
    await safelyCallApi();

    expect(request).toBeCalledWith('/api/vehicles.json');
  });

  it('Should traverse and make further api calls on main results', async () => {
    expect.assertions(3);
    request.mockResolvedValueOnce([
      { apiUrl: '/api/vehicle_ftype.json' },
      { apiUrl: '/api/vehicle_xj.json' },
    ]);
    request.mockResolvedValueOnce({ id: 'ftype', price: '£36,000' });
    request.mockResolvedValueOnce({ id: 'xj', price: '£40,000' });
    await safelyCallApi();

    expect(request).toBeCalledWith('/api/vehicles.json');
    expect(request).toBeCalledWith('/api/vehicle_ftype.json');
    expect(request).toBeCalledWith('/api/vehicle_xj.json');
  });

  it('Should ignore failed API calls during traversing', () => {
    request.mockResolvedValueOnce([
      { apiUrl: '/api/vehicle_ftype.json' },
      { apiUrl: '/api/vehicle_xj.json' },
    ]);
    request.mockResolvedValueOnce({ id: 'ftype', price: '£36,000' });
    request.mockRejectedValueOnce('An error occurred');

    return expect(safelyCallApi()).resolves.toEqual([
      {
        apiUrl: '/api/vehicle_ftype.json',
        id: 'ftype',
        price: '£36,000',
      },
    ]);
  });

  it('Should ignore vehicles without valid price during traversing', () => {
    request.mockResolvedValueOnce([
      { apiUrl: '/api/ftype.json' },
      { apiUrl: '/api/xe.json' },
      { apiUrl: '/api/xj.json' },
    ]);
    request.mockResolvedValueOnce({ id: 'ftype', price: '' });
    request.mockResolvedValueOnce({ id: 'xe' });
    request.mockResolvedValueOnce({ id: 'xj', price: '£40,000' });

    return expect(safelyCallApi()).resolves.toEqual([
      { apiUrl: '/api/xj.json', id: 'xj', price: '£40,000' },
    ]);
  });

  it('rejects a non-array list response', async () => {
    request.mockResolvedValueOnce({});
    await expect(getData()).rejects.toThrow('Vehicle list response must be an array');
  });

  it('skips summaries with invalid detail URLs', async () => {
    request.mockResolvedValueOnce([null, {}, { apiUrl: '' }, { apiUrl: 42 }]);
    await expect(getData()).resolves.toEqual([]);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('skips whitespace-only prices and merges valid detail fields over summaries', async () => {
    request.mockResolvedValueOnce([
      {
        id: 'xe', apiUrl: '/xe', description: 'Summary', media: ['image'],
      },
      { id: 'xf', apiUrl: '/xf' },
    ]);
    request.mockResolvedValueOnce({ price: '£30,000', description: 'Detail' });
    request.mockResolvedValueOnce({ price: '  ' });

    await expect(getData()).resolves.toEqual([
      {
        id: 'xe',
        apiUrl: '/xe',
        description: 'Detail',
        media: ['image'],
        price: '£30,000',
      },
    ]);
  });

  it('preserves list order when detail requests complete out of order', async () => {
    let resolveFirst;
    const first = new Promise((resolve) => { resolveFirst = resolve; });
    request.mockResolvedValueOnce([{ apiUrl: '/first' }, { apiUrl: '/second' }]);
    request.mockReturnValueOnce(first);
    request.mockResolvedValueOnce({ id: 'second', price: '£2' });

    const result = getData();
    await Promise.resolve();
    resolveFirst({ id: 'first', price: '£1' });
    await expect(result).resolves.toEqual([
      { apiUrl: '/first', id: 'first', price: '£1' },
      { apiUrl: '/second', id: 'second', price: '£2' },
    ]);
  });
});
