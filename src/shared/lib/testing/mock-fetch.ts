import { vi } from 'vitest';

/**
 * Builds a minimal `Response`-like object for the generated SDK, which reads
 * `status`, `headers` and `text()`.
 */
export function mockFetchResponse(status: number, data: unknown) {
  return {
    status,
    headers: new Headers(),
    text: async () => JSON.stringify(data),
  };
}

/** Stubs the global `fetch` to always resolve with the given status and body. */
export function stubFetch(status: number, data: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(status, data));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}
