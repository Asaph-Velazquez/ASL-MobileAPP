import { useThemeColor } from '@/hooks/use-theme-color';
import { StyleSheet, Text, View } from "react-native";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
}

/**
 * Header reutilizable para todas las pantallas
 * Muestra título y subtítulo opcional con estilos consistentes
 */
export function ScreenHeader({ title, subtitle }: ScreenHeaderProps) {
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'muted');

  return (
    <View style={styles.header}>
      <Text style={[styles.title, { color: textColor }]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: mutedColor }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
  },
});
