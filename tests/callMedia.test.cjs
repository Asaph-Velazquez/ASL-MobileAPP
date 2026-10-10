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

function harness({ focused = true, width = 390, left = 0, right = 0, sessionFailures = [] } = {}) {
  const effects = [], state = [], sockets = [], peers = [], timers = new Map();
  let timerId = 0;
  let sessionRequests = 0;
  const timerDelays = new Map();
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
        connectionState: 'new',
        offers: [],
        async createOffer(options) { this.offers.push(options); return { type: 'offer', sdp: 'restart' }; },
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
    requestCallSession: async () => {
      sessionRequests++;
      const failure = sessionFailures.shift();
      if (failure) throw failure;
      return { callId: 'qa-call', callServerUrl: 'ws://test', callToken: 'qa' };
    },
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
    (callback, delay) => {
      const id = ++timerId;
      timerDelays.set(id, delay);
      timers.set(id, () => { timers.delete(id); timerDelays.delete(id); callback(); });
      return id;
    }, id => { timers.delete(id); timerDelays.delete(id); },
  );
  const tree = module.exports.default();
  const cleanups = effects.map(fn => fn());
  return { tree, sockets, peers, state, permission, capture, stream, timers,
    runTimer(delay) {
      const id = [...timerDelays.entries()].find(([, value]) => value === delay)?.[0];
      assert.ok(id, `expected timer with ${delay}ms delay`);
      timers.get(id)();
    },
    cleanup: () => cleanups.forEach(fn => fn?.()),
    counts: () => ({ permissionRequests, captures, stops, sessionRequests }),
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

test('server errors schedule recovery after ten seconds without requesting media', async () => {
  const h = harness();
  await flush();
  h.sockets[0].onopen();
  assert.equal(h.sockets[0].sent[0].type, 'CALL_REQUEST');
  h.sockets[0].receive('CALL_ERROR', { reason: 'call_processing_failed' });
  assert.ok(h.state.includes('error'));
  assert.equal(h.timers.size, 1);
  assert.equal(h.counts().permissionRequests, 0);
  h.runTimer(10000);
  await flush();
  assert.equal(h.sockets.length, 2);
  h.cleanup();
});

test('unavailable interpreters are polled every ten seconds on the same session until pending', async () => {
  const h = harness();
  await flush();
  const socket = h.sockets[0];
  socket.onopen();
  for (let attempt = 0; attempt < 3; attempt++) {
    socket.receive('CALL_UNAVAILABLE');
    assert.equal(h.timers.size, 1);
    h.runTimer(10000);
  }
  assert.equal(socket.sent.filter(message => message.type === 'CALL_REQUEST').length, 4);
  assert.equal(h.counts().sessionRequests, 1);
  assert.equal(h.counts().permissionRequests, 0);
  socket.receive('CALL_PENDING');
  assert.equal(h.timers.size, 0);
  h.cleanup();
});

test('a disconnected socket reconnects in place and stale sockets cannot end the new attempt', async () => {
  const h = harness();
  await flush();
  const socket = h.sockets[0];
  const staleMessage = socket.onmessage;
  socket.onopen();
  socket.receive('CALL_PENDING');
  socket.close();
  h.runTimer(10000);
  await flush();
  assert.equal(h.sockets.length, 2);
  const newSocket = h.sockets[1];
  newSocket.onopen();
  newSocket.receive('CALL_PENDING');
  staleMessage({ data: JSON.stringify({ type: 'CALL_ENDED', payload: { callId: 'qa-call' } }) });
  assert.ok(h.state.includes('pending'));
  assert.ok(!h.state.includes('ended'));
  h.cleanup();
  assert.equal(h.timers.size, 0);
});

test('network-ended calls retry while completed calls remain ended', async () => {
  for (const [reason, retries] of [['network_error', true], ['completed', false]]) {
    const h = harness();
    await flush();
    h.sockets[0].receive('CALL_ENDED', { endReason: reason });
    if (retries) {
      h.runTimer(10000);
      await flush();
      assert.equal(h.sockets.length, 2);
    } else {
      assert.ok(h.state.includes('ended'));
      assert.equal(h.timers.size, 0);
      h.sockets[0].close();
      assert.equal(h.timers.size, 0);
    }
    h.cleanup();
  }
});

test('ending during availability wait clears retries and sends guest cancellation', async () => {
  const h = harness();
  await flush();
  const socket = h.sockets[0];
  socket.receive('CALL_UNAVAILABLE');
  function findControls(node) {
    if (!node || typeof node !== 'object') return null;
    if (node.props?.onEndCall) return node.props;
    for (const child of Object.values(node)) {
      const result = findControls(child);
      if (result) return result;
    }
    return null;
  }
  findControls(h.tree).onEndCall();
  assert.equal(h.timers.size, 0);
  assert.ok(socket.sent.some(message => message.type === 'CALL_ENDED'));
  assert.equal(h.sockets.length, 1);
  h.cleanup();
});

test('lost media renegotiates ICE while preserving the local camera stream', async () => {
  const h = harness();
  await flush();
  const socket = h.sockets[0];
  socket.receive('CALL_ACCEPTED');
  h.permission.resolve({ granted: true });
  await flush();
  h.capture.resolve(h.stream);
  await flush();
  const peer = h.peers[0];
  peer.connectionState = 'disconnected';
  peer.handlers.onConnectionStateChange('disconnected');
  h.runTimer(10000);
  await flush();
  assert.deepEqual(peer.offers, [{ iceRestart: true }]);
  assert.ok(socket.sent.some(message => message.type === 'WEBRTC_OFFER'));
  assert.equal(h.counts().captures, 1);
  assert.equal(h.counts().stops, 0);
  peer.connectionState = 'connected';
  peer.handlers.onConnectionStateChange('connected');
  assert.equal(h.timers.size, 0);
  h.cleanup();
});

test('expired guest sessions do not retry while transient session failures do', async () => {
  for (const [failure, retries] of [[Object.assign(new Error('expired'), { status: 401 }), false], [new Error('network'), true]]) {
    const h = harness({ sessionFailures: [failure] });
    await flush();
    assert.equal(h.counts().sessionRequests, 1);
    if (retries) {
      h.runTimer(10000);
      await flush();
      assert.equal(h.counts().sessionRequests, 2);
    } else assert.equal(h.timers.size, 0);
    h.cleanup();
  }
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
