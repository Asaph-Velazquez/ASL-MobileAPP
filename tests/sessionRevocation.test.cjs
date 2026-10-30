const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { socketHarness } = require('./helpers/socketHarness.cjs');

test('CPM_MOV_011: revocation immediately disables sending, ends auth and never reconnects', async () => {
  let revoked = 0;
  const h = socketHarness(() => { revoked++; });
  const socket = h.connections[0];
  socket.open();
  socket.receive({ type: 'INIT_REQUESTS', payload: { requests: [] } });
  assert.equal(h.state[0], true);
  const pending = h.api.enviarPeticionConfirmada({ type: 'room-service', message: 'WATER', guestName: 'QA', roomNumber: '10', priority: 'medium' });
  const rejected = assert.rejects(pending, /CONNECTION LOST/);
  socket.receive({ type: 'SESSION_REVOKED' });
  await rejected;
  assert.equal(revoked, 1);
  assert.equal(h.state[0], false);
  assert.equal(h.api.enviarPeticion({ type: 'room-service', message: 'WATER', guestName: 'QA', roomNumber: '10', priority: 'medium' }), false);
  assert.equal(h.timers.size, 0);
  h.api.reconectar();
  assert.equal(h.connections.length, 1);
});

function authProviderHarness(result, connected = false) {
  const state = [];
  const effects = [];
  const intervals = [];
  const removed = [];
  const initial = [true, false, false, false, 'QA', '10', 'guest-token', '2099-01-01', connected];
  const react = {
    createContext: () => ({ Provider: {} }), createElement: () => null,
    useContext: () => null,
    useState() { const i = state.length; state.push(initial[i]); return [initial[i], value => { state[i] = value; }]; },
    useEffect: effect => effects.push(effect),
  };
  const imports = {
    react: { ...react, default: react },
    '@react-native-async-storage/async-storage': { default: { removeItem: async key => removed.push(key) } },
    'expo-router': { useRouter: () => ({}) },
    '@/services/auth': { validateTokenWithNetworkStatus: async () => result },
    '@/services/mobilityNotice': { resetMobilityNotice: async () => {} },
  };
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../components/BothComponents/auth-provider.tsx'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React },
  }).outputText;
  const mod = { exports: {} };
  new Function('module', 'exports', 'require', 'setInterval', 'clearInterval', code)(
    mod, mod.exports, name => imports[name],
    (callback, delay) => { intervals.push({ callback, delay }); return 1; }, () => {},
  );
  mod.exports.AuthProvider({ children: null });
  effects[1]();
  return { state, removed, intervals };
}

test('CPM_MOV_011: fallback checks within ten seconds and clears a revoked session', async () => {
  const { state, removed, intervals } = authProviderHarness({ isValid: false, isNetworkError: false });
  assert.equal(intervals[0].delay, 10000);
  await intervals[0].callback();
  assert.equal(state[0], false);
  assert.equal(state[6], null);
  assert.deepEqual(removed.sort(), ['auth_token', 'guest_name', 'room_number', 'session_expires']);
});

test('CPM_MOV_011: a healthy push connection keeps the original polling rate; transient failures preserve auth', async () => {
  const { state, removed, intervals } = authProviderHarness({ isValid: false, isNetworkError: true }, true);
  assert.equal(intervals[0].delay, 60000);
  await intervals[0].callback();
  assert.equal(state[0], true);
  assert.equal(state[2], true);
  assert.equal(removed.length, 0);
});
