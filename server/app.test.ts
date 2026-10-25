// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildApp } from './app';
import { createDb } from './db';

// Monday 03:00 Moscow; all fixture dates below are relative to this moment.
const NOW = new Date('2026-10-19T00:00:00Z');

describe('API', () => {
  let app: ReturnType<typeof buildApp>;

  beforeEach(async () => {
    app = buildApp({ db: createDb(':memory:'), now: () => NOW });
    await app.ready();
  });

  async function createType(duration = 30): Promise<string> {
    const response = await app.inject({
      method: 'POST',
      url: '/event-types',
      payload: { name: 'Консультация', description: '', duration },
    });
    return response.json().id;
  }

  function book(typeId: string, slotStart: string) {
    return app.inject({
      method: 'POST',
      url: '/bookings',
      payload: { name: 'Иван', email: 'ivan@example.com', typeId, slotStart },
    });
  }

  afterEach(async () => {
    await app.close();
  });

  describe('event types', () => {
    it('creates an event type and returns 201', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/event-types',
        payload: { name: 'Консультация', description: '30 минут', duration: 30 },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toMatchObject({
        name: 'Консультация',
        description: '30 минут',
        duration: 30,
      });
      expect(response.json().id).toBeTruthy();
    });

    it('lists created event types', async () => {
      await app.inject({
        method: 'POST',
        url: '/event-types',
        payload: { name: 'Консультация', description: '', duration: 30 },
      });

      const response = await app.inject({ method: 'GET', url: '/event-types' });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveLength(1);
      expect(response.json()[0]).toMatchObject({ name: 'Консультация' });
    });

    it('rejects an event type with an empty name', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/event-types',
        payload: { name: '', description: '', duration: 30 },
      });

      expect(response.statusCode).toBe(400);
    });

    it('rejects an event type with a non-positive duration', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/event-types',
        payload: { name: 'Консультация', description: '', duration: 0 },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('slots', () => {
    it('returns 404 for an unknown event type', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/slots?typeId=missing&from=2026-10-19T00:00:00Z&to=2026-10-20T00:00:00Z',
      });

      expect(response.statusCode).toBe(404);
    });

    it('generates 18 free slots for a 30-minute type over one day', async () => {
      const created = await app.inject({
        method: 'POST',
        url: '/event-types',
        payload: { name: 'Консультация', description: '', duration: 30 },
      });
      const typeId = created.json().id;

      const response = await app.inject({
        method: 'GET',
        url: `/slots?typeId=${typeId}&from=2026-10-19T00:00:00Z&to=2026-10-20T00:00:00Z`,
      });

      expect(response.statusCode).toBe(200);
      const slots = response.json();
      expect(slots).toHaveLength(18);
      expect(slots[0]).toEqual({
        start: '2026-10-19T06:00:00.000Z',
        end: '2026-10-19T06:30:00.000Z',
        status: 'free',
      });
      expect(slots.every((slot: { status: string }) => slot.status === 'free')).toBe(true);
    });

    it('marks a slot as occupied after it is booked', async () => {
      const created = await app.inject({
        method: 'POST',
        url: '/event-types',
        payload: { name: 'Консультация', description: '', duration: 30 },
      });
      const typeId = created.json().id;

      await app.inject({
        method: 'POST',
        url: '/bookings',
        payload: {
          name: 'Иван',
          email: 'ivan@example.com',
          typeId,
          slotStart: '2026-10-19T06:00:00.000Z',
        },
      });

      const response = await app.inject({
        method: 'GET',
        url: `/slots?typeId=${typeId}&from=2026-10-19T00:00:00Z&to=2026-10-20T00:00:00Z`,
      });

      const slots = response.json();
      expect(slots[0].status).toBe('occupied');
      expect(slots.slice(1).every((slot: { status: string }) => slot.status === 'free')).toBe(true);
    });
  });

  describe('bookings', () => {
    it('creates a booking and returns 201', async () => {
      const created = await app.inject({
        method: 'POST',
        url: '/event-types',
        payload: { name: 'Консультация', description: '', duration: 30 },
      });
      const typeId = created.json().id;

      const response = await app.inject({
        method: 'POST',
        url: '/bookings',
        payload: {
          name: 'Иван',
          email: 'ivan@example.com',
          typeId,
          slotStart: '2026-10-19T06:00:00.000Z',
        },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toMatchObject({
        name: 'Иван',
        email: 'ivan@example.com',
        typeId,
        slotStart: '2026-10-19T06:00:00.000Z',
        slotEnd: '2026-10-19T06:30:00.000Z',
      });
    });

    it('rejects a conflicting booking with 409', async () => {
      const created = await app.inject({
        method: 'POST',
        url: '/event-types',
        payload: { name: 'Консультация', description: '', duration: 30 },
      });
      const typeId = created.json().id;

      const first = await app.inject({
        method: 'POST',
        url: '/bookings',
        payload: {
          name: 'Иван',
          email: 'ivan@example.com',
          typeId,
          slotStart: '2026-10-19T06:00:00.000Z',
        },
      });
      expect(first.statusCode).toBe(201);

      const conflict = await app.inject({
        method: 'POST',
        url: '/bookings',
        payload: {
          name: 'Мария',
          email: 'maria@example.com',
          typeId,
          slotStart: '2026-10-19T06:00:00.000Z',
        },
      });

      expect(conflict.statusCode).toBe(409);
    });

    it('rejects a booking for an unknown event type with 404', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/bookings',
        payload: {
          name: 'Иван',
          email: 'ivan@example.com',
          typeId: 'missing',
          slotStart: '2026-10-19T06:00:00.000Z',
        },
      });

      expect(response.statusCode).toBe(404);
    });

    it('rejects a booking with an invalid email', async () => {
      const created = await app.inject({
        method: 'POST',
        url: '/event-types',
        payload: { name: 'Консультация', description: '', duration: 30 },
      });
      const typeId = created.json().id;

      const response = await app.inject({
        method: 'POST',
        url: '/bookings',
        payload: {
          name: 'Иван',
          email: 'not-an-email',
          typeId,
          slotStart: '2026-10-19T06:00:00.000Z',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('lists bookings', async () => {
      const created = await app.inject({
        method: 'POST',
        url: '/event-types',
        payload: { name: 'Консультация', description: '', duration: 30 },
      });
      const typeId = created.json().id;

      await app.inject({
        method: 'POST',
        url: '/bookings',
        payload: {
          name: 'Иван',
          email: 'ivan@example.com',
          typeId,
          slotStart: '2026-10-19T06:00:00.000Z',
        },
      });

      const response = await app.inject({ method: 'GET', url: '/bookings' });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveLength(1);
      expect(response.json()[0]).toMatchObject({ name: 'Иван' });
    });

    it('rejects a booking in the past', async () => {
      const typeId = await createType();

      const response = await book(typeId, '2026-10-18T06:00:00.000Z');

      expect(response.statusCode).toBe(400);
    });

    it('rejects a booking off the 30-minute grid', async () => {
      const typeId = await createType();

      const response = await book(typeId, '2026-10-19T06:15:00.000Z');

      expect(response.statusCode).toBe(400);
    });

    it('rejects a booking outside working hours', async () => {
      const typeId = await createType(60);

      expect((await book(typeId, '2026-10-19T05:30:00.000Z')).statusCode).toBe(400); // 08:30
      expect((await book(typeId, '2026-10-19T14:30:00.000Z')).statusCode).toBe(400); // 17:30–18:30
      expect((await book(typeId, '2026-10-19T14:00:00.000Z')).statusCode).toBe(201); // 17:00–18:00
    });

    it('rejects a booking beyond the 14-day horizon', async () => {
      const typeId = await createType();

      expect((await book(typeId, '2026-11-01T06:00:00.000Z')).statusCode).toBe(201);
      expect((await book(typeId, '2026-11-02T06:00:00.000Z')).statusCode).toBe(400);
    });

    it('detects conflicts for equivalent times in another offset', async () => {
      const typeId = await createType();

      expect((await book(typeId, '2026-10-19T09:00:00+03:00')).statusCode).toBe(201);
      expect((await book(typeId, '2026-10-19T06:00:00.000Z')).statusCode).toBe(409);
    });

    it('rejects an overlapping booking of another event type', async () => {
      const shortType = await createType(30);
      const longType = await createType(60);

      expect((await book(shortType, '2026-10-19T07:00:00.000Z')).statusCode).toBe(201); // 10:00
      expect((await book(longType, '2026-10-19T06:30:00.000Z')).statusCode).toBe(409); // 09:30–10:30
    });
  });

  describe('slots window', () => {
    it('does not offer past slots or slots beyond the horizon', async () => {
      const typeId = await createType();

      const response = await app.inject({
        method: 'GET',
        url: `/slots?typeId=${typeId}&from=2026-10-01T00:00:00Z&to=2026-12-01T00:00:00Z`,
      });

      const slots = response.json();
      expect(slots[0].start).toBe('2026-10-19T06:00:00.000Z');
      expect(slots.at(-1).start).toBe('2026-11-01T14:30:00.000Z');
      expect(slots).toHaveLength(14 * 18);
    });
  });
});
