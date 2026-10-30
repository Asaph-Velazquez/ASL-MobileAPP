const test = require('node:test');
const assert = require('node:assert/strict');
const { load, hooks, jsx, native, nodes } = require('./helpers/render.cjs');

const { ASLPreviewButton } = load('components/ASLComponents/ASLPreviewButton.tsx', {
  react: { useRef: initial => ({ current: initial }) },
  'react/jsx-runtime': jsx, 'react-native': native,
});
const { ASLGridView } = load('components/ASLComponents/ASLGridView.tsx', {
  'react/jsx-runtime': jsx, 'react-native': native,
  '@/hooks/use-theme-color': { useThemeColor: () => '#fff' },
  './ASLCardIcon': { ASLCardIcon: 'Icon' }, './ASLPreviewButton': { ASLPreviewButton },
});
const pressable = node => node.type(node.props);
const hold = button => {
  button.props.onPressIn();
  button.props.onLongPress();
  button.props.onPressOut?.();
  button.props.onPress();
};
const tap = button => {
  button.props.onPressIn();
  button.props.onPressOut?.();
  button.props.onPress();
};

test('CPM_MOV_017: a long preview releases without selecting; a following tap selects exactly once', () => {
  const events = [];
  const button = ASLPreviewButton({
    onPreviewStart: () => events.push('preview'), onPreviewEnd: () => events.push('restore'),
    onPress: () => events.push('select'),
  });
  hold(button);
  assert.deepEqual(events, ['preview', 'restore']);
  tap(button);
  assert.deepEqual(events, ['preview', 'restore', 'preview', 'restore', 'select']);
  button.props.onPressIn();
  button.props.onPressOut();
  assert.equal(events.filter(event => event === 'select').length, 1);
});

test('CPM_MOV_017: preview state belongs to each option; screen-reader activation remains available', () => {
  const selected = [];
  const a = ASLPreviewButton({ onPress: () => selected.push('A') });
  const b = ASLPreviewButton({ onPress: () => selected.push('B') });
  a.props.onPressIn(); a.props.onLongPress();
  tap(b);
  a.props.onPressOut?.(); a.props.onPress();
  assert.deepEqual(selected, ['B']);
  a.props.onPressIn(); a.props.onLongPress(); a.props.onPressOut?.();
  a.props.onAccessibilityAction({ nativeEvent: { actionName: 'activate' } });
  assert.deepEqual(selected, ['B', 'A']);
});

for (const [media, option] of [
  ['video', { videoSource: 12 }], ['gif', { gifSource: 'food.gif' }],
]) test(`CPM_MOV_017: the shared grid previews the correct ${media} and restores its default without selecting`, () => {
  const previews = [], selected = [];
  const grid = ASLGridView({ options: [{ id: 'FOOD', ...option }],
    onPreviewChange: (...args) => previews.push(args), onOptionPress: value => selected.push(value),
    defaultGif: 'welcome.mp4', defaultMediaType: 'video',
  });
  const button = pressable(nodes(grid, node => node.type === ASLPreviewButton)[0]);
  hold(button);
  assert.deepEqual(previews, [[option.videoSource ?? option.gifSource, media], ['welcome.mp4', 'video']]);
  assert.deepEqual(selected, []);
  tap(button);
  assert.equal(selected[0].id, 'FOOD');
});

