import type { FastifyInstance } from 'fastify';
import type { Db } from '../db';
import type { EventTypeCreate } from '../domain/types';
import { createEventType, listEventTypes } from '../repositories/event-types';
import { eventTypeCreateSchema, eventTypeSchema } from '../schemas';

export function registerEventTypesRoutes(app: FastifyInstance, db: Db): void {
  app.get(
    '/event-types',
    {
      schema: {
        response: {
          200: { type: 'array', items: eventTypeSchema },
        },
      },
    },
    async () => listEventTypes(db),
  );

  app.post(
    '/event-types',
    {
      schema: {
        body: eventTypeCreateSchema,
        response: {
          201: eventTypeSchema,
        },
      },
    },
    async (request, reply) => {
      const eventType = createEventType(db, request.body as EventTypeCreate);
      reply.code(201);
      return eventType;
    },
  );
}
