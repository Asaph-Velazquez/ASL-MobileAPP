const test = require('node:test');
const assert = require('node:assert/strict');
const { socketHarness } = require('./helpers/socketHarness.cjs');

const request = { type: 'room-service', roomNumber: '10', guestName: 'QA', message: 'WATER', priority: 'medium' };
const initialize = socket => {
  socket.open();
  socket.receive({ type: 'INIT_REQUESTS', payload: { requests: [] } });
};

test('CPM_CNX_003: automatic recovery continues beyond five failures with capped backoff', () => {
  const h = socketHarness();
  const delays = [];
  for (let failure = 0; failure < 8; failure++) {
    h.connections.at(-1).close();
    assert.equal(h.timers.size, 1);
    delays.push(h.tick());
    assert.equal(h.connections.length, failure + 2);
  }
  assert.deepEqual(delays, [1000, 2000, 4000, 8000, 16000, 30000, 30000, 30000]);
  initialize(h.connections.at(-1));
  assert.equal(h.state[0], true);
  assert.equal(h.timers.size, 0);
  h.unmount();
});

test('CPM_CNX_003: offline and uninitialized sockets cannot send or create pending history', async () => {
  const h = socketHarness();
  assert.equal(h.api.enviarPeticion(request), false);
  await assert.rejects(h.api.enviarPeticionConfirmada(request), /NO CONNECTION/);
  h.connections[0].open();
  assert.equal(h.api.enviarPeticion(request), false);
  assert.deepEqual(h.state[1], []);
  assert.deepEqual(h.connections[0].sent, []);
  initialize(h.connections[0]);
  const sent = h.api.enviarPeticionConfirmada(request);
  const message = h.connections[0].sent[0];
  assert.equal(h.connections[0].sent.length, 1);
  h.connections[0].receive({ type: 'TRANSPORT_RESULT', payload: { operationId: message.operationId, ok: true } });
  await sent;
  assert.equal(h.state[1].length, 1);
  h.unmount();
});

test('CPM_CNX_003: reconnect and retry keep a persisted request id without duplicating history', async () => {
  const h = socketHarness();
  initialize(h.connections[0]);
  const first = h.api.enviarPeticionConfirmada(request);
  const initial = h.connections[0].sent[0];
  const rejected = assert.rejects(first, /CONNECTION LOST/);
  h.connections[0].close();
  await rejected;
  assert.equal(h.state[0], false);
  assert.equal(h.state[1].length, 0);
  h.tick();
  initialize(h.connections[1]);
  const retry = h.api.enviarPeticionConfirmada(request);
  const message = h.connections[1].sent[0];
  assert.equal(message.payload.id, initial.payload.id);
  h.connections[1].receive({ type: 'TRANSPORT_RESULT', payload: { operationId: message.operationId, ok: true } });
  await retry;
  h.connections[1].receive({ type: 'NEW_REQUEST', payload: { ...message.payload, requestId: message.payload.id } });
  assert.equal(h.state[1].length, 1);
  assert.equal(new Set(h.connections.flatMap(socket => socket.sent).map(item => item.payload.id)).size, 1);
  h.unmount();
});

test('CPM_CNX_003: a stalled handshake times out and manual retry immediately replaces its socket', () => {
  const h = socketHarness();
  const stale = h.connections[0];
  const staleMessage = stale.onmessage;
  const staleClose = stale.onclose;
  assert.equal(h.tick(), 10000);
  assert.equal(stale.readyState, 3);
  assert.equal(h.tick(), 1000);
  assert.equal(h.connections.length, 2);
  h.api.reconectar();
  assert.equal(h.connections.length, 3);
  initialize(h.connections[2]);
  staleClose();
  staleMessage({ data: JSON.stringify({ type: 'INIT_REQUESTS', payload: { requests: [{ requestId: 'stale' }] } }) });
  assert.equal(h.state[0], true);
  assert.deepEqual(h.state[1], []);
  assert.equal(h.timers.size, 0);
  h.unmount();
});

test('CPM_CNX_003: returning to the app replaces a half-open connection and unmount stops recovery', async () => {
  const h = socketHarness();
  initialize(h.connections[0]);
  h.listeners.get('change')('active');
  assert.equal(h.connections.length, 2);
  assert.equal(h.connections[0].readyState, 3);
  initialize(h.connections[1]);
  const pending = h.api.enviarPeticionConfirmada(request);
  const rejected = assert.rejects(pending, /CONNECTION LOST/);
  const staleClose = h.connections[1].onclose;
  h.unmount();
  await rejected;
  staleClose();
  h.api.reconectar();
  assert.equal(h.connections.length, 2);
  assert.equal(h.timers.size, 0);
  assert.equal(h.listeners.size, 0);
  assert.equal(h.connections[1].readyState, 3);
});

test('CPM_CNX_003: revocation before initialization removes every timeout and ignores late messages', () => {
  let revoked = 0;
  const h = socketHarness(() => revoked++);
  const staleMessage = h.connections[0].onmessage;
  h.connections[0].receive({ type: 'SESSION_REVOKED' });
  staleMessage({ data: JSON.stringify({ type: 'INIT_REQUESTS', payload: { requests: [] } }) });
  assert.equal(h.state[0], false);
  assert.equal(revoked, 1);
  assert.equal(h.timers.size, 0);
  h.listeners.get('change')('active');
  assert.equal(h.connections.length, 1);
  h.unmount();
});
