const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const root = require('path').resolve(__dirname, '..');
const htmlPath = require('path').join(root, 'BTC_ORACLE_R6_12_0_GOD_FORENSIC_TRUTH.html');
const brainPath = process.argv[2];
const html = fs.readFileSync(htmlPath, 'utf8');
let source = html.replace(/^.*?<script>/s, '').replace(/<\/script>.*$/s, '');
source += '\n;globalThis.__api={state:STATE,resolveForecast,learnFromForecast,aggregateEvidence,selfCheck,els};';

const store = new Map();
if (brainPath && fs.existsSync(brainPath)) {
  const brain = JSON.parse(fs.readFileSync(brainPath, 'utf8'));
  store.set('btcOraclePrimeStateV1', JSON.stringify(brain.state || brain));
}

function element() {
  return {
    value: '', textContent: '', innerHTML: '', disabled: false, className: '', style: {}, dataset: {},
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    addEventListener() {}, click() {}, insertAdjacentHTML() {}, remove() {}
  };
}

const elements = new Map();
const document = {
  activeElement: null,
  querySelector(selector) { if (!elements.has(selector)) elements.set(selector, element()); return elements.get(selector); },
  querySelectorAll() { return []; },
  addEventListener() {},
  createElement() { return element(); }
};

const context = {
  console, document, window: {}, Math, Date, JSON, Promise, AbortController,
  setTimeout() { return 1; }, clearTimeout() {}, setInterval() { return 1; }, clearInterval() {},
  fetch() { return Promise.reject(new Error('offline test')); },
  Blob: function Blob() {}, URL: { createObjectURL() { return 'blob:test'; }, revokeObjectURL() {} },
  localStorage: {
    getItem(key) { return store.get(key) || null; },
    setItem(key, value) { store.set(key, value); return true; },
    removeItem(key) { store.delete(key); }
  },
  performance: { now: () => 0 }, navigator: {}, structuredClone
};
context.globalThis = context;
vm.runInNewContext(source, context, { timeout: 20000 });

const api = context.__api;
const state = api.state;
assert.equal(state.instrument, 'BTCUSD');
assert.equal(state.version, 60);
assert(state.godIntegrity);
assert.equal(state.godIntegrity.storageKey, 'btcOraclePrimeStateV1');

const now = Date.now();
const created = now - 3 * 3600000;
const forecast = {
  id: 'SMOKE', createdAt: new Date(created).toISOString(), horizon: 1, price: 100, spread: 15,
  direction: 'BUY', decision: 'BUY LIMIT', tradeType: 'FAST',
  plan: { id: 'SMOKE', validUntil: new Date(created + 20 * 60000).toISOString(), entry: 115, stop: 70, tp1: 125, tp2: 140, tp3: 160 }
};
const bars = [
  { time: created + 5 * 60000, open: 90, high: 105, low: 90, close: 100, isOpen: false },
  { time: created + 10 * 60000, open: 100, high: 130, low: 95, close: 128, isOpen: false },
  { time: created + 60 * 60000, open: 128, high: 130, low: 120, close: 128, isOpen: false }
];
const closed = api.resolveForecast(forecast, bars);
assert.equal(closed.outcome.status, 'TP1');
assert.equal(closed.outcome.strictEligible, true);
assert.equal(api.learnFromForecast(closed).strictLearned, true);

const open = api.resolveForecast({ ...forecast, id: 'OPEN', plan: { ...forecast.plan, id: 'OPEN', tp1: 180, tp2: 200, tp3: 220 } }, bars);
assert.equal(open.outcome.status, 'OPEN_AT_HORIZON');
assert.equal(open.outcome.strictEligible, false);
assert.equal(api.learnFromForecast(open).learned, false);

api.selfCheck();
assert(/ENGINE TESTS PASS/.test(api.els.selfCheck.textContent));
console.log('GOD_FORENSIC_REGRESSION_PASS');
