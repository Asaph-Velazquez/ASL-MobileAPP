import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";
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
    <TouchableOpacity
      style={[styles.gridItem, { backgroundColor: cardBg }]}
      onPressIn={() => onPressIn?.(option)}
      onPressOut={onPressOut}
      onPress={() => onPress(option)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: option.bgColor }]}>
        {option.iconType === "material" ? (
          <MaterialIcons
            name={option.icon as any}
            size={40}
            color={option.iconColor}
          />
        ) : (
          <MaterialCommunityIcons
            name={option.icon as any}
            size={40}
            color={option.iconColor}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gridItem: {
    width: '47%',
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
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
