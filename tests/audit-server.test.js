/* Copyright (c) 2026 Kunal Suri (CEA LIST). Apache-2.0. */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createAuditServer } from '../tools/audit-server.mjs';

let server;
let baseUrl;

beforeAll(async () => {
  server = createAuditServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  if (!server) return;
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

describe('local audit server boundaries', () => {
  it('serves the audit workbench with defensive response headers', async () => {
    const response = await fetch(`${baseUrl}/`);

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.headers.get('x-frame-options')).toBe('DENY');
    expect(await response.text()).toContain('AI Quiz Database Audit & Verification');
  });

  it('does not expose arbitrary repository files', async () => {
    const response = await fetch(`${baseUrl}/package.json`);
    expect(response.status).toBe(404);
  });

  it('rejects cross-origin save attempts', async () => {
    const response = await fetch(`${baseUrl}/api/save`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'https://attacker.example',
      },
      body: JSON.stringify({ markdown: '# replaced' }),
    });

    expect(response.status).toBe(403);
  });

  it('requires JSON for local save requests', async () => {
    const response = await fetch(`${baseUrl}/api/save`, {
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      body: '# replaced',
    });

    expect(response.status).toBe(415);
  });
});
