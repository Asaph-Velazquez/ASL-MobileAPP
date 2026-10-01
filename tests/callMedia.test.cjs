const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const flush = () => new Promise(resolve => setImmediate(resolve));
function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}

function harness({ focused = true, width = 390, left = 0, right = 0 } = {}) {
  const effects = [], state = [], sockets = [], peers = [], timers = new Map();
  let timerId = 0;
  const permission = deferred(), capture = deferred();
  let permissionRequests = 0, captures = 0, stops = 0;
  const react = {
    useState(value) { const i = state.push(value) - 1; return [value, next => { state[i] = next; }]; },
    useRef: current => ({ current }), useMemo: fn => fn(), useEffect: fn => effects.push(fn),
  };
  class Socket {
    static OPEN = 1;
    readyState = 1;
    sent = [];
    constructor() { sockets.push(this); }
    send(value) { this.sent.push(JSON.parse(value)); }
    close() { this.readyState = 3; this.onclose?.(); }
    receive(type, payload = {}) { this.onmessage({ data: JSON.stringify({ type, payload: { callId: 'qa-call', ...payload } }) }); }
  }
  const stream = { toURL: () => 'local-camera', getTracks: () => [] };
  const media = {
    requestCallMediaPermissions: () => { permissionRequests++; return permission.promise; },
    createLocalMediaStream: () => { captures++; return capture.promise; },
    createGuestPeerConnection: handlers => {
      const peer = { handlers, remoteDescription: null, candidates: [],
        createAnswer: async () => ({ type: 'answer', sdp: 'answer' }),
        async setLocalDescription(sdp) { this.localDescription = sdp; },
      };
      peers.push(peer);
      return peer;
    },
    attachLocalStream: async () => {},
    applyRemoteDescription: async (peer, sdp) => { peer.remoteDescription = sdp; },
    applyIceCandidate: async (peer, candidate) => {
      assert.ok(peer.remoteDescription, 'ICE must wait for remote SDP');
      peer.candidates.push(candidate);
    },
    serializeSessionDescription: value => value,
    closePeerConnection: peer => { if (peer) peer.closed = true; },
    stopStream: value => { if (value === stream) stops++; },
  };
  const call = {
    requestCallSession: async () => ({ callId: 'qa-call', callServerUrl: 'ws://test', callToken: 'qa' }),
    buildCallSocketUrl: value => value,
    parseCallServerMessage: JSON.parse,
    sendCallServerMessage: (socket, value) => socket.send(JSON.stringify(value)),
  };
  const imports = {
    react,
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    'react-native': { StyleSheet: { create: value => value }, useWindowDimensions: () => ({ width, height: 844 }) },
    '@react-navigation/native': { useIsFocused: () => focused },
    'react-native-safe-area-context': { useSafeAreaInsets: () => ({ bottom: 0, left, right }) },
    'expo-router': { router: { back() {} } },
    '@/hooks/use-theme-color': { useThemeColor: () => '#000' },
    '@/components/BothComponents/auth-provider': { useAuth: () => ({ token: 'qa-token' }) },
    '@/services/call': call, '@/services/webrtc': media,
  };
  const source = fs.readFileSync(path.join(__dirname, '../app/ASL/CallScreen.tsx'), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  new Function('module', 'exports', 'require', 'WebSocket', 'setTimeout', 'clearTimeout', code)(
    module, module.exports, name => imports[name] || {}, Socket,
    callback => { timers.set(++timerId, callback); return timerId; }, id => timers.delete(id),
  );
  const tree = module.exports.default();
  const cleanups = effects.map(fn => fn());
  return { tree, sockets, peers, state, permission, capture, stream, timers,
    cleanup: () => cleanups.forEach(fn => fn?.()),
    counts: () => ({ permissionRequests, captures, stops }),
  };
}

test('acceptance and offer share one capture; early ICE waits for SDP', async () => {
  const h = harness();
  await flush();
  const socket = h.sockets[0];
  socket.receive('CALL_ACCEPTED');
  socket.receive('WEBRTC_ICE_CANDIDATE', { candidate: { candidate: 'early' } });
  socket.receive('WEBRTC_OFFER', { sdp: { type: 'offer', sdp: 'offer' } });
  await flush();
  assert.equal(h.counts().permissionRequests, 1);
  h.permission.resolve({ granted: true });
  await flush();
  assert.equal(h.counts().captures, 1);
  h.capture.resolve(h.stream);
  await flush();
  assert.equal(h.peers.length, 1);
  assert.equal(h.peers[0].candidates.length, 1);
  assert.ok(h.state.includes('local-camera'));
  assert.ok(socket.sent.some(item => item.type === 'WEBRTC_ANSWER'));
  h.cleanup();
  assert.equal(h.counts().stops, 1);
  assert.equal(socket.readyState, 3);
});

test('ending a call while capture is pending releases the late camera stream', async () => {
  const h = harness();
  await flush();
  h.sockets[0].receive('CALL_ACCEPTED');
  h.permission.resolve({ granted: true });
  await flush();
  h.sockets[0].receive('CALL_ENDED');
  h.capture.resolve(h.stream);
  await flush();
  assert.equal(h.counts().stops, 1);
  assert.equal(h.peers.length, 0);
  assert.ok(h.state.includes('ended'));
  assert.ok(!h.state.includes('local-camera'));
  h.cleanup();
});

test('a hidden call tab does not start a call or capture camera', async () => {
  const h = harness({ focused: false });
  await flush();
  assert.equal(h.sockets.length, 0);
  assert.equal(h.counts().permissionRequests, 0);
});

test('remote renderer is not given an audio-only URL before the video track arrives', async () => {
  const h = harness();
  await flush();
  h.sockets[0].receive('CALL_ACCEPTED');
  h.permission.resolve({ granted: true });
  await flush();
  h.capture.resolve(h.stream);
  await flush();
  const tracks = [{ id: 'audio', kind: 'audio' }];
  const remote = { toURL: () => 'remote-stream', getTracks: () => tracks,
    getVideoTracks: () => tracks.filter(track => track.kind === 'video') };
  h.peers[0].handlers.onRemoteStream(remote);
  assert.ok(!h.state.includes('remote-stream'));
  tracks.push({ id: 'video', kind: 'video' });
  h.peers[0].handlers.onRemoteStream(remote);
  assert.ok(h.state.includes('remote-stream'));
  h.cleanup();
});

test('call layout uses two columns on tablets/desktops and stacks on narrow windows', () => {
  for (const [width, left, expected] of [[390, 0, false], [767, 0, false], [768, 0, true], [1024, 0, true], [1440, 0, true], [800, 44, false]]) {
    const h = harness({ focused: false, width, left });
    const props = [];
    function visit(node) {
      if (!node || typeof node !== 'object') return;
      if (node.props) props.push(node.props);
      Object.values(node).forEach(visit);
    }
    visit(h.tree);
    assert.equal(props.find(p => 'sideBySide' in p).sideBySide, expected, `video layout at ${width}`);
    assert.equal(props.find(p => 'horizontal' in p).horizontal, expected, `controls at ${width}`);
  }
});

test('server errors end the connecting state without requesting media', async () => {
  const h = harness();
  await flush();
  h.sockets[0].onopen();
  assert.equal(h.sockets[0].sent[0].type, 'CALL_REQUEST');
  h.sockets[0].receive('CALL_ERROR', { reason: 'call_processing_failed' });
  assert.ok(h.state.includes('error'));
  assert.equal(h.timers.size, 0);
  assert.equal(h.counts().permissionRequests, 0);
  h.cleanup();
});

test('a silent call server times out instead of leaving the guest connecting forever', async () => {
  const h = harness();
  await flush();
  h.sockets[0].onopen();
  assert.equal(h.timers.size, 1);
  [...h.timers.values()][0]();
  assert.ok(h.state.includes('error'));
  assert.equal(h.sockets[0].readyState, 3);
  assert.equal(h.counts().permissionRequests, 0);
  h.cleanup();
});
