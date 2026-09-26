import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

interface Props {
  name: string;
  type: 'material' | 'community';
  color: string;
}

/** Measures the badge rather than the window, so nested cards scale correctly. */
export function ASLCardIcon({ name, type, color }: Props) {
  const backgroundColor = useThemeColor({}, 'background');
  const [width, setWidth] = useState(80);
  const Icon = type === 'material' ? MaterialIcons : MaterialCommunityIcons;

  return (
    <View
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
      style={[styles.badge, { backgroundColor, borderColor: color, borderRadius: width * 0.2 }]}
    >
      <Icon name={name as never} size={width * 0.5} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: '72%',
    minWidth: 64,
    maxWidth: 144,
    alignSelf: 'center',
    aspectRatio: 1,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
