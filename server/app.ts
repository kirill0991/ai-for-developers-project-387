import cors from '@fastify/cors';
import Fastify, { type FastifyInstance } from 'fastify';
import { createDb, type Db } from './db';
import { registerBookingsRoutes } from './routes/bookings';
import { registerEventTypesRoutes } from './routes/event-types';
import { registerSlotsRoutes } from './routes/slots';
import { registerSpa } from './spa';

export interface BuildAppOptions {
  db?: Db;
  logger?: boolean;
  /** Current time source; injected in tests to keep fixed dates in the future. */
  now?: () => Date;
  /** Directory with the built frontend; when set, the server also serves the SPA. */
  staticDir?: string;
}

export function buildApp(options: BuildAppOptions = {}): FastifyInstance {
  const app = Fastify({ logger: options.logger ?? false });
  const db = options.db ?? createDb();
  const now = options.now ?? (() => new Date());

  void app.register(cors, { origin: true });

  if (options.staticDir) {
    registerSpa(app, options.staticDir);
  }

  registerEventTypesRoutes(app, db);
  registerSlotsRoutes(app, db, now);
  registerBookingsRoutes(app, db, now);

  return app;
}
