const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function socketHarness() {
  const state = [];
  const effects = [];
  const timers = new Map();
  let timerId = 0;
  const react = {
    useState(initial) { const i = state.push(initial) - 1; return [initial, update => { state[i] = typeof update === 'function' ? update(state[i]) : update; }]; },
    useRef: current => ({ current }), useCallback: callback => callback,
    useEffect: effect => effects.push(effect),
  };
  let connection;
  class Socket {
    static OPEN = 1;
    readyState = 1;
    sent = [];
    constructor() { connection = this; }
    send(data) { this.sent.push(JSON.parse(data)); }
    receive(message) { this.onmessage({ data: JSON.stringify(message) }); }
  }
  const source = fs.readFileSync(path.join(__dirname, '../services/socket.tsx'), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  new Function('module', 'exports', 'require', 'WebSocket', 'setTimeout', 'clearTimeout', code)(module, module.exports,
    name => name === 'react' ? react : { HOTEL_WS_URL: 'ws://test.invalid' }, Socket,
    callback => { timers.set(++timerId, callback); return timerId; }, id => timers.delete(id));
  const api = module.exports.useWebSocketMobile('test-token');
  effects.forEach(effect => effect());
  return { api, connection, state, timers };
}
const request = { type: 'services', roomNumber: '101', guestName: 'Test', message: 'TAXI: Test trip', priority: 'medium', details: { serviceType: 'taxi' } };

test('taxi is not added before server acknowledgement and retries reuse the request ID', async () => {
  const { api, connection, state, timers } = socketHarness();
  const first = api.enviarTaxiConfirmado(request);
  const original = connection.sent[0];
  assert.equal(original.type, 'NEW_REQUEST');
  assert.equal(state[1].length, 0);
  const rejected = assert.rejects(first, /CONFIRMATION NOT RECEIVED/);
  [...timers.values()][0]();
  await rejected;
  const retry = api.enviarTaxiConfirmado(request);
  assert.equal(connection.sent[1].payload.id, original.payload.id);
  connection.receive({ type: 'TRANSPORT_RESULT', payload: { operationId: connection.sent[1].operationId, ok: true } });
  await retry;
  assert.equal(state[1].length, 1);
  connection.receive({ type: 'NEW_REQUEST', payload: { ...original.payload, requestId: original.payload.id, status: 'in-progress', details: { serviceType: 'taxi', transportProposals: { revision: 1, options: [] } } } });
  assert.equal(state[1][0].status, 'in-progress');
  assert.equal(state[1][0].details.transportProposals.revision, 1);
  connection.receive({ type: 'NEW_REQUEST', payload: { ...original.payload, id: 'other-guest', requestId: 'other-guest' } });
  assert.equal(state[1].length, 1);
});
test('acceptance sends IDs only, ignores unrelated results and propagates stale rejection', async () => {
  const { api, connection, timers } = socketHarness();
  const pending = api.acceptTransportOption('taxi-1', 2, 'option-1');
  const message = connection.sent[0];
  assert.deepEqual(message.payload, { id: 'taxi-1', revision: 2, optionId: 'option-1' });
  connection.receive({ type: 'TRANSPORT_RESULT', payload: { operationId: 'unrelated', ok: true } });
  assert.equal(timers.size, 1);
  const rejected = assert.rejects(pending, /Stale/);
  connection.receive({ type: 'TRANSPORT_RESULT', payload: { operationId: message.operationId, ok: false, error: 'Stale revision' } });
  await rejected;
  assert.equal(timers.size, 0);
});

test('delayed broadcasts cannot replace newer persisted proposal or status data', () => {
  const { connection, state } = socketHarness();
  connection.receive({ type: 'INIT_REQUESTS', payload: { requests: [{ ...request, requestId: 'taxi-1', timestamp: '2026-09-01', status: 'pending', mutationVersion: 2 }] } });
  assert.equal(state[0], true);
  connection.receive({ type: 'UPDATE_REQUEST', payload: { id: 'taxi-1', status: 'in-progress', mutationVersion: 4, details: { transportProposals: { revision: 2, options: [] } } } });
  connection.receive({ type: 'UPDATE_REQUEST', payload: { id: 'taxi-1', status: 'pending', mutationVersion: 3, details: { transportProposals: { revision: 1, options: [] } } } });
  assert.equal(state[1][0].details.transportProposals.revision, 2);
  assert.equal(state[1][0].status, 'in-progress');
});
