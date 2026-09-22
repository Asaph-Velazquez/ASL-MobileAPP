import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { shiftTaxiDate, TAXI_TIME_ZONE } from '@/data/taxiRequest';

export function TaxiDateSelector({ value, onChange, iconColor, showGuidance = true }: { value: string; onChange: (date: string) => void; iconColor?: string; showGuidance?: boolean }) {
  const color = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'card');
  return <View style={styles.container}>
    <View style={[styles.row, { backgroundColor }]}>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Previous date" style={styles.button} onPress={() => onChange(shiftTaxiDate(value, -1))}>
        <MaterialIcons name="chevron-left" size={30} color={color} />
      </TouchableOpacity>
      <View style={styles.date}>
        <MaterialIcons name="event" size={28} color={iconColor ?? color} />
        <Text accessibilityLiveRegion="polite" style={[styles.label, { color }]}>{value}</Text>
      </View>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Next date" style={styles.button} onPress={() => onChange(shiftTaxiDate(value, 1))}>
        <MaterialIcons name="chevron-right" size={30} color={color} />
      </TouchableOpacity>
    </View>
    {showGuidance && <>
      <Text style={{ color }}>24 hours minimum. 48 hours recommended. No maximum advance booking.</Text>
      <Text style={{ color }}>{TAXI_TIME_ZONE}</Text>
    </>}
  </View>;
}
const styles = StyleSheet.create({
  container: { gap: 8, marginBottom: 16 }, row: { flexDirection: 'row', alignItems: 'center', borderRadius: 16 },
  button: { padding: 12 }, date: { flex: 1, alignItems: 'center', gap: 4 }, label: { fontWeight: '700', fontSize: 18 },
});
