import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type ControlButtonProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'danger';
  onPress: () => void;
};

type GuestCallControlsProps = {
  isMicrophoneEnabled: boolean;
  isCameraEnabled: boolean;
  canToggleMedia: boolean;
  canRetryMedia: boolean;
  isRetryingMedia: boolean;
  onToggleMicrophone: () => void;
  onToggleCamera: () => void;
  onRetryMedia: () => void;
  onEndCall: () => void;
};

function ControlButton({
  label,
  icon,
  active = false,
  disabled = false,
  variant = 'default',
  onPress,
}: ControlButtonProps) {
  const danger = variant === 'danger';
  const backgroundColor = disabled
    ? '#e2e8f0'
    : danger
      ? '#dc2626'
      : active
        ? '#0f766e'
        : '#ffffff';
  const iconColor = disabled ? '#94a3b8' : danger || active ? '#ffffff' : '#0f172a';
  const textColor = disabled ? '#94a3b8' : danger || active ? '#ffffff' : '#0f172a';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.controlButton,
        { backgroundColor, opacity: pressed && !disabled ? 0.86 : 1 },
      ]}>
      <Ionicons color={iconColor} name={icon} size={20} />
      <Text style={[styles.controlLabel, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

export function GuestCallControls({
  isMicrophoneEnabled,
  isCameraEnabled,
  canToggleMedia,
  canRetryMedia,
  isRetryingMedia,
  onToggleMicrophone,
  onToggleCamera,
  onRetryMedia,
  onEndCall,
}: GuestCallControlsProps) {
  return (
    <View style={styles.wrapper}>
      <ControlButton
        active={isMicrophoneEnabled}
        disabled={!canToggleMedia}
        icon={isMicrophoneEnabled ? 'mic' : 'mic-off'}
        label={isMicrophoneEnabled ? 'Mic on' : 'Mic off'}
        onPress={onToggleMicrophone}
      />
      <ControlButton
        active={isCameraEnabled}
        disabled={!canToggleMedia}
        icon={isCameraEnabled ? 'videocam' : 'videocam-off'}
        label={isCameraEnabled ? 'Camera on' : 'Camera off'}
        onPress={onToggleCamera}
      />
      <ControlButton
        disabled={!canRetryMedia || isRetryingMedia}
        icon="refresh"
        label={isRetryingMedia ? 'Retrying' : 'Retry media'}
        onPress={onRetryMedia}
      />
      <ControlButton icon="call" label="End call" onPress={onEndCall} variant="danger" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  controlButton: {
    minWidth: 126,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
});
