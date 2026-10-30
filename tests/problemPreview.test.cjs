const test = require('node:test');
const assert = require('node:assert/strict');
const { load, hooks, jsx, native, find, nodes } = require('./helpers/render.cjs');

function screen(height) {
  const h = hooks();
  const { default: Screen } = load('app/ASL/ASLReportProblem.tsx', {
    react: h.react, 'react/jsx-runtime': jsx,
    'react-native': { ...native, useWindowDimensions: () => ({ width: 390, height }) },
    '@/components/BothComponents/themed-view': { ThemedView: 'ThemedView' },
    '@/styles/common': { commonStyles: { container: { flex: 1 } } },
    'expo-camera': { useCameraPermissions: () => [{ granted: true }, async () => ({ granted: true })] },
    '@/components/ASLComponents/asl-petition-modal': { ASLPetitionModal: 'PetitionModal' },
    '@/components/ASLComponents/GifPreviewContainer': { GifPreviewContainer: 'Preview' },
    '@/components/ASLComponents/ASLGridView': { ASLGridView: 'OptionsGrid' },
    '@/hooks/usePetitionSender': { usePetitionSender: () => ({ sendPetition() {}, isLoading: false }) },
  });
  return { render() { h.reset(); return Screen(); } };
}

for (const height of [320, 640, 1024]) {
  test(`CPM_MOV_016: Other Problem previews stay outside the scrolling options on a ${height}px screen`, () => {
    const s = screen(height);
    let tree = s.render();
    const scroll = find(tree, 'problem-options-scroll');
    assert.equal(scroll.props.style.flex, 1);
    assert.equal(nodes(scroll, n => n.type === 'Preview').length, 0);
    assert.equal(nodes(tree, n => n.type === 'Preview').length, 1);
    const grid = nodes(scroll, n => n.type === 'OptionsGrid')[0];
    const other = grid.props.options.find(option => option.id === 'OTHER PROBLEM');
    assert.ok(other);
    grid.props.onPreviewChange(other.videoSource, 'video');
    tree = s.render();
    const preview = nodes(tree, n => n.type === 'Preview')[0];
    assert.equal(preview.props.gifSource, other.videoSource);
    assert.equal(preview.props.mediaType, 'video');
    assert.ok(preview.props.height >= 120 && preview.props.height <= 300);
    assert.ok(preview.props.height < height / 2);
    assert.equal(nodes(tree, n => n.type === 'PetitionModal')[0].props.visible, false);
    grid.props.onPreviewChange(grid.props.defaultGif, grid.props.defaultMediaType);
    assert.equal(nodes(s.render(), n => n.type === 'Preview')[0].props.gifSource, grid.props.defaultGif);
    grid.props.onOptionPress(other);
    assert.equal(nodes(s.render(), n => n.type === 'PetitionModal')[0].props.visible, true);
  });
}

test('CPM_MOV_016: the compact preview sizes its video while other screens keep their existing default', () => {
  const { GifPreviewContainer } = load('components/ASLComponents/GifPreviewContainer.tsx', {
    'react/jsx-runtime': jsx, 'react-native': { ...native, Image: 'Image' },
    '@/hooks/use-theme-color': { useThemeColor: () => '#fff' },
    './ASLVideoPreview': { ASLVideoPreview: 'Video' },
  });
  const compact = GifPreviewContainer({ gifSource: 'preview.mp4', mediaType: 'video', height: 128 });
  assert.deepEqual(compact.props.style.at(-1), { height: 128, minHeight: 128 });
  assert.equal(nodes(compact, n => n.type === 'Video')[0].props.style.at(-1).height, 88);
  const normal = GifPreviewContainer({ gifSource: 'preview.mp4', mediaType: 'video' });
  assert.equal(normal.props.style.at(-1), undefined);
  assert.equal(nodes(normal, n => n.type === 'Video')[0].props.style[0].height, 280);
});
