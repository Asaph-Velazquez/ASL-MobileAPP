const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const compiled = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../services/videoSession.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const loaded = { exports: {} };
new Function('module', 'exports', compiled)(loaded, loaded.exports);
const { createVideoSession } = loaded.exports;
const flush = () => new Promise(resolve => setImmediate(resolve));

function fixture() {
  let released = false;
  const events = [];
  const loads = [];
  const player = {
    pause() { assert.equal(released, false); events.push('pause'); },
    release() { assert.equal(released, false); released = true; events.push('release'); },
    replaceAsync(source) {
      assert.equal(released, false);
      events.push(source);
      return new Promise((resolve, reject) => loads.push({ source, resolve, reject }));
    },
  };
  return { session: createVideoSession(player), loads, events };
}

test('disposal waits for the native view to detach and releases exactly once', async () => {
  const { session, events } = fixture();
  session.setAttached(true);
  session.dispose();
  await flush();
  assert.deepEqual(events, ['pause']);
  session.setAttached(false);
  session.dispose();
  session.setAttached(false);
  await flush();
  assert.deepEqual(events, ['pause', 'release']);
  assert.equal(await session.load(1), false);
});

test('closing during a load keeps the player alive until the load settles', async () => {
  const { session, loads, events } = fixture();
  session.setAttached(true);
  const pending = session.load(1);
  await flush();
  session.setAttached(false);
  session.dispose();
  await flush();
  assert.equal(events.includes('release'), false);
  loads[0].resolve();
  assert.equal(await pending, false);
  await flush();
  assert.equal(events.at(-1), 'release');
  assert.equal(session.ready, false);
});

test('rapid source changes serialize loading and discard superseded requests', async () => {
  const { session, loads, events } = fixture();
  const first = session.load(1);
  await flush();
  const second = session.load(2);
  const third = session.load(3);
  assert.equal(loads.length, 1);
  loads[0].resolve();
  assert.equal(await first, false);
  assert.equal(await second, false);
  await flush();
  assert.deepEqual(loads.map(load => load.source), [1, 3]);
  loads[1].resolve();
  assert.equal(await third, true);
  assert.equal(session.ready, true);
  assert.equal(events.includes('release'), false);
  session.dispose();
  await flush();
});

test('a failed source can be replaced and still releases on close', async () => {
  const { session, loads, events } = fixture();
  const first = session.load(1);
  const failure = assert.rejects(first, /unavailable/);
  await flush();
  loads[0].reject(new Error('unavailable'));
  await failure;
  const second = session.load(2);
  await flush();
  loads[1].resolve();
  assert.equal(await second, true);
  session.dispose();
  await flush();
  assert.equal(events.at(-1), 'release');
});

test('effect cleanup and setup create independent live sessions', async () => {
  const old = fixture();
  old.session.setAttached(true);
  old.session.dispose();
  const next = fixture();
  next.session.setAttached(true);
  old.session.setAttached(false);
  await flush();
  assert.equal(old.session.active, false);
  assert.equal(old.events.at(-1), 'release');
  assert.equal(next.session.active, true);
  assert.deepEqual(next.events, []);
  next.session.dispose();
  next.session.setAttached(false);
  await flush();
});

test('a queued source never starts after closing, even when the active load rejects', async () => {
  const { session, loads, events } = fixture();
  const first = session.load(1);
  const failure = assert.rejects(first, /cancelled/);
  await flush();
  const second = session.load(2);
  session.dispose();
  loads[0].reject(new Error('cancelled'));
  await failure;
  assert.equal(await second, false);
  await flush();
  assert.equal(loads.length, 1);
  assert.equal(events.at(-1), 'release');
});
