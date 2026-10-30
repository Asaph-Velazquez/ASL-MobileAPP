const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function load(relativePath, imports) {
  const source = fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const mod = { exports: {} };
  new Function('module', 'exports', 'require', code)(mod, mod.exports, name => {
    assert.ok(name in imports, `Unexpected import: ${name}`);
    return imports[name];
  });
  return mod.exports;
}

function makeHooks() {
  const state = [];
  let cursor = 0;
  return {
    reset() { cursor = 0; },
    react: { useState(initial) {
      const index = cursor++;
      if (!(index in state)) state[index] = initial;
      return [state[index], next => { state[index] = typeof next === 'function' ? next(state[index]) : next; }];
    } },
  };
}

const jsx = { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
const native = Object.fromEntries(['Modal', 'Pressable', 'ScrollView', 'Text', 'View', 'TouchableOpacity', 'ActivityIndicator'].map(name => [name, name]));
native.StyleSheet = { create: value => value };
function find(node, testID) {
  if (!node || typeof node !== 'object') return undefined;
  if (node.props?.testID === testID) return node;
  for (const child of Object.values(node)) {
    const found = find(child, testID);
    if (found) return found;
  }
}

test('Continue is disabled until terms are accepted, and the checkbox can revoke consent', () => {
  const hooks = makeHooks();
  const terms = load('data/termsAndConditions.ts', {});
  const { TermsConsentModal } = load('components/BothComponents/TermsConsentModal.tsx', {
    react: hooks.react,
    'react/jsx-runtime': jsx,
    'react-native': { ...native, useWindowDimensions: () => ({ height: 844, width: 390 }) },
    'react-native-safe-area-context': { useSafeAreaInsets: () => ({ top: 24, bottom: 34 }) },
    '@expo/vector-icons': { MaterialIcons: 'MaterialIcons' },
    '@/hooks/use-theme-color': { useThemeColor: () => '#111111' },
    '@/data/termsAndConditions': terms,
  });
  let continued = 0;
  const render = () => { hooks.reset(); return TermsConsentModal({ onContinue: () => continued++ }); };
  let tree = render();
  assert.equal(find(tree, 'terms-continue').props.disabled, true);
  find(tree, 'terms-continue').props.onPress();
  assert.equal(continued, 0);
  find(tree, 'terms-checkbox').props.onPress();
  tree = render();
  assert.equal(find(tree, 'terms-checkbox').props.accessibilityState.checked, true);
  assert.equal(find(tree, 'terms-continue').props.disabled, false);
  find(tree, 'terms-continue').props.onPress();
  assert.equal(continued, 1);
  find(tree, 'terms-checkbox').props.onPress();
  assert.equal(find(render(), 'terms-continue').props.disabled, true);
  assert.doesNotMatch(JSON.stringify(tree), /ACADEMIC PROPOSAL/);
});

test('bundled terms contain every section, clause and bullet without relying on ignored Docs', () => {
  const terms = load('data/termsAndConditions.ts', {});
  const text = terms.TERMS_AND_CONDITIONS;
  assert.equal((text.match(/^\*\*[IVX]+\./gm) || []).length, 4);
  assert.equal((text.match(/^\*\*\d+\./gm) || []).length, 10);
  assert.equal((text.match(/^- /gm) || []).length, 26);
  assert.match(text, /ACADEMIC PROPOSAL/);
  assert.match(text, /Only these coordinates are sent/);
  assert.match(text, /competent courts in Mexico City/);
});
