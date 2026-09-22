import React from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle, Line } from 'react-native-svg';
import { useThemeColor } from '@/hooks/use-theme-color';
import { TAXI_DESTINATION_CATEGORIES, type TaxiDestination } from '@/data/taxiDestinations';
import { buildTaxiMapUrl, buildTaxiStaticMapUri } from '@/data/taxiRequest';
import type { TaxiHelpResource } from '@/data/taxiAslResources';
import { transportAslColors, transportTimeAppearance } from '@/constants/transportAslTheme';
import { ASLFingerspelling } from './ASLFingerspelling';
export type { TaxiHelpResource, TaxiHelpResources } from '@/data/taxiAslResources';

type Icon = React.ComponentProps<typeof MaterialIcons>['name'];

export function VisualChoice({ label, icon, iconColor, iconBackground, onPress, selected = false, children }: {
  label: string; icon: Icon; iconColor?: string; iconBackground?: string;
  onPress?: () => void; selected?: boolean; children?: React.ReactNode;
}) {
  const color = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'card');
  return <TouchableOpacity disabled={!onPress} accessibilityRole={onPress ? 'button' : undefined}
    accessibilityState={{ selected }} onPress={onPress}
    style={[styles.choice, { backgroundColor, borderColor: selected ? (iconColor ?? '#1E88E5') : '#D7E3F1', borderWidth: selected ? 2 : 1 }]}>
    <View style={[styles.choiceIcon, { backgroundColor: iconBackground ?? 'transparent' }]}>
      <MaterialIcons name={icon} size={38} color={iconColor ?? color} />
    </View>
    <Text style={[styles.label, { color }]}>{label}</Text>
    {children}
  </TouchableOpacity>;
}

export function TaxiTimeSummary({ date, time, label }: { date: string; time: string; label: string }) {
  const color = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'card');
  const faceColor = useThemeColor({}, 'background');
  const [hour, minute] = time.split(':').map(Number);
  const period = transportTimeAppearance(time);
  const endpoint = (degrees: number, length: number) => ({
    x: 60 + Math.sin(degrees * Math.PI / 180) * length,
    y: 60 - Math.cos(degrees * Math.PI / 180) * length,
  });
  const hourHand = endpoint((hour % 12) * 30 + minute / 2, 29);
  const minuteHand = endpoint(minute * 6, 42);
  return <View style={[styles.timeSummary, { backgroundColor }]} accessible
    accessibilityLabel={`${date}, ${label}, ${period.label}, America/Mexico_City`}>
    <Text style={[styles.label, { color, textAlign: 'left' }]}>TIME</Text>
    <View style={styles.clockRow}>
      <Svg width={120} height={120} viewBox="0 0 120 120" accessibilityElementsHidden>
        <Circle cx={60} cy={60} r={56} fill={faceColor} stroke={period.color} strokeWidth={3} />
        {[0, 90, 180, 270].map(angle => {
          const inner = endpoint(angle, 47);
          const outer = endpoint(angle, 51);
          return <Line key={angle} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke={period.color} strokeWidth={2} />;
        })}
        <Line x1={60} y1={60} x2={hourHand.x} y2={hourHand.y} stroke={period.color} strokeWidth={7} strokeLinecap="round" />
        <Line x1={60} y1={60} x2={minuteHand.x} y2={minuteHand.y} stroke={period.color} strokeWidth={4} strokeLinecap="round" />
        <Circle cx={60} cy={60} r={5} fill={period.color} />
      </Svg>
      <Text style={[styles.digitalTime, { color }]}>{label}</Text>
      <View style={[styles.period, { backgroundColor: period.background, borderColor: period.color }]}>
        <MaterialIcons name={period.icon} size={28} color={period.color} />
        <Text style={{ color: period.color, fontWeight: '800', flexShrink: 1 }}>{period.label}</Text>
      </View>
    </View>
    <Text style={[styles.label, { color }]}>{date}</Text>
    <Text style={{ color }}>America/Mexico_City</Text>
  </View>;
}

