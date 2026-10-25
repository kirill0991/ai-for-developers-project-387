export * from './generated';

/**
 * Error thrown when the API responds with a non-success status code.
 * The `status` field lets callers distinguish domain cases (e.g. 409 conflict).
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
