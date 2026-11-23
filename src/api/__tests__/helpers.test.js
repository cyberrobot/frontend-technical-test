import { request } from '../helpers';

describe('request', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns parsed JSON for a successful response', async () => {
    const data = { id: 'xe' };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(data),
    });

    await expect(request('/api/xe')).resolves.toEqual(data);
    expect(global.fetch).toHaveBeenCalledWith('/api/xe');
  });

  it('rejects with the status and URL for an HTTP error', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 });
    await expect(request('/api/missing')).rejects.toThrow('Request failed (404): /api/missing');
  });

  it('propagates network errors', async () => {
    const error = new Error('Network unavailable');
    global.fetch = jest.fn().mockRejectedValue(error);
    await expect(request('/api/xe')).rejects.toBe(error);
  });
});
