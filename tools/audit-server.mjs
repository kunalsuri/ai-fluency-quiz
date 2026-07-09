/* Copyright (c) 2026 Kunal Suri (CEA LIST). Apache-2.0. */
import http from 'node:http';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const PORT = process.env.PORT || 8000;

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.md': 'text/markdown',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

const server = http.createServer(async (req, res) => {
  // CORS Headers for local development convenience
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Handle direct file saving POST request
  if (req.method === 'POST' && req.url === '/api/save') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        if (!data.markdown) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing markdown content' }));
          return;
        }

        const provenancePath = path.join(root, 'data', 'data-provenance.md');
        await fs.writeFile(provenancePath, data.markdown, 'utf8');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Saved successfully to data-provenance.md' }));
      } catch (err) {
        console.error("Save error:", err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Handle reload provenance
  if (req.method === 'GET' && req.url === '/api/reload-provenance') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // Serve static files. This server exists only for the local audit
  // workbench — the public site is built separately by Astro.
  let reqPath = req.url === '/' ? '/tools/audit.html' : req.url;
  reqPath = reqPath.split('?')[0]; // Strip query strings

  if (reqPath === '/audit.html') {
    reqPath = '/tools/audit.html';
  }

  const filePath = path.join(root, reqPath);

  // Prevent directory traversal attacks
  const relative = path.relative(root, filePath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  try {
    if (existsSync(filePath)) {
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        const indexFilePath = path.join(filePath, 'index.html');
        if (existsSync(indexFilePath)) {
          const content = await fs.readFile(indexFilePath);
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content);
          return;
        }
      } else {
        const ext = path.extname(filePath).toLowerCase();
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        const content = await fs.readFile(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
        return;
      }
    }
    
    // 404 Not Found
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  } catch (err) {
    console.error("File serve error:", err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`\n🔍 Audit workbench (local only) at http://localhost:${PORT}/`);
  console.log(`👉 Provenance ground truth: data/data-provenance.md\n`);
});
