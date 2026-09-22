import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { assignedVehicles, formatTransportPrice, isCurrentAcceptance, TransportDetails, TransportOption, transportStage, transportVehicleLabels } from '@/data/transport';
import { transportTimeAppearance } from '@/constants/transportAslTheme';
import { useTransportTheme } from '@/hooks/useTransportTheme';

const icons = { car: 'directions-car', van: 'airport-shuttle', bus: 'directions-bus' } as const;

export function ASLTransportOptionCard({ option, selected, disabled, onSelect, onHelp }: {
  option: TransportOption; selected: boolean; disabled: boolean; onSelect: () => void; onHelp: () => void;
}) {
  const theme = useTransportTheme();
  const s = createStyles(theme);
  const vehicleColors = { car: theme.blue, van: theme.teal, bus: theme.orange };
  return (
    <View style={[s.option, selected && s.selected]}>
      <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected, disabled }}
        accessibilityLabel={`${option.vehicleCount} ${transportVehicleLabels[option.vehicleType]}, ${option.totalCapacity} seats, ${formatTransportPrice(option.priceCents)}${option.description ? `, ${option.description}` : ''}`}
        disabled={disabled} onPress={onSelect} style={s.optionTouch}>
        <View style={s.row}>
          <Text style={s.quantity}>{option.vehicleCount} ×</Text>
          <MaterialIcons name={icons[option.vehicleType]} size={34} color={vehicleColors[option.vehicleType]} />
          <Text style={[s.heading, s.grow]}>{transportVehicleLabels[option.vehicleType]}</Text>
          <MaterialIcons name={selected ? 'check-circle' : 'radio-button-unchecked'} size={28} color={selected ? theme.accent : theme.muted} />
        </View>
        <View style={s.capacity}><Text style={s.body}>{option.totalCapacity}</Text><MaterialIcons name="airline-seat-recline-normal" size={23} color={theme.teal} /></View>
        {!!option.description && <View style={s.row}><MaterialIcons name="info-outline" size={23} color={theme.blue} /><Text style={[s.body, s.grow]}>{option.description}</Text></View>}
        <Text style={s.price}>{formatTransportPrice(option.priceCents)}</Text>
      </Pressable>
      <Pressable style={s.help} onPress={onHelp} accessibilityLabel="ASL help for vehicle option" accessibilityRole="button">
        <MaterialIcons name="pan-tool" size={22} color={theme.accent} /><Text style={s.helpText}>ASL</Text>
      </Pressable>
    </View>
  );
}

