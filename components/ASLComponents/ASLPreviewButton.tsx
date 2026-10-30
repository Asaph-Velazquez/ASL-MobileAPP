import { useRef } from 'react';
import { TouchableOpacity, type TouchableOpacityProps } from 'react-native';

type Props = Omit<TouchableOpacityProps, 'onPress' | 'onPressIn' | 'onPressOut' | 'onLongPress' | 'onAccessibilityTap' | 'onAccessibilityAction' | 'accessibilityActions'> & {
  onPress: () => void;
  onPreviewStart?: () => void;
  onPreviewEnd?: () => void;
};

export function ASLPreviewButton({ onPress, onPreviewStart, onPreviewEnd, children, ...props }: Props) {
  const previewOnly = useRef(false);
  const activate = () => { previewOnly.current = false; onPress(); };

  return (
    <TouchableOpacity
      {...props}
      accessibilityRole="button"
      accessibilityActions={[{ name: 'activate' }]}
      onAccessibilityTap={activate}
      onAccessibilityAction={event => { if (event.nativeEvent.actionName === 'activate') activate(); }}
      onPressIn={() => { previewOnly.current = false; onPreviewStart?.(); }}
      onLongPress={() => { previewOnly.current = true; }}
      onPressOut={onPreviewEnd}
      onPress={() => {
        // React Native puede emitir pressOut antes de press: la consulta no debe seleccionar.
        const wasPreview = previewOnly.current;
        previewOnly.current = false;
        if (!wasPreview) onPress();
      }}
    >
      {children}
    </TouchableOpacity>
  );
}
