const http = require('http');
const crypto = require('crypto');
const { URL } = require('url');

const PORT = Number(process.env.PORT || 3000);
const MAX_BODY = 32768;
const channels = new Map();
let seq = 0;

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,X-Bridge-Key');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
}
function json(res, code, body) {
  cors(res);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}
function validChannel(v) { return /^[A-Za-z0-9_-]{16,160}$/.test(v || ''); }
function hash(v) { return crypto.createHash('sha256').update(String(v)).digest('hex'); }
function safeText(v, max = 120) { return String(v ?? '').replace(/[\r\n\t]/g, ' ').slice(0, max); }
function finite(v) { const n = Number(v); return Number.isFinite(n) ? n : null; }
function getState(channel) {
  let s = channels.get(channel);
  if (!s) { s = { writeHash: null, latest: null, clients: new Set(), lastPostAt: 0 }; channels.set(channel, s); }
  return s;
}
function envelope(quote) {
  return { id: `${Date.now()}-${++seq}`, serverReceivedAt: Date.now(), quote };
}
function broadcast(state, env) {
  const line = `id: ${env.id}\nevent: message\ndata: ${JSON.stringify(env)}\n\n`;
  for (const res of [...state.clients]) {
    try { res.write(line); } catch { state.clients.delete(res); }
  }
}
function validateQuote(j) {
  const bid = finite(j?.bid), ask = finite(j?.ask);
  if (!(bid > 0) || !(ask >= bid)) return { ok: false, error: 'invalid bid/ask' };
  const symbol = safeText(j?.symbol || 'BTCUSD', 32).toUpperCase();
  if (symbol !== 'BTCUSD') return { ok: false, error: 'symbol must be BTCUSD' };
  let positionSide = safeText(j?.positionSide || 'FLAT', 12).toUpperCase();
  if (!['FLAT', 'BUY', 'SELL', 'MIXED'].includes(positionSide)) positionSide = 'FLAT';
  const positionEntry = finite(j?.positionEntry);
  const positionCount = Math.max(0, Math.trunc(finite(j?.positionCount) || 0));
  return { ok: true, quote: {
    symbol,
    bid,
    ask,
    spread: ask - bid,
    broker: safeText(j?.broker || 'Pepperstone', 100),
    server: safeText(j?.server || '', 100),
    positionSide,
    positionEntry: positionEntry && positionEntry > 0 ? positionEntry : null,
    positionCount,
    source: 'MT5_EA',
    eaTime: safeText(j?.eaTime || '', 64)
  }};
}

const server = http.createServer((req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  let url;
  try { url = new URL(req.url, `http://${req.headers.host || 'localhost'}`); }
  catch { return json(res, 400, { error: 'bad url' }); }
  if (req.method === 'GET' && url.pathname === '/health') return json(res, 200, { ok: true, service: 'BTC Oracle MT5 relay', time: Date.now() });

  const m = url.pathname.match(/^\/(push|quote|stream)\/([A-Za-z0-9_-]+)$/);
  if (!m || !validChannel(m[2])) return json(res, 404, { error: 'not found' });
  const op = m[1], channel = m[2], state = getState(channel);

  if (op === 'push' && req.method === 'POST') {
    const key = String(req.headers['x-bridge-key'] || '');
    if (key.length < 24) return json(res, 401, { error: 'missing/short bridge key' });
    const incomingHash = hash(key);
    if (state.writeHash && state.writeHash !== incomingHash) return json(res, 403, { error: 'wrong bridge key' });
    let raw = '';
    req.setEncoding('utf8');
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > MAX_BODY) req.destroy();
    });
    req.on('end', () => {
      let body;
      try { body = JSON.parse(raw || '{}'); } catch { return json(res, 400, { error: 'invalid json' }); }
      const v = validateQuote(body);
      if (!v.ok) return json(res, 400, { error: v.error });
      if (!state.writeHash) state.writeHash = incomingHash;
      const env = envelope(v.quote);
      state.latest = env;
      state.lastPostAt = Date.now();
      broadcast(state, env);
      return json(res, 200, { ok: true, id: env.id, serverReceivedAt: env.serverReceivedAt });
    });
    req.on('error', () => { if (!res.headersSent) json(res, 400, { error: 'request error' }); });
    return;
  }

  if (op === 'quote' && req.method === 'GET') {
    if (!state.latest) return json(res, 404, { error: 'waiting for MT5 EA quote' });
    return json(res, 200, state.latest);
  }

  if (op === 'stream' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'X-Accel-Buffering': 'no'
    });
    res.write(`event: ready\ndata: ${JSON.stringify({ ok: true, channel })}\n\n`);
    if (state.latest) res.write(`id: ${state.latest.id}\nevent: message\ndata: ${JSON.stringify(state.latest)}\n\n`);
    state.clients.add(res);
    req.on('close', () => state.clients.delete(res));
    return;
  }

  return json(res, 405, { error: 'method not allowed' });
});

setInterval(() => {
  const now = Date.now();
  for (const [channel, state] of channels) {
    for (const res of [...state.clients]) {
      try { res.write(`: keepalive ${now}\n\n`); } catch { state.clients.delete(res); }
    }
    if (!state.clients.size && state.lastPostAt && now - state.lastPostAt > 24 * 3600 * 1000) channels.delete(channel);
  }
}, 15000).unref();

server.listen(PORT, '0.0.0.0', () => console.log(`BTC Oracle relay listening on ${PORT}`));
