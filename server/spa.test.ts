// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildApp } from './app';
import { createDb } from './db';

const HTML = { accept: 'text/html,application/xhtml+xml,*/*;q=0.8' };

describe('SPA serving', () => {
  let root: string;
  let app: ReturnType<typeof buildApp>;

  beforeEach(async () => {
    root = mkdtempSync(join(tmpdir(), 'spa-'));
    mkdirSync(join(root, 'assets'));
    writeFileSync(join(root, 'index.html'), '<!doctype html><div id="root"></div>');
    writeFileSync(join(root, 'assets', 'app.js'), 'console.log(1);');

    app = buildApp({ db: createDb(':memory:'), staticDir: root });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
    rmSync(root, { recursive: true, force: true });
  });

  it.each(['/', '/types/new', '/booking/abc', '/bookings'])(
    'serves index.html for a browser navigation to %s',
    async (url) => {
      const response = await app.inject({ method: 'GET', url, headers: HTML });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toContain('text/html');
      expect(response.body).toContain('<div id="root">');
    },
  );

  it('serves static assets', async () => {
    const response = await app.inject({ method: 'GET', url: '/assets/app.js' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('console.log(1);');
  });

  it('keeps API responses for non-HTML requests to the same paths', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/bookings',
      headers: { accept: 'application/json' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([]);
  });
});
