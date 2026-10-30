const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function socketHarness(onSessionRevoked) {
  const state = [];
  const effects = [];
  const timers = new Map();
  const connections = [];
  const listeners = new Map();
  let nextTimer = 0;
  const react = {
    useState(initial) {
      const i = state.push(initial) - 1;
      return [initial, update => { state[i] = typeof update === 'function' ? update(state[i]) : update; }];
    },
    useRef: current => ({ current }),
    useCallback: callback => callback,
    useEffect: effect => effects.push(effect),
  };
  class Socket {
    static OPEN = 1;
    static CONNECTING = 0;
    readyState = 0;
    sent = [];
    constructor() { connections.push(this); }
    open() { this.readyState = 1; this.onopen?.(); }
    send(data) { this.sent.push(JSON.parse(data)); }
    receive(message) { this.onmessage?.({ data: JSON.stringify(message) }); }
    close(code = 1000) { this.readyState = 3; this.onclose?.({ code }); }
  }
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../../services/socket.tsx'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const mod = { exports: {} };
  new Function('module', 'exports', 'require', 'WebSocket', 'setTimeout', 'clearTimeout', code)(
    mod, mod.exports, name => name === 'react' ? react : name === 'react-native'
      ? { AppState: { addEventListener: (event, callback) => { listeners.set(event, callback); return { remove: () => listeners.delete(event) }; } } }
      : { HOTEL_WS_URL: 'ws://test.invalid' }, Socket,
    (callback, delay) => { timers.set(++nextTimer, { callback, delay }); return nextTimer; },
    id => timers.delete(id),
  );
  const api = mod.exports.useWebSocketMobile('guest-token', onSessionRevoked);
  const cleanup = effects.map(effect => effect());
  return {
    api, state, connections, timers, listeners,
    unmount() { cleanup.forEach(fn => fn?.()); },
    tick() {
      const [id, timer] = timers.entries().next().value;
      timers.delete(id);
      timer.callback();
      return timer.delay;
    },
  };
}

module.exports = { socketHarness };
