/**
 * server.js — Lightweight JSON REST API server for OMS
 * No npm packages required. Uses only built-in Node.js modules.
 * Mimics json-server behaviour for /orders endpoints.
 *
 * Usage:  node server.js
 * API:    http://localhost:3000/orders
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');
const url  = require('url');

const PORT    = 3000;
const DB_FILE = path.join(__dirname, 'db.json');

// ── helpers ──────────────────────────────────────────────────────────────────

function readDb() {
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type':                'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch (e) { reject(e); }
    });
  });
}

// ── router ───────────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  const parsed  = url.parse(req.url, true);
  const parts   = parsed.pathname.replace(/^\/|\/$/g, '').split('/');
  const method  = req.method.toUpperCase();

  // CORS pre-flight
  if (method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  // Only handle /orders routes
  if (parts[0] !== 'orders') {
    sendJson(res, 404, { error: 'Not Found' });
    return;
  }

  const id = parts[1] ? parseInt(parts[1], 10) : null;
  const db = readDb();

  try {
    // GET /orders
    if (method === 'GET' && !id) {
      return sendJson(res, 200, db.orders);
    }

    // GET /orders/:id
    if (method === 'GET' && id) {
      const order = db.orders.find(o => o.id === id);
      return order
        ? sendJson(res, 200, order)
        : sendJson(res, 404, { error: 'Order not found' });
    }

    // POST /orders
    if (method === 'POST') {
      const body = await readBody(req);
      const maxId = db.orders.reduce((m, o) => Math.max(m, o.id || 0), 0);
      const newOrder = { id: maxId + 1, ...body };
      db.orders.push(newOrder);
      writeDb(db);
      return sendJson(res, 201, newOrder);
    }

    // PUT /orders/:id
    if (method === 'PUT' && id) {
      const idx = db.orders.findIndex(o => o.id === id);
      if (idx === -1) return sendJson(res, 404, { error: 'Order not found' });
      const body = await readBody(req);
      db.orders[idx] = { ...body, id };
      writeDb(db);
      return sendJson(res, 200, db.orders[idx]);
    }

    // DELETE /orders/:id
    if (method === 'DELETE' && id) {
      const idx = db.orders.findIndex(o => o.id === id);
      if (idx === -1) return sendJson(res, 404, { error: 'Order not found' });
      db.orders.splice(idx, 1);
      writeDb(db);
      return sendJson(res, 200, {});
    }

    sendJson(res, 405, { error: 'Method Not Allowed' });
  } catch (err) {
    console.error(err);
    sendJson(res, 500, { error: 'Internal Server Error' });
  }
});

server.listen(PORT, () => {
  console.log(`\n  ✅  OMS API Server running at http://localhost:${PORT}`);
  console.log(`      GET    http://localhost:${PORT}/orders`);
  console.log(`      POST   http://localhost:${PORT}/orders`);
  console.log(`      PUT    http://localhost:${PORT}/orders/:id`);
  console.log(`      DELETE http://localhost:${PORT}/orders/:id\n`);
});