function page(relativePath) {
  const h = hooks(), navigation = [];
  const { default: Screen } = load(relativePath, {
    react: h.react, 'react/jsx-runtime': jsx,
    'react-native': { ...native, Image: 'Image', Modal: 'Modal', useWindowDimensions: () => ({ width: 390, height: 780 }) },
    'react-native-safe-area-context': { useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) },
    'expo-router': { router: { push: route => navigation.push(route) } },
    '@expo/vector-icons': { MaterialIcons: 'MaterialIcons', MaterialCommunityIcons: 'MaterialCommunityIcons' },
    'expo-camera': { useCameraPermissions: () => [{ granted: true }, async () => ({ granted: true })] },
    '@/hooks/use-theme-color': { useThemeColor: () => '#fff' },
    '@/styles/common': { commonStyles: { container: { flex: 1 } } },
    '@/components/BothComponents/themed-view': { ThemedView: 'ThemedView' },
    '@/components/ASLComponents/GifPreviewContainer': { GifPreviewContainer: 'Preview' },
    '@/components/ASLComponents/ASLGridView': { ASLGridView },
    '@/components/ASLComponents/ASLPreviewButton': { ASLPreviewButton },
    '@/components/ASLComponents/ASLCardIcon': { ASLCardIcon: 'Icon' },
    '@/components/ASLComponents/ASLVideoPreview': { ASLVideoPreview: 'Video' },
    '@/components/ASLComponents/asl-petition-modal': { ASLPetitionModal: 'PetitionModal' },
    '@/components/ASLComponents/ASLTaxiRequestModal': { ASLTaxiRequestModal: 'TaxiModal' },
    '@/components/BothComponents/MobilityNoticeModal': { MobilityNoticeModal: 'NoticeModal' },
    '@/components/BothComponents/ScreenHeader': { ScreenHeader: 'ScreenHeader' },
    '@/services/mobilityNotice': { hasSeenMobilityNotice: async () => true, markMobilityNoticeSeen: async () => {} },
    '@/hooks/usePetitionSender': { usePetitionSender: () => ({ sendPetition() { throw Error('preview must never send'); }, isLoading: false }) },
  });
  return { navigation, render() { h.reset(); return Screen(); } };
}

for (const [name, optionId] of [
  ['ASLHome', 'SERVICES'], ['ASLRoomS', 'FOOD'], ['ASLReportProblem', 'OTHER PROBLEM'], ['ASLMovilidad', 'VALET PARKING'],
]) test(`CPM_MOV_017: ${name} keeps a long preview on the current screen and a short tap opens the option`, () => {
  const s = page(`app/ASL/${name}.tsx`);
  let tree = s.render();
  const grid = nodes(tree, node => node.type === ASLGridView)[0];
  const buttonNode = nodes(ASLGridView(grid.props), node => node.type === ASLPreviewButton)
    .find(node => node.props.accessibilityLabel === optionId);
  const button = pressable(buttonNode);
  hold(button);
  tree = s.render();
  assert.deepEqual(s.navigation, []);
  assert.equal(nodes(tree, node => node.type === 'PetitionModal' && node.props.visible).length, 0);
  assert.equal(nodes(tree, node => node.type === 'Preview')[0].props.gifSource, grid.props.defaultGif);
  tap(button);
  tree = s.render();
  assert.equal(s.navigation.length + nodes(tree, node => node.type === 'PetitionModal' && node.props.visible).length, 1);
});

test('CPM_MOV_017: hotel-service cards restore their video without opening details after a long press', () => {
  const s = page('app/ASL/ASLServices.tsx');
  const button = pressable(nodes(s.render(), node => node.type === ASLPreviewButton)[0]);
  button.props.onPressIn();
  assert.match(nodes(s.render(), node => node.type === 'Video')[0].props.source, /00008\.mp4$/);
  button.props.onLongPress(); button.props.onPressOut(); button.props.onPress();
  assert.equal(nodes(s.render(), node => node.type === 'Modal')[0].props.visible, false);
  assert.match(nodes(s.render(), node => node.type === 'Video')[0].props.source, /00006\.mp4$/);
  tap(button);
  assert.equal(nodes(s.render(), node => node.type === 'Modal')[0].props.visible, true);
});

test('CPM_MOV_017: reusable GridCard uses the same preview-only gesture', () => {
  const events = [];
  const { GridCard } = load('components/ASLComponents/GridCard.tsx', {
    'react/jsx-runtime': jsx, 'react-native': native,
    '@/hooks/use-theme-color': { useThemeColor: () => '#fff' },
    './ASLCardIcon': { ASLCardIcon: 'Icon' }, './ASLPreviewButton': { ASLPreviewButton },
  });
  const tree = GridCard({ option: { id: 'FOOD' }, onPress: () => events.push('select'),
    onPressIn: option => events.push(option.id), onPressOut: () => events.push('restore'),
  });
  const button = pressable(tree);
  hold(button);
  assert.deepEqual(events, ['FOOD', 'restore']);
  tap(button);
  assert.equal(events.at(-1), 'select');
});
