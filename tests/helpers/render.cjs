const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');

function load(relativePath, imports = {}) {
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../..', relativePath), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const mod = { exports: {} };
  new Function('module', 'exports', 'require', code)(mod, mod.exports, name => {
    if (/\.(mp4|png)$/.test(name)) return name;
    assert.ok(name in imports, `Unexpected import ${name}`);
    return imports[name];
  });
  return mod.exports;
}
function hooks() {
  const state = [], effects = [];
  let cursor = 0;
  return {
    reset() { cursor = 0; },
    react: {
      useState(initial) {
        const i = cursor++;
        if (!(i in state)) state[i] = typeof initial === 'function' ? initial() : initial;
        return [state[i], next => { state[i] = typeof next === 'function' ? next(state[i]) : next; }];
      },
      useRef(initial) {
        const i = cursor++;
        return state[i] ?? (state[i] = { current: initial });
      },
      useEffect(callback, deps) {
        const i = cursor++;
        if (!(i in state) || !deps || deps.some((value, index) => value !== state[i]?.[index])) {
          state[i] = deps;
          effects.push(callback);
        }
      },
    },
    effects() { effects.splice(0).forEach(effect => effect()); },
  };
}
const jsx = { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
const native = Object.fromEntries(['View', 'Text', 'TouchableOpacity', 'ActivityIndicator', 'Pressable', 'ScrollView', 'RefreshControl'].map(n => [n, n]));
native.StyleSheet = { create: value => value };
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
const find = (tree, id) => nodes(tree, node => node.props.testID === id)[0];
const flush = () => new Promise(resolve => setImmediate(resolve));
module.exports = { load, hooks, jsx, native, nodes, find, flush };
