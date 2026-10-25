import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../../shared/api';
import { stubFetch } from '../../../shared/lib/testing/mock-fetch';
import { createBooking, listBookings } from './booking';

const booking = {
  id: '1',
  name: 'Иван',
  email: 'ivan@example.com',
  typeId: 't1',
  slotStart: '2026-10-19T06:00:00.000Z',
  slotEnd: '2026-10-19T06:30:00.000Z',
  createdAt: '2026-10-19T00:00:00.000Z',
};

const input = {
  name: 'Иван',
  email: 'ivan@example.com',
  typeId: 't1',
  slotStart: '2026-10-19T06:00:00.000Z',
};

describe('booking entity', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('lists bookings', async () => {
    stubFetch(200, [booking]);

    const result = await listBookings();

    expect(result).toEqual([booking]);
  });

  it('creates a booking', async () => {
    const fetchMock = stubFetch(201, booking);

    const result = await createBooking(input);

    expect(result.id).toBe('1');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body as string)).toEqual(input);
  });

  it('throws ApiError with status 409 on conflict', async () => {
    stubFetch(409, { message: 'Слот уже занят' });

    await expect(createBooking(input)).rejects.toMatchObject({ status: 409 });
  });

  it('throws ApiError on other failures', async () => {
    stubFetch(400, { message: 'Bad Request' });

    const promise = createBooking(input);

    await expect(promise).rejects.toBeInstanceOf(ApiError);
    await expect(promise).rejects.toMatchObject({ status: 400 });
  });
});