export function ASLTransportDetail({ details, status, onOpenMap }: { details: TransportDetails; status: string; onOpenMap: () => void }) {
  const theme = useTransportTheme();
  const s = createStyles(theme);
  const vehicleColors = { car: theme.blue, van: theme.teal, bus: theme.orange };
  const accepted = isCurrentAcceptance(details) ? details.transportAcceptance : undefined;
  const vehicles = assignedVehicles(details);
  const date = details.scheduledAt ? new Date(details.scheduledAt) : null;
  const validDate = date && !Number.isNaN(date.getTime()) ? date : null;
  const hour = validDate ? Number(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Mexico_City', hour: 'numeric', hourCycle: 'h23' }).format(validDate)) : 0;
  const period = transportTimeAppearance(`${hour}:00`);
  const positive = !!accepted || vehicles.length > 0;
  return (
    <View style={s.stack}>
      <View style={[s.banner, !positive && s.waitBanner, status === 'cancelled' && s.cancelBanner]}>
        <MaterialIcons name={status === 'cancelled' ? 'cancel' : positive ? 'check-circle' : 'schedule'} size={28} color={status === 'cancelled' ? theme.danger : positive ? theme.success : theme.warning} />
        <Text style={[s.heading, s.grow]}>{transportStage(details, status)}</Text>
      </View>
      <View style={[s.panel, s.row]}>
        <MaterialIcons name="place" size={30} color={theme.danger} />
        <Text style={[s.heading, s.grow]}>{details.destinationLabel || 'TAXI'}</Text>
        {!!details.destinationCoords && <Pressable style={s.mapButton} onPress={onOpenMap} accessibilityLabel="Open destination map" accessibilityRole="button"><MaterialIcons name="map" size={30} color={theme.blue} /></Pressable>}
      </View>
      <View style={s.panel}>
        <View style={s.row}>
          <View style={[s.iconCircle, { backgroundColor: period.background }]}><MaterialIcons name={validDate ? period.icon : 'schedule'} size={28} color={period.color} /></View>
          <Text style={s.heading}>{validDate ? validDate.toLocaleTimeString('en-US', { timeZone: 'America/Mexico_City', hour: 'numeric', minute: '2-digit' }) : 'TIME NOT PROVIDED'}</Text>
        </View>
        {validDate && <Text style={s.body}>{validDate.toLocaleDateString('en-US', { timeZone: 'America/Mexico_City', day: 'numeric', month: 'long', year: 'numeric' })}</Text>}
        <View style={s.row}>
          <Text style={s.quantity}>{details.passengerCount ?? '?'} ×</Text><MaterialIcons name="person" size={32} color={theme.teal} />
          <View style={s.grow} />
          <MaterialIcons name={details.hasLuggage === false ? 'no-luggage' : 'luggage'} size={30} color={details.hasLuggage === false ? theme.danger : theme.success} />
          <MaterialIcons name={typeof details.hasLuggage !== 'boolean' ? 'help-outline' : details.hasLuggage ? 'check-circle' : 'cancel'} size={26} color={details.hasLuggage ? theme.success : theme.danger} />
        </View>
      </View>
      {accepted && <View style={s.panel}><Text style={s.label}>ACCEPTED OPTION</Text><Text style={s.heading}>{accepted.option.vehicleCount} × {transportVehicleLabels[accepted.option.vehicleType]}</Text>{!!accepted.option.description && <Text style={s.body}>{accepted.option.description}</Text>}{!vehicles.length && <Text style={s.body}>VEHICLE DETAILS WAIT STAFF</Text>}</View>}
      {vehicles.map((vehicle, index) => <View style={s.panel} key={`${index}-${vehicle.vehiclePlate}`}>
        <Text style={s.label}>ASSIGNED VEHICLE {vehicles.length > 1 ? index + 1 : ''}</Text>
        <View style={s.row}><MaterialIcons name={accepted ? icons[accepted.option.vehicleType] : 'directions-car'} size={38} color={vehicleColors[accepted?.option.vehicleType ?? 'car']} /><Text style={[s.heading, s.grow]}>{vehicle.vehicleModel}</Text><MaterialIcons name="check-circle" color={theme.success} size={28} /></View>
        {!!vehicle.vehicleColor && <Text style={s.body}>{vehicle.vehicleColor}</Text>}
        <Text style={s.label}>PLATE</Text><View style={s.plate}><Text selectable style={s.plateText}>{vehicle.vehiclePlate}</Text></View>
      </View>)}
      {(accepted || (!details.transportProposals && details.transportResponse?.transportCost)) && <View style={s.panel}>
        <Text style={s.label}>{vehicles.length ? 'FINAL COST' : 'ACCEPTED COST'}</Text>
        <View style={s.row}><Text style={[s.price, s.grow]}>{accepted ? formatTransportPrice(accepted.option.priceCents) : details.transportResponse?.transportCost}</Text><MaterialIcons name="payments" color={theme.success} size={30} /></View>
      </View>}
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useTransportTheme>) { return StyleSheet.create({
  iconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  stack: { gap: 16 }, grow: { flex: 1 }, row: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  option: { borderWidth: 3, borderColor: theme.border, borderRadius: 24, backgroundColor: theme.surface, overflow: 'hidden' },
  selected: { borderColor: theme.accent, backgroundColor: theme.selected }, optionTouch: { padding: 20, gap: 20, minHeight: 190 },
  heading: { fontSize: 22, fontWeight: '800', color: theme.text, flexShrink: 1 }, quantity: { fontSize: 30, fontWeight: '800', color: theme.text },
  body: { fontSize: 17, fontWeight: '600', color: theme.muted, flexShrink: 1 }, capacity: { flexDirection: 'row', alignSelf: 'flex-start', borderWidth: 2, borderColor: theme.border, borderRadius: 10, padding: 7, gap: 6 },
  price: { fontSize: 27, fontWeight: '800', color: theme.success },
  help: { alignSelf: 'flex-end', marginRight: 18, marginBottom: 18, paddingHorizontal: 18, paddingVertical: 12, minHeight: 48, borderWidth: 2, borderRadius: 30, borderColor: theme.accent, flexDirection: 'row', gap: 8, alignItems: 'center' },
  helpText: { fontSize: 19, fontWeight: '800', color: theme.accent },
  panel: { borderRadius: 24, borderWidth: 2, borderColor: theme.border, backgroundColor: theme.panel, padding: 18, gap: 16 },
  banner: { borderWidth: 2, borderColor: theme.success, backgroundColor: theme.successBackground, padding: 18, borderRadius: 18, flexDirection: 'row', gap: 12, alignItems: 'center' },
  waitBanner: { backgroundColor: theme.warningBackground, borderColor: theme.warning },
  cancelBanner: { backgroundColor: theme.dangerBackground, borderColor: theme.danger },
  mapButton: { borderWidth: 2, borderColor: theme.blue, padding: 12, borderRadius: 16, backgroundColor: theme.blueBackground },
  label: { color: theme.muted, fontSize: 17, fontWeight: '800', letterSpacing: 1 },
  plate: { borderWidth: 3, borderColor: theme.border, borderRadius: 16, backgroundColor: theme.surface, padding: 20, alignItems: 'center' },
  plateText: { color: theme.text, fontSize: 30, fontWeight: '700', letterSpacing: 4, textAlign: 'center' },
}); }
