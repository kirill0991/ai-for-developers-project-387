import react from '@vitejs/plugin-react';
import type { ProxyOptions } from 'vite';
import { configDefaults, defineConfig } from 'vitest/config';

/**
 * Proxies API calls to the backend. The SPA also has a `/bookings` page, so
 * browser navigations (which accept HTML) fall through to the dev server.
 */
const api: ProxyOptions = {
  target: 'http://localhost:3000',
  bypass: (req) => (req.headers.accept?.includes('text/html') ? '/index.html' : undefined),
};

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/event-types': api,
      '/slots': api,
      '/bookings': api,
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    // Playwright specs run separately (`npm run test:e2e`).
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
});
