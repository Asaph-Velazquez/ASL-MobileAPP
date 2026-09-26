const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../services/signSequence.ts'), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const moduleRef = { exports: {} };
new Function('module', 'exports', code)(moduleRef, moduleRef.exports);
const { SignSequenceCollector } = moduleRef.exports;
const frame = Array(63).fill(0.1);

test('capture progress reports frame count, exit gate and reset', () => {
  const collector = new SignSequenceCollector();
  collector.feed(frame, 1000, false);
  assert.deepEqual(collector.getSnapshot(), { frameCount: 1, waitingForExit: false });
  for (let i = 1; i < 60; i++) collector.feed(frame, 1000 + i * 33, false);
  assert.deepEqual(collector.getSnapshot(), { frameCount: 0, waitingForExit: true });
  collector.reset();
  assert.deepEqual(collector.getSnapshot(), { frameCount: 0, waitingForExit: false });
});

test('short signs are discarded; 15-frame signs submit after 500ms of no hand', () => {
  const collector = new SignSequenceCollector();
  for (let i = 0; i < 14; i++) assert.equal(collector.feed(frame, 1000 + i * 33, false), null);
  assert.equal(collector.feed(null, 2000, false), null);
  for (let i = 0; i < 15; i++) assert.equal(collector.feed(frame, 3000 + i * 33, false), null);
  assert.equal(collector.feed(null, 4000, false).length, 15);
  assert.equal(collector.feed(null, 4100, false), null);
});

test('60 frames submit once and require hand to leave before the next gesture', () => {
  const collector = new SignSequenceCollector();
  for (let i = 0; i < 59; i++) assert.equal(collector.feed(frame, 1000 + i * 33, false), null);
  assert.equal(collector.feed(frame, 3000, false).length, 60);
  for (let i = 0; i < 60; i++) assert.equal(collector.feed(frame, 3100 + i * 33, false), null);
  assert.equal(collector.feed(null, 6000, false), null);
  for (let i = 0; i < 15; i++) collector.feed(frame, 7000 + i * 33, false);
  assert.equal(collector.feed(null, 8000, false).length, 15);
});

test('busy recognition and reset do not leak old frames', () => {
  const collector = new SignSequenceCollector();
  for (let i = 0; i < 25; i++) collector.feed(frame, 1000 + i * 33, true);
  assert.equal(collector.feed(null, 3000, false), null);
  for (let i = 0; i < 20; i++) collector.feed(frame, 4000 + i * 33, false);
  collector.reset();
  assert.equal(collector.feed(null, 6000, false), null);
});
