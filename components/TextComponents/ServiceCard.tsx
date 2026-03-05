import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface ServiceOption {
  id: string;
  desciption?: string;
  description?: string; // Alias para consistencia
  icon: string;
  iconType: 'material' | 'community';
  iconColor: string;
  bgColor: string;
  placeholder?: string;
  gifUrl?: any;
  gifSource?: any;
  detalles?: any;
}

interface ServiceCardProps {
  option: ServiceOption;
  onPress: (option: ServiceOption) => void;
  isSelected?: boolean;
}

/**
 * Tarjeta de servicio reutilizable
 * Usada en todas las pantallas de Text
 */
export function ServiceCard({ option, onPress, isSelected = false }: ServiceCardProps) {
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'muted');
  const cardBg = useThemeColor({}, 'card');

  const description = option.desciption || option.description || '';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: cardBg },
        isSelected && styles.cardSelected
      ]}
      onPress={() => onPress(option)}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: option.bgColor }]}>
        {option.iconType === "material" ? (
          <MaterialIcons
            name={option.icon as any}
            size={32}
            color={option.iconColor}
          />
        ) : (
          <MaterialCommunityIcons
            name={option.icon as any}
            size={32}
            color={option.iconColor}
          />
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.cardTitle, { color: textColor }]}>
          {option.id}
        </Text>
        <Text style={[styles.cardDescription, { color: mutedColor }]}>
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 20,
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
  cardSelected: {
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});
