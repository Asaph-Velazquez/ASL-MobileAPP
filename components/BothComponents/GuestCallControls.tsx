import { useThemeColor } from '@/hooks/use-theme-color';
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
  const surface = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  const tint = useThemeColor({}, 'tint');
  const danger = variant === 'danger';
  const backgroundColor = disabled ? surface : danger ? '#dc2626' : active ? tint : surface;
  const textColor = disabled ? muted : danger || active ? '#ffffff' : text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, selected: active }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.controlButton,
        { backgroundColor, opacity: disabled ? 0.55 : pressed ? 0.8 : 1 },
      ]}>
      <Ionicons color={textColor} name={icon} size={20} />
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
      <View style={styles.row}>
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
      </View>
      <View style={styles.row}>
        <ControlButton
          disabled={!canRetryMedia || isRetryingMedia}
          icon="refresh"
          label={isRetryingMedia ? 'Retrying' : 'Retry media'}
          onPress={onRetryMedia}
        />
        <ControlButton icon="call" label="End call" onPress={onEndCall} variant="danger" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    flex: 1,
    minWidth: 0,
    minHeight: 64,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  controlLabel: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
  },
});
