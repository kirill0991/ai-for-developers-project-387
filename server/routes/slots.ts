import type { FastifyInstance } from 'fastify';
import type { Db } from '../db';
import { intervalsOverlap } from '../domain/conflict';
import { BOOKING_HORIZON_DAYS } from '../domain/schedule';
import { generateSlots } from '../domain/slots';
import type { Slot } from '../domain/types';
import { listBookings } from '../repositories/bookings';
import { getEventType } from '../repositories/event-types';
import { errorSchema, slotSchema } from '../schemas';

interface SlotsQuery {
  typeId: string;
  from: string;
  to: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function registerSlotsRoutes(app: FastifyInstance, db: Db, now: () => Date): void {
  app.get(
    '/slots',
    {
      schema: {
        querystring: {
          type: 'object',
          required: ['typeId', 'from', 'to'],
          properties: {
            typeId: { type: 'string' },
            from: { type: 'string', format: 'date-time' },
            to: { type: 'string', format: 'date-time' },
          },
        },
        response: {
          200: { type: 'array', items: slotSchema },
          404: errorSchema,
        },
      },
    },
    async (request, reply) => {
      const { typeId, from, to } = request.query as SlotsQuery;

      const eventType = getEventType(db, typeId);
      if (!eventType) {
        return reply.code(404).send({ message: 'Тип события не найден' });
      }

      // Past slots and slots beyond the booking horizon are never offered.
      const current = now();
      const horizonEnd = new Date(current.getTime() + BOOKING_HORIZON_DAYS * DAY_MS);
      const fromDate = new Date(Math.max(new Date(from).getTime(), current.getTime()));
      const toDate = new Date(Math.min(new Date(to).getTime(), horizonEnd.getTime()));
      const bookings = listBookings(db);

      const slots: Slot[] = generateSlots(fromDate, toDate, eventType.duration).map((interval) => {
        const occupied = bookings.some((booking) =>
          intervalsOverlap(
            interval.start,
            interval.end,
            new Date(booking.slotStart),
            new Date(booking.slotEnd),
          ),
        );

        return {
          start: interval.start.toISOString(),
          end: interval.end.toISOString(),
          status: occupied ? 'occupied' : 'free',
        };
      });

      return slots;
    },
  );
}
