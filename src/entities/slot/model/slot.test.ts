import { afterEach, describe, expect, it, vi } from 'vitest';
import { stubFetch } from '../../../shared/lib/testing/mock-fetch';
import { listSlots } from './slot';

describe('slot entity', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('lists slots for a type within a range', async () => {
    const fetchMock = stubFetch(200, [
      { start: '2026-10-19T06:00:00.000Z', end: '2026-10-19T06:30:00.000Z', status: 'free' },
    ]);

    const from = new Date('2026-10-19T00:00:00Z');
    const to = new Date('2026-10-20T00:00:00Z');
    const result = await listSlots('t1', from, to);

    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('free');

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('typeId=t1');
    expect(url).toContain('from=2026-10-19T00%3A00%3A00.000Z');
  });
});
