const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const themeModule = { exports: {} };
const themeCode = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../constants/theme.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
new Function('module', 'exports', 'require', themeCode)(themeModule, themeModule.exports, () => ({ Platform: { select: values => values.default } }));
const { Colors } = themeModule.exports;

function loadHistory(mode, scheme = 'light') {
  const imports = {
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    react: { useState: initial => [initial, () => {}], useMemo: fn => fn() },
    'react-native': { StyleSheet: { create: value => value }, View: 'View', Text: 'Text', TouchableOpacity: 'TouchableOpacity' },
    '@expo/vector-icons': { MaterialIcons: 'MaterialIcons', MaterialCommunityIcons: 'MaterialCommunityIcons' },
    '@/hooks/use-theme-color': { useThemeColor: (overrides, name) => overrides[scheme] || Colors[scheme][name] },
    '../BothComponents/confirmation-modal': { ConfirmationModal: 'ConfirmationModal' },
    '../BothComponents/rating-modal': { RatingModal: 'RatingModal' },
    '../BothComponents/TransportHistoryEntry': { TransportHistoryEntry: 'TransportHistoryEntry' },
    '../../assets/gifs/ComidaGif.gif': 1,
  };
  const name = `${mode}PetitionHistory`;
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, `../components/${mode}Components/${name}.tsx`), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const mod = { exports: {} };
  new Function('module', 'exports', 'require', code)(mod, mod.exports, name => imports[name]);
  return mod.exports[name];
}

for (const mode of ['ASL', 'Text']) {
  for (const scheme of ['light', 'dark']) {
    test(`${mode} call icon adapts to ${scheme} with visible contrast`, () => {
      const tree = loadHistory(mode, scheme)({ peticiones: [{ id: 'qa', type: 'interpreter-follow-up', status: 'completed', message: 'Call completed' }], onCancelar() {} });
      let icon;
      function visit(node) {
        if (!node || typeof node !== 'object') return;
        if (node.type === 'MaterialIcons' && node.props?.name === 'perm-phone-msg') icon = node;
        Object.values(node).forEach(visit);
      }
      visit(tree);
      assert.equal(icon.props.color, scheme === 'dark' ? '#99F6E4' : '#0F766E');
      const rgb = hex => hex.slice(1).match(/../g).map(value => parseInt(value, 16) / 255);
      const foreground = rgb(icon.props.color), card = rgb(Colors[scheme].card);
      // ASL adds a 0x22-alpha tint behind the icon; text mode uses the card directly.
      const background = mode === 'ASL' ? card.map((value, i) => value * (1 - 34 / 255) + foreground[i] * 34 / 255) : card;
      const luminance = channels => channels.map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
        .reduce((sum, value, i) => sum + value * [0.2126, 0.7152, 0.0722][i], 0);
      const a = luminance(foreground), b = luminance(background);
      assert.ok((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) >= 3, 'icon contrast must be at least 3:1');
    });
  }
  test(`${mode} history uses PermPhoneMsg for call follow-ups regardless of report text or status`, () => {
    const History = loadHistory(mode);
    for (const message of ['Food: room assistance', 'Taxi requested during call', '']) {
      for (const status of ['pending', 'in-progress', 'completed', 'cancelled']) {
        const tree = History({ peticiones: [{ id: 'qa-report', type: 'interpreter-follow-up', status, message, timestamp: '2026-09-30T12:00:00Z' }], onCancelar() {} });
        const icons = [];
        function visit(node) {
          if (!node || typeof node !== 'object') return;
          if (node.type === 'MaterialIcons' && node.props?.name === 'perm-phone-msg') icons.push(node);
          Object.values(node).forEach(visit);
        }
        visit(tree);
        assert.equal(icons.length, 1);
      }
    }
  });
}
