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
    <InfoRow icon="directions-car" label="VEHICLES INCLUDED" value={String(option.vehicleCount)} />
    <InfoRow icon="airline-seat-recline-normal" label="TOTAL PASSENGER CAPACITY" value={`${option.totalCapacity} SEATS`} />
    {option.vehicles?.map((vehicle, index) => <View key={index} style={s.vehicle}>
      <InfoRow icon="directions-car" label={`VEHICLE ${index + 1} MODEL`} value={vehicle.vehicleModel} />
      <InfoRow icon="confirmation-number" label="PLATE" value={vehicle.vehiclePlate} />
    </View>)}
    {!!option.description && <InfoRow icon="info-outline" label="HOTEL DETAILS" value={option.description} />}
    <View style={[s.priceRow, { borderColor: theme.border }]}>
      <MaterialIcons name="payments" size={26} color={theme.success} />
      <View style={s.grow}><Text style={[s.label, { color: theme.muted }]}>TOTAL ALL VEHICLES</Text><Text style={[s.price, { color: theme.success }]}>{formatTransportPrice(option.priceCents)}</Text></View>
    </View>
    {selected && <Text style={[s.value, { color: theme.blue }]}>SELECTED. CONFIRM BELOW.</Text>}
  </Pressable>;
}

export function TextTransportDetail({ details, status, onOpenMap }: { details: TransportDetails; status: string; onOpenMap: () => void }) {
  const theme = useTransportTheme();
  const accepted = isCurrentAcceptance(details) ? details.transportAcceptance?.option : undefined;
  const date = details.scheduledAt ? new Date(details.scheduledAt) : null;
  const dateLabel = date && !Number.isNaN(date.getTime()) ? date.toLocaleString('en-US', { timeZone: 'America/Mexico_City' }).toUpperCase() : 'NOT PROVIDED';
  return <View style={[s.panel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
    <Text style={[s.title, { color: theme.text }]}>{transportStage(details, status)}</Text>
    <InfoRow icon="place" label="DESTINATION" value={(details.destinationLabel || 'TAXI').toUpperCase()} />
    <InfoRow icon="event" label="PICKUP DATE AND TIME. MEXICO CITY." value={dateLabel} />
    <InfoRow icon="people" label="PASSENGERS" value={`${details.passengerCount ?? '?'} ${details.passengerCount === 1 ? 'PERSON' : 'PEOPLE'}`} />
    <InfoRow icon={details.hasLuggage === false ? 'no-luggage' : 'luggage'} label="LUGGAGE" value={typeof details.hasLuggage !== 'boolean' ? 'NOT PROVIDED' : details.hasLuggage ? 'YES' : 'NO'} />
    {accepted && <>
      <InfoRow icon={transportVehicleIcons[accepted.vehicleType]} label="ACCEPTED OPTION" value={`${accepted.vehicleCount} × ${transportVehicleLabels[accepted.vehicleType]} · ${accepted.totalCapacity} SEATS`.toUpperCase()} />
      {accepted.vehicles?.map((vehicle, index) => <View key={index} style={s.vehicle}>
        <InfoRow icon="directions-car" label={`ACCEPTED VEHICLE ${index + 1} MODEL`} value={vehicle.vehicleModel} />
        <InfoRow icon="confirmation-number" label="PLATE" value={vehicle.vehiclePlate} />
      </View>)}
      {!!accepted.description && <InfoRow icon="info-outline" label="HOTEL DETAILS" value={accepted.description} />}
      <InfoRow icon="payments" label="ACCEPTED TOTAL" value={formatTransportPrice(accepted.priceCents)} />
    </>}
    {assignedVehicles(details).map((vehicle, index) => <View style={s.vehicle} key={index}>
      <InfoRow icon="directions-car" label={`ASSIGNED VEHICLE ${index + 1}`} value={vehicle.vehicleModel.toUpperCase()} />
      {!!vehicle.vehicleColor && <InfoRow icon="palette" label="COLOR" value={vehicle.vehicleColor.toUpperCase()} />}
      <InfoRow icon="confirmation-number" label="PLATE" value={vehicle.vehiclePlate.toUpperCase()} />
    </View>)}
    {!details.transportProposals && !!details.transportResponse?.transportCost && <InfoRow icon="payments" label="COST" value={details.transportResponse.transportCost} />}
    {!!details.destinationCoords && <Pressable onPress={onOpenMap} accessibilityRole="button" style={[s.map, { borderColor: theme.blue }]}>
      <MaterialIcons name="map" size={24} color={theme.blue} /><Text style={[s.value, { color: theme.blue }]}>OPEN MAP</Text>
    </Pressable>}
  </View>;
}

const s = StyleSheet.create({
  panel: { padding: 16, borderRadius: 14, borderWidth: 2, gap: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 }, grow: { flex: 1 },
  title: { fontSize: 18, fontWeight: '700', flexShrink: 1, textTransform: 'uppercase' },
  label: { fontSize: 13, marginBottom: 3, textTransform: 'uppercase' }, value: { fontSize: 16, fontWeight: '600', flexShrink: 1, textTransform: 'uppercase' },
  price: { fontSize: 22, fontWeight: '800' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 1, paddingTop: 12 },
  vehicle: { gap: 12, paddingTop: 8 }, map: { minHeight: 48, borderWidth: 1, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12 },
});
