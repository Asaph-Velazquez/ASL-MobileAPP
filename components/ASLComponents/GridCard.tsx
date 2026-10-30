import { useThemeColor } from '@/hooks/use-theme-color';
import { ASLCardIcon } from './ASLCardIcon';
import { ASLPreviewButton } from './ASLPreviewButton';
import { StyleSheet } from "react-native";
import { ServiceOption } from '../TextComponents/ServiceCard';

interface GridCardProps {
  option: ServiceOption;
  onPress: (option: ServiceOption) => void;
  onPressIn?: (option: ServiceOption) => void;
  onPressOut?: () => void;
}

/**
 * Tarjeta de cuadrícula para modo ASL
 * Versión compacta de ServiceCard solo con icono
 */
export function GridCard({ option, onPress, onPressIn, onPressOut }: GridCardProps) {
  const cardBg = useThemeColor({}, 'card');

  return (
    <ASLPreviewButton
      style={[styles.gridItem, { backgroundColor: cardBg }]}
      accessibilityLabel={option.id}
      onPreviewStart={() => onPressIn?.(option)}
      onPreviewEnd={onPressOut}
      onPress={() => onPress(option)}
      activeOpacity={0.7}
    >
      <ASLCardIcon name={option.icon} type={option.iconType} color={option.iconColor} />
    </ASLPreviewButton>
  );
}

const styles = StyleSheet.create({
  gridItem: {
    width: '47%',
    maxWidth: 240,
    aspectRatio: 1,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
