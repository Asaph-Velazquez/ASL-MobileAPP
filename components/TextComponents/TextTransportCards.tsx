import type { ComponentProps } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTransportTheme } from '@/hooks/useTransportTheme';
import { assignedVehicles, formatTransportPrice, isCurrentAcceptance, transportStage, transportVehicleIcons, transportVehicleLabels, type TransportDetails, type TransportOption } from '@/data/transport';

function InfoRow({ icon, label, value }: { icon: ComponentProps<typeof MaterialIcons>['name']; label: string; value: string }) {
  const theme = useTransportTheme();
  return <View style={s.row}>
    <MaterialIcons name={icon} size={24} color={theme.blue} />
    <View style={s.grow}><Text style={[s.label, { color: theme.muted }]}>{label}</Text><Text style={[s.value, { color: theme.text }]}>{value}</Text></View>
  </View>;
}

export function TextTransportOptionCard({ option, selected, disabled, onSelect }: {
  option: TransportOption; selected: boolean; disabled: boolean; onSelect: () => void;
}) {
  const theme = useTransportTheme();
  return <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected, disabled }}
    disabled={disabled} onPress={onSelect} style={[s.panel, { backgroundColor: selected ? theme.blueBackground : theme.surface, borderColor: selected ? theme.blue : theme.border }]}>
    <View style={s.row}>
      <MaterialIcons name={transportVehicleIcons[option.vehicleType]} size={32} color={theme.blue} />
      <Text style={[s.title, s.grow, { color: theme.text }]}>{transportVehicleLabels[option.vehicleType]}</Text>
      <MaterialIcons name={selected ? 'radio-button-checked' : 'radio-button-unchecked'} size={26} color={selected ? theme.blue : theme.muted} />
    </View>
    <InfoRow icon="directions-car" label="Vehicles included" value={String(option.vehicleCount)} />
    <InfoRow icon="airline-seat-recline-normal" label="Total passenger capacity" value={`${option.totalCapacity} seats`} />
    {!!option.description && <InfoRow icon="info-outline" label="Details from the hotel" value={option.description} />}
    <View style={[s.priceRow, { borderColor: theme.border }]}>
      <MaterialIcons name="payments" size={26} color={theme.success} />
      <View style={s.grow}><Text style={[s.label, { color: theme.muted }]}>Total for all vehicles</Text><Text style={[s.price, { color: theme.success }]}>{formatTransportPrice(option.priceCents)}</Text></View>
    </View>
    {selected && <Text style={[s.value, { color: theme.blue }]}>Selected · Confirm below to accept</Text>}
  </Pressable>;
}

export function TextTransportDetail({ details, status, onOpenMap }: { details: TransportDetails; status: string; onOpenMap: () => void }) {
  const theme = useTransportTheme();
  const accepted = isCurrentAcceptance(details) ? details.transportAcceptance?.option : undefined;
  const date = details.scheduledAt ? new Date(details.scheduledAt) : null;
  const dateLabel = date && !Number.isNaN(date.getTime()) ? date.toLocaleString('en-US', { timeZone: 'America/Mexico_City' }) : 'Not provided';
  return <View style={[s.panel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
    <Text style={[s.title, { color: theme.text }]}>{transportStage(details, status)}</Text>
    <InfoRow icon="place" label="Destination" value={details.destinationLabel || 'Taxi'} />
    <InfoRow icon="event" label="Pickup date and time (Mexico City)" value={dateLabel} />
    <InfoRow icon="people" label="Passengers" value={`${details.passengerCount ?? '?'} ${details.passengerCount === 1 ? 'person' : 'people'}`} />
    <InfoRow icon={details.hasLuggage === false ? 'no-luggage' : 'luggage'} label="Luggage requested" value={typeof details.hasLuggage !== 'boolean' ? 'Not provided' : details.hasLuggage ? 'Yes' : 'No'} />
    {accepted && <>
      <InfoRow icon={transportVehicleIcons[accepted.vehicleType]} label="Accepted option" value={`${accepted.vehicleCount} × ${transportVehicleLabels[accepted.vehicleType]} · ${accepted.totalCapacity} seats`} />
      {!!accepted.description && <InfoRow icon="info-outline" label="Details from the hotel" value={accepted.description} />}
      <InfoRow icon="payments" label="Accepted total" value={formatTransportPrice(accepted.priceCents)} />
    </>}
    {assignedVehicles(details).map((vehicle, index) => <View style={s.vehicle} key={index}>
      <InfoRow icon="directions-car" label={`Assigned vehicle ${index + 1}`} value={vehicle.vehicleModel} />
      {!!vehicle.vehicleColor && <InfoRow icon="palette" label="Color" value={vehicle.vehicleColor} />}
      <InfoRow icon="confirmation-number" label="License plate" value={vehicle.vehiclePlate} />
    </View>)}
    {!details.transportProposals && !!details.transportResponse?.transportCost && <InfoRow icon="payments" label="Cost" value={details.transportResponse.transportCost} />}
    {!!details.destinationCoords && <Pressable onPress={onOpenMap} accessibilityRole="button" style={[s.map, { borderColor: theme.blue }]}>
      <MaterialIcons name="map" size={24} color={theme.blue} /><Text style={[s.value, { color: theme.blue }]}>Open map</Text>
    </Pressable>}
  </View>;
}

const s = StyleSheet.create({
  panel: { padding: 16, borderRadius: 14, borderWidth: 2, gap: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 }, grow: { flex: 1 },
  title: { fontSize: 18, fontWeight: '700', flexShrink: 1 },
  label: { fontSize: 13, marginBottom: 3 }, value: { fontSize: 16, fontWeight: '600', flexShrink: 1 },
  price: { fontSize: 22, fontWeight: '800' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 1, paddingTop: 12 },
  vehicle: { gap: 12, paddingTop: 8 }, map: { minHeight: 48, borderWidth: 1, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12 },
});
