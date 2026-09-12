import { Platform, StyleSheet, Text, View } from 'react-native';

type Tone = 'neutral' | 'info' | 'success' | 'danger';

type GuestCallVideoStageProps = {
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
  const phaseColors = toneStyles[phaseTone];
  const VideoView = Platform.OS === 'web'
    ? null
    // El módulo nativo solo se carga en compilaciones nativas de Expo.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    : (require('react-native-webrtc') as typeof import('react-native-webrtc')).RTCView;

  return (
    <View style={styles.wrapper}>
      <View style={styles.statusRow}>
        <View style={[styles.phaseBadge, { backgroundColor: phaseColors.backgroundColor }]}>
          <Text style={[styles.phaseBadgeText, { color: phaseColors.color }]}>{phaseLabel}</Text>
        </View>
        <Text style={styles.mediaStatusText}>{mediaStatusLabel}</Text>
      </View>

      <View style={styles.remoteStage}>
        {remoteStreamUrl && VideoView ? (
          <VideoView objectFit="cover" streamURL={remoteStreamUrl} style={styles.remoteVideo} />
        ) : (
          <View style={styles.remotePlaceholder}>
            <Text style={styles.placeholderEyebrow}>Interpreter video</Text>
            <Text style={styles.placeholderText}>{remotePlaceholder}</Text>
          </View>
        )}

        <View style={styles.localPreviewCard}>
          <Text style={styles.localPreviewLabel}>Guest preview</Text>
          {showLocalVideo && localStreamUrl && VideoView ? (
            <VideoView mirror objectFit="cover" streamURL={localStreamUrl} style={styles.localVideo} />
          ) : (
            <View style={styles.localPlaceholder}>
              <Text style={styles.localPlaceholderText}>{localPlaceholder}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.mediaCard}>
        <Text style={styles.mediaCardTitle}>Media session</Text>
        <Text style={styles.mediaCardBody}>{mediaMessage}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 14,
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
    color: '#475569',
    textTransform: 'capitalize',
  },
  remoteStage: {
    minHeight: 330,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#0f172a',
    position: 'relative',
  },
  remoteVideo: {
    width: '100%',
    height: 330,
    backgroundColor: '#0f172a',
  },
  remotePlaceholder: {
    height: 330,
    paddingHorizontal: 28,
    paddingVertical: 32,
    justifyContent: 'flex-end',
    backgroundColor: '#10243d',
  },
  placeholderEyebrow: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  placeholderText: {
    color: '#f8fafc',
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700',
  },
  localPreviewCard: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 130,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  localPreviewLabel: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 6,
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  localVideo: {
    width: '100%',
    height: 156,
    backgroundColor: '#020617',
  },
  localPlaceholder: {
    height: 156,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: '#1e293b',
  },
  localPlaceholderText: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
  mediaCard: {
    borderRadius: 18,
    backgroundColor: '#f1e7d4',
    padding: 16,
    gap: 8,
  },
  mediaCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  mediaCardBody: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
  },
});
