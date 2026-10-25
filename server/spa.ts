import fastifyStatic from '@fastify/static';
import type { FastifyInstance } from 'fastify';

/**
 * Serves the built frontend from `root`. Browser navigations (requests that
 * accept HTML and have no file extension) always get `index.html`, so client
 * routes such as `/bookings` work even though the API uses the same paths.
 */
export function registerSpa(app: FastifyInstance, root: string): void {
  void app.register(fastifyStatic, { root });

  app.addHook('onRequest', async (request, reply) => {
    const path = request.url.split('?')[0];
    const isNavigation =
      request.method === 'GET' &&
      request.headers.accept?.includes('text/html') &&
      !path.split('/').pop()?.includes('.');

    if (isNavigation) {
      return reply.sendFile('index.html');
    }
  });
}