export function PeopleSymbols({ count }: { count: number }) {
  return <View style={styles.people}>{Array.from({ length: count }, (_, i) =>
    <MaterialIcons key={i} name="person" size={24} color={transportAslColors.people.color} />)}</View>;
}

export function DestinationVisualCard({ destination, onSelect, onHelp }: {
  destination: TaxiDestination; onSelect?: () => void; onHelp: () => void;
}) {
  const category = TAXI_DESTINATION_CATEGORIES.find(item => item.id === destination.category)!;
  const [width, setWidth] = React.useState(280);
  const [page, setPage] = React.useState(0);
  const gesture = React.useRef({ x: 0, y: 0, moved: false });
  return <View style={styles.destination} onLayout={event => setWidth(event.nativeEvent.layout.width)}>
    <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}
      onScrollBeginDrag={() => { gesture.current.moved = true; }}
      onMomentumScrollEnd={event => setPage(Math.round(event.nativeEvent.contentOffset.x / width))}>
      {destination.images.map((source, index) => <Pressable key={index} disabled={!onSelect}
        accessibilityRole={onSelect ? 'button' : undefined}
        accessibilityLabel={`${onSelect ? 'Select ' : ''}${destination.label}, photo ${index + 1}`}
        onPressIn={event => { gesture.current = { x: event.nativeEvent.pageX, y: event.nativeEvent.pageY, moved: false }; }}
        onTouchMove={event => {
          if (Math.abs(event.nativeEvent.pageX - gesture.current.x) > 8 || Math.abs(event.nativeEvent.pageY - gesture.current.y) > 8) gesture.current.moved = true;
        }}
        onPress={() => { if (!gesture.current.moved) onSelect?.(); }}>
        <Image source={source} style={{ width, height: 220 }} resizeMode="cover" />
      </Pressable>)}
    </ScrollView>
    <View pointerEvents="none" style={styles.badges}>
      <Text style={styles.number}>#{destination.proximityOrder}</Text>
      <View style={[styles.category, { backgroundColor: category.iconBackground }]}>
        <MaterialIcons name={category.icon as Icon} color={category.iconColor} size={28} />
      </View>
    </View>
    <View style={styles.caption}>
      <TouchableOpacity style={{ flex: 1 }} disabled={!onSelect} onPress={onSelect}
        accessibilityRole={onSelect ? 'button' : undefined} accessibilityLabel={`Select ${destination.label}`}>
        <Text style={styles.destinationLabel}>{destination.label}</Text>
        <Text style={{ color: '#FFFFFF' }}>{onSelect ? 'SELECT DESTINATION  >' : 'DESTINATION'} | {page + 1}/{destination.images.length}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.hand} onPress={onHelp} accessibilityRole="button" accessibilityLabel={`ASL help for ${destination.label}`}>
        <MaterialIcons name="pan-tool" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  </View>;
}

export function TaxiMapPreview({ destination }: { destination: TaxiDestination }) {
  const color = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'card');
  const uri = buildTaxiStaticMapUri(destination);
  const [failed, setFailed] = React.useState(false);
  const [error, setError] = React.useState(false);
  React.useEffect(() => { setFailed(false); setError(false); }, [destination.id]);
  return <View style={[styles.map, { backgroundColor }]}>
    {uri && !failed ? <Image source={{ uri }} onError={() => setFailed(true)} style={{ width: '100%', height: 160 }} accessibilityLabel={`Map of ${destination.label}`} />
      : <View style={styles.choice}><MaterialIcons name="map" size={48} color={transportAslColors.destination.color} /><Text style={{ color }}>Map preview unavailable</Text></View>}
    <TouchableOpacity accessibilityRole="link" style={styles.mapButton} onPress={async () => {
      try { setError(false); await Linking.openURL(buildTaxiMapUrl(destination)); } catch { setError(true); }
    }}><MaterialIcons name="map" size={24} color={transportAslColors.destination.color} /><Text style={[styles.label, { color }]}>Open map</Text></TouchableOpacity>
    {error && <Text accessibilityRole="alert" style={{ color }}>Unable to open map. Try again.</Text>}
  </View>;
}

