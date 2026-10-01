import { useThemeColor } from '@/hooks/use-theme-color';
import { Platform, StyleSheet, Text, View } from 'react-native';

type Tone = 'neutral' | 'info' | 'success' | 'danger';

type GuestCallVideoStageProps = {
  sideBySide?: boolean;
  phaseLabel: string;
  phaseTone: Tone;
  mediaStatusLabel: string;
  mediaMessage: string;
  remoteStreamUrl: string | null;
  remotePlaceholder: string;
  localStreamUrl: string | null;
  localPlaceholder: string;
  showLocalVideo: boolean;
};

const toneStyles: Record<Tone, { backgroundColor: string; color: string }> = {
  neutral: { backgroundColor: '#e2e8f0', color: '#1e293b' },
  info: { backgroundColor: '#dbeafe', color: '#1d4ed8' },
  success: { backgroundColor: '#ccfbf1', color: '#0f766e' },
  danger: { backgroundColor: '#fee2e2', color: '#b91c1c' },
};

export function GuestCallVideoStage({
  sideBySide = false,
  phaseLabel,
  phaseTone,
  mediaStatusLabel,
  mediaMessage,
  remoteStreamUrl,
  remotePlaceholder,
  localStreamUrl,
  localPlaceholder,
  showLocalVideo,
}: GuestCallVideoStageProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'muted');
  const phaseBackground = useThemeColor({ light: toneStyles[phaseTone].backgroundColor }, 'background');
  const phaseText = useThemeColor({ light: toneStyles[phaseTone].color }, 'text');
  const VideoView = Platform.OS === 'web'
    ? null
    // El módulo nativo solo se carga en compilaciones nativas de Expo.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    : (require('react-native-webrtc') as typeof import('react-native-webrtc')).RTCView;

  return (
    <View style={styles.wrapper}>
      <View style={styles.statusRow}>
        <View style={[styles.phaseBadge, { backgroundColor: phaseBackground }]}>
          <Text style={[styles.phaseBadgeText, { color: phaseText }]}>{phaseLabel}</Text>
        </View>
        <Text style={[styles.mediaStatusText, { color: mutedColor }]}>{mediaStatusLabel}</Text>
      </View>

      <View testID="call-video-panels" style={[styles.videoPanels, sideBySide && styles.videoPanelsWide]}>
        <View testID="interpreter-video-panel" style={[styles.videoPanel, sideBySide && styles.videoPanelWide]}>
          <Text style={[styles.localPreviewLabel, { color: textColor }]}>Interpreter video</Text>
          <View style={[styles.remoteStage, sideBySide && styles.wideStage, { backgroundColor }]}>
            {remoteStreamUrl && VideoView ? (
              <VideoView objectFit={sideBySide ? 'contain' : 'cover'} streamURL={remoteStreamUrl} style={sideBySide ? styles.wideVideo : styles.remoteVideo} />
            ) : (
              <View style={[styles.remotePlaceholder, sideBySide && styles.widePlaceholder, { backgroundColor }]}>
                <Text style={[styles.placeholderText, sideBySide && styles.widePlaceholderText, { color: textColor }]}>{remotePlaceholder}</Text>
              </View>
            )}
          </View>
        </View>

        <View testID="guest-video-panel" style={[styles.localPreviewCard, sideBySide && styles.videoPanelWide, { backgroundColor: cardColor }]}>
          <Text style={[styles.localPreviewLabel, { color: textColor }]}>Guest preview</Text>
          <View style={[styles.localStage, sideBySide && styles.wideStage, { backgroundColor }]}>
            {showLocalVideo && localStreamUrl && VideoView ? (
              <VideoView mirror objectFit={sideBySide ? 'contain' : 'cover'} streamURL={localStreamUrl} style={sideBySide ? styles.wideVideo : styles.localVideo} />
            ) : (
              <View style={[styles.localPlaceholder, sideBySide && styles.widePlaceholder, { backgroundColor }]}>
                <Text style={[styles.localPlaceholderText, { color: mutedColor }]}>{localPlaceholder}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={[styles.mediaCard, { backgroundColor }]}>
        <Text style={[styles.mediaCardTitle, { color: textColor }]}>Media session</Text>
        <Text style={[styles.mediaCardBody, { color: mutedColor }]}>{mediaMessage}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 14,
  },
  videoPanels: {
    gap: 16,
  },
  videoPanelsWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  videoPanel: {
    width: '100%',
  },
  videoPanelWide: {
    flex: 1,
    width: undefined,
    minWidth: 0,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  phaseBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  phaseBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  mediaStatusText: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    textTransform: 'capitalize',
  },
  remoteStage: {
    minHeight: 330,
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
  },
  remoteVideo: {
    width: '100%',
    height: 330,
  },
  remotePlaceholder: {
    minHeight: 330,
    paddingHorizontal: 20,
    paddingVertical: 32,
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700',
  },
  localPreviewCard: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  localStage: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  wideStage: {
    width: '100%',
    minHeight: 0,
    aspectRatio: 4 / 3,
  },
  wideVideo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
  widePlaceholder: {
    minHeight: 0,
    height: '100%',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  widePlaceholderText: {
    fontSize: 18,
    lineHeight: 25,
  },
  localPreviewLabel: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 6,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  localVideo: {
    width: '100%',
    height: 156,
  },
  localPlaceholder: {
    height: 156,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  localPlaceholderText: {
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
  mediaCard: {
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  mediaCardTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  mediaCardBody: {
    fontSize: 14,
    lineHeight: 20,
  },
});
