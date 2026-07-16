/* Copyright (c) 2026 Kunal Suri (CEA LIST). Apache-2.0. */
import http from 'node:http';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const __dirname = path.dirname(scriptPath);
const root = path.join(__dirname, '..');
const PORT = Number(process.env.PORT) || 8000;
const HOST = '127.0.0.1';
const MAX_SAVE_BYTES = 1024 * 1024;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

function localHostname(hostHeader) {
  try {
    return new URL(`http://${hostHeader}`).hostname;
  } catch {
    return '';
  }
}

function isLoopbackHost(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

function isTrustedBrowserRequest(req) {
  const host = req.headers.host ?? '';
  if (!isLoopbackHost(localHostname(host))) return false;

  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    const parsed = new URL(origin);
    return isLoopbackHost(parsed.hostname) && parsed.host === host;
  } catch {
    return false;
  }
}

function isAllowedStaticPath(reqPath) {
  return (
    reqPath === '/tools/audit.html' ||
    reqPath === '/data/manifest.json' ||
    reqPath === '/data/data-provenance.md' ||
    /^\/data\/banks\/[a-z0-9-]+\.json$/.test(reqPath)
  );
}

function send(res, status, contentType, body) {
  res.writeHead(status, { 'Content-Type': contentType });
  res.end(body);
}

export function createAuditServer() {
  return http.createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');

    if (!isTrustedBrowserRequest(req)) {
      send(res, 403, 'text/plain; charset=utf-8', 'Forbidden');
      return;
    }

    if (req.method === 'POST' && req.url === '/api/save') {
      if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] ?? '')) {
        send(res, 415, 'application/json; charset=utf-8', JSON.stringify({ error: 'Content-Type must be application/json' }));
        return;
      }

      let body = '';
      let bodyBytes = 0;
      let tooLarge = false;
      req.on('data', (chunk) => {
        bodyBytes += chunk.length;
        if (bodyBytes > MAX_SAVE_BYTES) {
          tooLarge = true;
          return;
        }
        body += chunk.toString();
      });
      req.on('end', async () => {
        if (tooLarge) {
          send(res, 413, 'application/json; charset=utf-8', JSON.stringify({ error: 'Request body too large' }));
          return;
        }
        try {
          const data = JSON.parse(body);
          if (typeof data.markdown !== 'string' || data.markdown.length === 0) {
            send(res, 400, 'application/json; charset=utf-8', JSON.stringify({ error: 'Missing markdown content' }));
            return;
          }

          const provenancePath = path.join(root, 'data', 'data-provenance.md');
          await fs.writeFile(provenancePath, data.markdown, 'utf8');
          send(
            res,
            200,
            'application/json; charset=utf-8',
            JSON.stringify({ success: true, message: 'Saved successfully to data-provenance.md' }),
          );
        } catch (err) {
          console.error('Save error:', err);
          send(res, 400, 'application/json; charset=utf-8', JSON.stringify({ error: 'Invalid save request' }));
        }
      });
      return;
    }

    if (req.method === 'GET' && req.url === '/api/reload-provenance') {
      send(res, 200, 'application/json; charset=utf-8', JSON.stringify({ success: true }));
      return;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      send(res, 405, 'text/plain; charset=utf-8', 'Method Not Allowed');
      return;
    }

    let reqPath;
    try {
      reqPath = decodeURIComponent(new URL(req.url ?? '/', `http://${HOST}`).pathname);
    } catch {
      send(res, 400, 'text/plain; charset=utf-8', 'Bad Request');
      return;
    }
    if (reqPath === '/' || reqPath === '/audit.html') reqPath = '/tools/audit.html';

    if (!isAllowedStaticPath(reqPath)) {
      send(res, 404, 'text/plain; charset=utf-8', 'Not Found');
      return;
    }

    const filePath = path.resolve(root, `.${reqPath}`);
    const relative = path.relative(root, filePath);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      send(res, 403, 'text/plain; charset=utf-8', 'Forbidden');
      return;
    }

    try {
      if (!existsSync(filePath) || !(await fs.stat(filePath)).isFile()) {
        send(res, 404, 'text/plain; charset=utf-8', 'Not Found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      const content = req.method === 'HEAD' ? undefined : await fs.readFile(filePath);
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] ?? 'application/octet-stream' });
      res.end(content);
    } catch (err) {
      console.error('File serve error:', err);
      send(res, 500, 'text/plain; charset=utf-8', 'Internal Server Error');
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  const server = createAuditServer();
  server.listen(PORT, HOST, () => {
    console.log(`\n🔍 Audit workbench (local only) at http://localhost:${PORT}/`);
    console.log('👉 Provenance ground truth: data/data-provenance.md\n');
  });
}
