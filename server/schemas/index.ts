import bookingCreate from './BookingCreate.json';
import booking from './Booking.json';
import eventTypeCreate from './EventTypeCreate.json';
import eventType from './EventType.json';
import slot from './Slot.json';

/**
 * The generated schemas declare `$schema: draft-2020-12`, which Fastify's
 * default Ajv (draft-07) rejects. The schemas only use draft-07-compatible
 * keywords, so we strip the meta keywords before handing them to Fastify.
 */
function clean<T extends Record<string, unknown>>(schema: T): Omit<T, '$schema' | '$id'> {
  const result = { ...schema };
  delete result.$schema;
  delete result.$id;
  return result;
}

export const eventTypeCreateSchema = clean(eventTypeCreate);
export const eventTypeSchema = clean(eventType);
export const bookingCreateSchema = clean(bookingCreate);
export const bookingSchema = clean(booking);
export const slotSchema = clean(slot);

/** Shared shape for error responses (404, 409). */
export const errorSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' },
  },
  required: ['message'],
} as const;
