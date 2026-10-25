import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../../shared/api';
import { stubFetch } from '../../../shared/lib/testing/mock-fetch';
import { createEventType, getEventType, listEventTypes } from './event-type';

const consultation = { id: '1', name: 'Консультация', description: '', duration: 30 };

describe('event-type entity', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('lists event types', async () => {
    stubFetch(200, [consultation]);

    const result = await listEventTypes();

    expect(result).toEqual([consultation]);
  });

  it('throws ApiError when listing fails', async () => {
    stubFetch(500, {});

    await expect(listEventTypes()).rejects.toBeInstanceOf(ApiError);
  });

  it('finds an event type by id', async () => {
    stubFetch(200, [consultation]);

    expect(await getEventType('1')).toEqual(consultation);
  });

  it('returns undefined for an unknown id', async () => {
    stubFetch(200, [consultation]);

    expect(await getEventType('missing')).toBeUndefined();
  });

  it('creates an event type', async () => {
    stubFetch(201, consultation);

    const result = await createEventType({ name: 'Консультация', description: '', duration: 30 });

    expect(result.id).toBe('1');
  });

  it('throws ApiError when creation fails', async () => {
    stubFetch(400, {});

    await expect(
      createEventType({ name: '', description: '', duration: 30 }),
    ).rejects.toMatchObject({ status: 400 });
  });
});
