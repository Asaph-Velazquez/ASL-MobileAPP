const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function loadStage(platform = 'android') {
  const imports = {
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    'react-native': { Platform: { OS: platform }, StyleSheet: { create: value => value }, View: 'View', Text: 'Text' },
    '@/hooks/use-theme-color': { useThemeColor: () => '#000' },
    'react-native-webrtc': { RTCView: 'RTCView' },
  };
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../components/ASLComponents/GuestCallVideoStage.tsx'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const mod = { exports: {} };
  new Function('module', 'exports', 'require', code)(mod, mod.exports, name => {
    assert.ok(!(platform === 'web' && name === 'react-native-webrtc'), 'web must not load the native module');
    return imports[name];
  });
  return mod.exports.GuestCallVideoStage;
}
const props = { phaseLabel: 'Connected', phaseTone: 'success', mediaStatusLabel: 'connected', mediaMessage: 'Ready',
  remoteStreamUrl: 'remote', localStreamUrl: 'local', showLocalVideo: true, remotePlaceholder: 'Waiting', localPlaceholder: 'Camera off' };
const flatten = style => Object.assign({}, ...[style].flat().filter(Boolean));
function nodes(tree, predicate) {
  const found = [];
  function visit(node) {
    if (!node || typeof node !== 'object') return;
    if (node.props && predicate(node)) found.push(node);
    Object.values(node).forEach(visit);
  }
  visit(tree);
  return found;
}

test('wide videos have equal-sized panels, full framing and unchanged stream identity', () => {
  const Stage = loadStage();
  const narrow = Stage(props), wide = Stage({ ...props, sideBySide: true });
  const panels = nodes(wide, n => n.props.testID === 'call-video-panels')[0];
  assert.equal(flatten(panels.props.style).flexDirection, 'row');
  const children = panels.props.children;
  assert.deepEqual(children.map(n => flatten(n.props.style).flex), [1, 1]);
  assert.deepEqual(children.map(n => flatten(n.props.children[1].props.style).aspectRatio), [4 / 3, 4 / 3]);
  const videos = nodes(wide, n => n.type === 'RTCView');
  assert.equal(videos.length, 2);
  assert.ok(videos.every(n => n.props.objectFit === 'contain'));
  assert.deepEqual(videos.map(n => n.props.streamURL), nodes(narrow, n => n.type === 'RTCView').map(n => n.props.streamURL));
  assert.equal(nodes(narrow, n => n.props.testID === 'call-video-panels')[0].props.children.length, 2);
  assert.equal(flatten(nodes(narrow, n => n.props.testID === 'call-video-panels')[0].props.style).flexDirection, undefined);
});

test('wide placeholders keep both panels when camera is off or on the web', () => {
  for (const platform of ['android', 'web']) {
    const tree = loadStage(platform)({ ...props, sideBySide: true, showLocalVideo: false });
    assert.equal(nodes(tree, n => ['interpreter-video-panel', 'guest-video-panel'].includes(n.props.testID)).length, 2);
    assert.equal(nodes(tree, n => n.type === 'RTCView').length, platform === 'web' ? 0 : 1);
    assert.match(JSON.stringify(tree), /Camera off/);
  }
});
