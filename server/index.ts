import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildApp } from './app';
import { createDb } from './db';

const db = createDb(process.env.DB_PATH ?? 'calendar.db');

// Serve the built frontend when it exists (production build, Docker image).
const staticDir = resolve(process.env.STATIC_DIR ?? 'dist');
const app = buildApp({
  db,
  logger: true,
  staticDir: existsSync(staticDir) ? staticDir : undefined,
});

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '0.0.0.0';

app
  .listen({ port, host })
  .then(() => {
    app.log.info(`Сервер запущен на http://${host}:${port}`);
  })
  .catch((error) => {
    app.log.error(error);
    process.exit(1);
  });

const shutdown = () => {
  app.close().finally(() => {
    db.close();
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