export function TaxiHelpSheet({ title, destination, resource, onClose, bottomInset }: {
  title: string; destination?: TaxiDestination; resource?: TaxiHelpResource; onClose: () => void; bottomInset: number;
}) {
  const backgroundColor = useThemeColor({}, 'background');
  const color = useThemeColor({}, 'text');
  const [failed, setFailed] = React.useState(false);
  const category = TAXI_DESTINATION_CATEGORIES.find(item => item.id === destination?.category);
  return <View style={styles.helpOverlay} accessibilityViewIsModal>
    <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close ASL help" />
    <Pressable onPress={event => event.stopPropagation()} style={[styles.sheet, { backgroundColor, paddingBottom: Math.max(24, bottomInset) }]}>
      <View style={styles.sheetHandle} />
      <View style={styles.sheetHeader}>
        {category && <MaterialIcons name={category.icon as Icon} size={30} color={category.iconColor} />}
        <Text style={[styles.label, { color, flex: 1, textAlign: 'left' }]}>{title}</Text>
        <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Close ASL help" style={{ padding: 12 }}><MaterialIcons name="close" size={28} color={color} /></TouchableOpacity></View>
      <ScrollView style={styles.helpScroll} contentContainerStyle={styles.helpBody} showsVerticalScrollIndicator nestedScrollEnabled>
        {resource && !failed ? <Image source={resource.source} accessibilityLabel={resource.accessibilityLabel} onError={() => setFailed(true)} resizeMode="contain" style={{ width: '100%', height: 200 }} />
          : !destination && <View style={styles.choice}><MaterialIcons name="pan-tool" size={42} color={transportAslColors.help.color} />
            <Text style={[styles.label, { color }]}>ASL help pending</Text>
            <Text style={{ color }}>No verified sign-language resource is available for this selection yet.</Text></View>}
        {destination && <ASLFingerspelling text={destination.fingerspellingText?.trim() || destination.label} />}
      </ScrollView>
    </Pressable>
  </View>;
}

const styles = StyleSheet.create({
  timeSummary: { padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#D7E3F1', gap: 12 },
  clockRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 14 },
  digitalTime: { fontSize: 34, fontWeight: '900' },
  period: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 2, borderRadius: 28, padding: 12 },
  choice: { padding: 16, borderRadius: 14, borderWidth: 1, alignItems: 'center', gap: 10, flexGrow: 1 },
  choiceIcon: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 16, fontWeight: '700', textAlign: 'center' }, people: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  destination: { borderRadius: 18, overflow: 'hidden', backgroundColor: '#15263A' },
  badges: { position: 'absolute', top: 12, left: 12, right: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  number: { backgroundColor: '#151515', color: '#FFFFFF', padding: 10, borderRadius: 22, fontWeight: '800', fontSize: 20 },
  category: { borderRadius: 30, padding: 12 }, caption: { padding: 16, flexDirection: 'row', gap: 12, alignItems: 'center' },
  destinationLabel: { color: '#FFFFFF', fontWeight: '900', fontSize: 22, marginBottom: 8 }, hand: { padding: 16, backgroundColor: '#926800', borderRadius: 40 },
  map: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#D7E3F1' },
  mapButton: { margin: 12, padding: 14, borderWidth: 2, borderColor: '#1E88E5', borderRadius: 28, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
  helpOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', alignItems: 'center' },
  sheet: { width: '100%', maxWidth: 520, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%', gap: 12 },
  sheetHandle: { width: 44, height: 5, borderRadius: 3, backgroundColor: '#D8D8D8', alignSelf: 'center' },
  helpScroll: { flexShrink: 1, minHeight: 0 },
  helpBody: { paddingBottom: 12 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
