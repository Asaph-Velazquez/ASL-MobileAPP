const test = require('node:test');
const assert = require('node:assert/strict');
const { load, hooks, jsx, native, find, nodes, flush } = require('./helpers/render.cjs');

function screen({ saved = false, granted = false, fail = false, result = { valid: false, status: 401 } } = {}) {
  const h = hooks(), calls = [];
  const permission = { granted, canAskAgain: true };
  const { default: Login } = load('app/login.tsx', {
    react: h.react, 'react/jsx-runtime': jsx, 'react-native': native,
    'expo-camera': { CameraView: 'CameraView', useCameraPermissions: () => [permission, async () => {
      calls.push('camera'); return permission;
    }] },
    '@expo/vector-icons': { MaterialIcons: 'MaterialIcons' },
    'expo-router': { router: { replace() {} } },
    '@/components/BothComponents/auth-provider': { useAuth: () => ({ login() {} }) },
    '@/services/auth': { validateToken: async () => result },
    '@/constants/network': { API_BASE_URL: 'http://localhost:8080' },
    '@/components/BothComponents/TermsConsentModal': { TermsConsentModal: 'PolicyDocument' },
    '@/services/consent': { hasPrivacyConsent: async () => saved, recordPrivacyConsent: async status => {
      calls.push(status); if (fail) throw Error('offline');
    } },
  });
  return { calls, permission, render() { h.reset(); const tree = Login(); h.effects(); return tree; } };
}

test('CPM_MOV_001: opening and closing the complete policy never accepts or requests camera', async () => {
  const s = screen(); s.render(); await flush();
  let tree = s.render();
  assert.equal(find(tree, 'privacy-allow').props.disabled, true);
  find(tree, 'privacy-policy').props.onPress();
  tree = s.render();
  nodes(tree, n => n.type === 'PolicyDocument')[0].props.onClose();
  assert.equal(nodes(s.render(), n => n.type === 'PolicyDocument').length, 0);
  assert.deepEqual(s.calls, []);
});

for (const [result, message] of [
  [{ valid: false, isNetworkError: true }, 'SERVER CONNECTION FAILED'],
  [{ valid: false, status: 503 }, 'SERVER UNAVAILABLE'],
  [{ valid: false, status: 401 }, 'INVALID ROOM QR CODE'],
]) test(`QR validation still distinguishes ${message} after the consent gate`, async () => {
  const s = screen({ saved: true, granted: true, result }); s.render(); await flush();
  await nodes(s.render(), n => n.type === 'CameraView')[0].props.onBarcodeScanned({ data: 'sample-qr' });
  assert.match(JSON.stringify(s.render()), new RegExp(message));
});

test('CPM_MOV_001: explicit checked ALLOW launches permission and saves before mounting the scanner', async () => {
  const s = screen({ granted: true }); s.render(); await flush();
  find(s.render(), 'privacy-checkbox').props.onPress();
  await find(s.render(), 'privacy-allow').props.onPress();
  assert.deepEqual(s.calls, ['camera', 'requested', 'granted']);
  assert.equal(nodes(s.render(), n => n.type === 'CameraView').length, 1);
});

test('CPM_MOV_001: API failure keeps scanner blocked even if OS grants camera', async () => {
  const s = screen({ granted: true, fail: true }); s.render(); await flush();
  find(s.render(), 'privacy-checkbox').props.onPress();
  await find(s.render(), 'privacy-allow').props.onPress();
  assert.ok(find(s.render(), 'privacy-gate'));
  assert.equal(nodes(s.render(), n => n.type === 'CameraView').length, 0);
});

test('CPM_MOV_001: persisted acceptance bypasses the first screen on a new mount', async () => {
  const s = screen({ saved: true, granted: true }); s.render(); await flush();
  assert.equal(nodes(s.render(), n => n.type === 'CameraView').length, 1);
  assert.deepEqual(s.calls, []);
});

test('CPM_MOV_001: denial keeps policy acceptance and records the denied permission', async () => {
  const s = screen(); s.render(); await flush();
  find(s.render(), 'privacy-checkbox').props.onPress();
  await find(s.render(), 'privacy-allow').props.onPress();
  assert.deepEqual(s.calls, ['camera', 'requested', 'denied']);
  assert.equal(find(s.render(), 'privacy-gate'), undefined);
  assert.equal(nodes(s.render(), n => n.type === 'CameraView').length, 0);
});

test('CPM_MOV_001: consent client persists only acknowledged version and retries with the same installation id', async t => {
  const storage = new Map(), sent = [];
  const { recordPrivacyConsent, hasPrivacyConsent, POLICY_VERSION } = load('services/consent.ts', {
    '@react-native-async-storage/async-storage': { default: {
      getItem: async key => storage.get(key) ?? null, setItem: async (key, value) => storage.set(key, value),
    } }, '@/constants/network': { API_BASE_URL: 'http://localhost:8080' },
  });
  let ok = false;
  t.mock.method(global, 'fetch', async (_, options) => {
    sent.push(JSON.parse(options.body));
    return { ok, json: async () => ({ accepted: true, policyVersion: POLICY_VERSION }) };
  });
  await assert.rejects(recordPrivacyConsent('requested'));
  assert.equal(await hasPrivacyConsent(), false);
  ok = true;
  await recordPrivacyConsent('granted');
  assert.equal(await hasPrivacyConsent(), true);
  assert.equal(sent[0].installationId, sent[1].installationId);
  assert.match(sent[0].installationId, /^[a-f0-9]{32}$/);
});
