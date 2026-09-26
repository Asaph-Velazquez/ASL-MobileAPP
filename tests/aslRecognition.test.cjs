const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function harness(fetch) {
  const timers = new Map();
  const source = fs.readFileSync(path.join(__dirname, '../services/aslRecognition.ts'), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const module = { exports: {} };
  new Function('module', 'exports', 'require', 'fetch', 'setTimeout', 'clearTimeout', code)(
    module, module.exports, () => ({ API_BASE_URL: 'https://test.invalid' }), fetch,
    (callback, ms) => { timers.set(1, { callback, ms }); return 1; }, id => timers.delete(id));
  return { predict: module.exports.predictSign, append: module.exports.appendRecognizedSign, timers };
}
const frames = Array.from({ length: 15 }, () => Array(63).fill(0.1));
const signal = () => new AbortController().signal;

test('prediction sends only coordinates and returns glosa/confidence', async () => {
  const result = { glosa: 'HELP', confidence: 0.9, index: 6 };
  const { predict, timers } = harness(async (url, request) => {
    assert.equal(url, 'https://test.invalid/api/asl/predict');
    assert.deepEqual(JSON.parse(request.body), { landmarks: frames });
    assert.equal(request.headers.Authorization, 'Bearer test-token');
    return { ok: true, json: async () => result };
  });
  assert.deepEqual(await predict(frames, 'test-token', signal()), result);
  assert.equal(timers.size, 0);
});

test('invalid sequences never reach the server', async () => {
  const { predict } = harness(() => assert.fail('unexpected fetch'));
  await assert.rejects(predict(frames.slice(0, 14), 'test', signal()), /INVALID LANDMARK/);
});

test('HTTP errors distinguish session, route, busy and backend failures', async () => {
  for (const [status, error] of [[401, /SESSION/], [403, /SESSION/], [404, /ROUTE/], [413, /413.*GATEWAY/], [429, /BUSY/], [502, /502/]]) {
    const { predict, timers } = harness(async () => ({ ok: false, status }));
    await assert.rejects(predict(frames, 'test', signal()), error);
    assert.equal(timers.size, 0);
  }
});

test('invalid model output is not accepted as a prediction', async () => {
  for (const result of [null, { glosa: '', confidence: 0.9 }, { glosa: 'HELP', confidence: 2 },
    { glosa: 'HELP', confidence: 0.9 }, { glosa: 'HELP', confidence: 0.9, index: -1 }]) {
    const { predict } = harness(async () => ({ ok: true, json: async () => result }));
    await assert.rejects(predict(frames, 'test', signal()), /INVALID MODEL RESPONSE/);
  }
});

function abortableFetch(_url, { signal }) {
  return new Promise((_resolve, reject) => {
    const abort = () => reject(new Error('Aborted'));
    if (signal.aborted) abort();
    else signal.addEventListener('abort', abort, { once: true });
  });
}

test('a stalled request times out and releases its timer', async () => {
  const { predict, timers } = harness(abortableFetch);
  const pending = predict(frames, 'test', signal());
  const rejection = assert.rejects(pending, /TIMED OUT/);
  assert.equal(timers.get(1).ms, 15000);
  timers.get(1).callback();
  await rejection;
  assert.equal(timers.size, 0);
});

test('closing camera cancels inference without reporting a timeout', async () => {
  const { predict, timers } = harness(abortableFetch);
  const controller = new AbortController();
  const pending = predict(frames, 'test', controller.signal);
  const rejection = assert.rejects(pending, /Aborted/);
  controller.abort();
  await rejection;
  assert.equal(timers.size, 0);
});

test('only predictions at or above 0.60 are appended to the editable draft', () => {
  const { append } = harness(() => assert.fail('unexpected fetch'));
  assert.equal(append('I NEED', { glosa: ' HELP ', confidence: 0.6, index: 6 }), 'I NEED HELP');
  assert.equal(append('user edit ', { glosa: 'HELP', confidence: 0.5999, index: 6 }), 'user edit ');
  assert.equal(append('', { glosa: 'HELP', confidence: 0.9, index: 6 }), 'HELP');
  assert.equal(append('HELP', { glosa: 'HELP', confidence: 0.9, index: 6 }), 'HELP HELP');
});

test('late JSON after cancellation cannot be accepted', async () => {
  const controller = new AbortController();
  const { predict, timers } = harness(async () => ({ ok: true, json: async () => {
    controller.abort();
    return { glosa: 'HELP', confidence: 0.9, index: 6 };
  } }));
  await assert.rejects(predict(frames, 'test', controller.signal), { name: 'AbortError' });
  assert.equal(timers.size, 0);
});

test('a full 60-frame mobile payload stays below the inference limit without losing precision', async () => {
  const fullSequence = Array.from({ length: 60 }, () => Array(63).fill(0.12345678912345678));
  const { predict } = harness(async (_url, request) => {
    const bytes = Buffer.byteLength(request.body);
    assert.ok(bytes > 10 * 1024 && bytes < 256 * 1024);
    assert.deepEqual(JSON.parse(request.body).landmarks, fullSequence);
    return { ok: true, json: async () => ({ glosa: ' FLOOR ', confidence: 0.9093, index: 0 }) };
  });
  assert.equal((await predict(fullSequence, 'test', signal())).glosa, 'FLOOR');
});
