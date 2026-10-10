const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function load(fetch) {
  const timers = new Map();
  let id = 0;
  const source = fs.readFileSync(path.join(__dirname, '../services/call.ts'), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const module = { exports: {} };
  new Function('module', 'exports', 'require', 'fetch', 'setTimeout', 'clearTimeout', code)(
    module, module.exports, () => ({ API_BASE_URL: 'https://qa.invalid' }), fetch,
    (callback, delay) => { const key = ++id; timers.set(key, { callback, delay }); return key; },
    key => timers.delete(key),
  );
  return { request: module.exports.requestCallSession, timers };
}

test('call session authorization failures retain HTTP status and clear the deadline', async () => {
  const h = load(async () => ({ ok: false, status: 403, json: async () => ({ error: 'Stay inactive' }) }));
  await assert.rejects(h.request('qa'), error => error.status === 403);
  assert.equal(h.timers.size, 0);
});

test('a stalled session request aborts at fifteen seconds and releases its deadline', async () => {
  let signal;
  const h = load((_url, options) => new Promise((_resolve, reject) => {
    signal = options.signal;
    signal.addEventListener('abort', () => reject(new Error('Aborted')), { once: true });
  }));
  const request = h.request('qa');
  const timer = [...h.timers.values()][0];
  assert.equal(timer.delay, 15000);
  timer.callback();
  await assert.rejects(request);
  assert.equal(signal.aborted, true);
  assert.equal(h.timers.size, 0);
});

test('closing while session JSON is pending prevents accepting a late session', async () => {
  let resolve;
  const body = new Promise(done => { resolve = done; });
  const controller = new AbortController();
  const h = load(async () => ({ ok: true, status: 201, json: () => body }));
  const request = h.request('qa', controller.signal);
  await new Promise(done => setImmediate(done));
  controller.abort();
  resolve({ callId: 'late', callToken: 'qa' });
  await assert.rejects(request);
  assert.equal(h.timers.size, 0);
});
