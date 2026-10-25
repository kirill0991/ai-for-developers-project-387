import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

/**
 * E2E tests run against the production build: one Fastify process serves the
 * API and the SPA, as in the Docker image. The in-memory database starts empty
 * on every run.
 */
export default defineConfig({
  testDir: 'e2e',
  // Bookings conflict across event types, so tests share one calendar and run in order.
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run build && npm run start:server',
    url: `http://127.0.0.1:${PORT}/event-types`,
    env: { PORT: String(PORT), HOST: '127.0.0.1', DB_PATH: ':memory:' },
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
