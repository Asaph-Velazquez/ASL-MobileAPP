const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function auth(fetch) {
  const timers = new Map();
  let id = 0;
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../services/auth.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const mod = { exports: {} };
  new Function('module', 'exports', 'require', 'fetch', 'setTimeout', 'clearTimeout', code)(
    mod, mod.exports, () => ({ API_BASE_URL: 'http://local-gateway:8080' }), fetch,
    (fn, delay) => { timers.set(++id, { fn, delay }); return id; }, value => timers.delete(value),
  );
  return { ...mod.exports, timers };
}

test('QR validation uses the local gateway and preserves a valid response', async () => {
  const a = auth(async (url, options) => {
    assert.equal(url, 'http://local-gateway:8080/api/auth/validate');
    assert.equal(options.headers.Authorization, 'Bearer sample-qr');
    assert.ok(options.signal instanceof AbortSignal);
    return { ok: true, json: async () => ({ valid: true, roomNumber: 'TEST', expiresAt: 'later' }) };
  });
  assert.equal((await a.validateToken('sample-qr')).valid, true);
  assert.equal(a.timers.size, 0);
});

test('network errors are distinguishable from rejected QR tokens in both auth APIs', async () => {
  const offline = auth(async () => { throw new TypeError('Network request failed'); });
  assert.deepEqual(await offline.validateToken('sample'), { valid: false, isNetworkError: true, reason: 'NETWORK_ERROR' });
  assert.equal((await offline.validateTokenWithNetworkStatus('sample')).isNetworkError, true);
  assert.equal(offline.timers.size, 0);
  const rejected = auth(async () => ({ ok: false, status: 401, json: async () => ({ reason: 'stay_expired' }) }));
  const result = await rejected.validateToken('sample');
  assert.equal(result.reason, 'stay_expired');
  assert.equal(result.status, 401);
  assert.notEqual(result.isNetworkError, true);
});

test('middleware errors and unavailable servers preserve their HTTP classification', async () => {
  for (const [status, body] of [[401, { error: 'Invalid token' }], [503, { message: 'Unavailable' }]]) {
    const a = auth(async () => ({ ok: false, status, json: async () => body }));
    const result = await a.validateToken('sample');
    assert.equal(result.status, status);
    assert.equal(result.reason, body.error || body.message);
  }
  const invalid = auth(async () => ({ ok: true, json: async () => { throw Error('HTML not JSON'); } }));
  assert.equal((await invalid.validateToken('sample')).status, 502);
  assert.equal((await invalid.validateToken('sample')).isNetworkError, true);
  assert.equal((await invalid.validateTokenWithNetworkStatus('sample')).isNetworkError, true);
});

test('stalled validation aborts after ten seconds and releases its timer', async () => {
  const a = auth((_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(new Error('aborted')));
  }));
  const pending = a.validateToken('sample');
  assert.equal(a.timers.get(1).delay, 10000);
  a.timers.get(1).fn();
  assert.equal((await pending).reason, 'NETWORK_TIMEOUT');
  assert.equal(a.timers.size, 0);
});

test('CPM_MOV_011: throttling and unavailable servers never masquerade as a revoked stay', async () => {
  for (const status of [429, 500, 503]) {
    const a = auth(async () => ({ ok: false, status, json: async () => ({ error: 'Temporarily unavailable' }) }));
    assert.equal((await a.validateTokenWithNetworkStatus('sample')).isNetworkError, true);
  }
  for (const status of [401, 403]) {
    const a = auth(async () => ({ ok: false, status, json: async () => ({ error: 'Stay revoked' }) }));
    assert.equal((await a.validateTokenWithNetworkStatus('sample')).isNetworkError, false);
  }
});
