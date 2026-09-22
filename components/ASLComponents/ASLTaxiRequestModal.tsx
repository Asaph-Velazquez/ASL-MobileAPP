import React from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { TAXI_DESTINATION_CATEGORIES, getDestinationsByCategory, type TaxiDestination } from '@/data/taxiDestinations';
import { buildTaxiRequestPayload, recommendedTaxiDate, taxiScheduleError, TAXI_PASSENGER_OPTIONS, TAXI_TIME_OPTIONS, type TaxiRequestDraft, type TaxiRequestPayload } from '@/data/taxiRequest';
import { TaxiDateSelector } from '@/components/BothComponents/TaxiDateSelector';
import { taxiAslResources } from '@/data/taxiAslResources';
import { transportAslColors, transportTimeAppearance } from '@/constants/transportAslTheme';
import { DestinationVisualCard, PeopleSymbols, TaxiHelpSheet, TaxiMapPreview, TaxiTimeSummary, VisualChoice, type TaxiHelpResources } from './ASLTaxiRequestVisuals';

const STEPS = ['SELECT CATEGORY', 'SELECT DESTINATION', 'SELECT DATE / TIME', 'HOW MANY PEOPLE?', 'LUGGAGE?', 'CONFIRM REQUEST'];
const emptyDraft = (): TaxiRequestDraft => ({ category: null, destination: null, date: recommendedTaxiDate(), time: null, passengers: null, luggage: null });

export function ASLTaxiRequestModal({ visible, onClose, onSend, isLoading = false, helpResources = taxiAslResources }: {
  visible: boolean; onClose: () => void; onSend: (payload: TaxiRequestPayload) => void | boolean | Promise<void | boolean>;
  isLoading?: boolean;
  /** Keys are destination IDs or step titles. Only verified, relevant resources should be configured. */
  helpResources?: TaxiHelpResources;
}) {
  const color = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const mutedColor = useThemeColor({}, 'muted');
  const insets = useSafeAreaInsets();
  const [step, setStep] = React.useState(0);
  const [draft, setDraft] = React.useState(emptyDraft);
  const [help, setHelp] = React.useState<{ key: string; title: string; destination?: TaxiDestination } | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [sending, setSending] = React.useState(false);
  const lock = React.useRef(false);
  const busy = sending || isLoading;
  const reset = () => { setStep(0); setDraft(emptyDraft()); setHelp(null); setError(null); };
  React.useEffect(() => { if (!visible) reset(); }, [visible]);
  const close = () => { if (busy) return; reset(); onClose(); };
  const next = (patch: Partial<TaxiRequestDraft>) => { setDraft(current => ({ ...current, ...patch })); setError(null); setStep(step + 1); };
  const openDestinationHelp = (destination: TaxiDestination) => setHelp({ key: destination.id, title: destination.label, destination });
  const destinationHelp = () => draft.destination && openDestinationHelp(draft.destination);
  const submit = async () => {
    if (lock.current || isLoading) return;
    lock.current = true;
    setSending(true);
    setError(null);
    try {
      const payload = buildTaxiRequestPayload(draft, 'asl_guided');
      const result = await onSend(payload);
      if (result === false) throw new Error('Request failed. Please try again.');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Request failed. Please try again.');
    } finally { lock.current = false; setSending(false); }
  };
  const time = TAXI_TIME_OPTIONS.find(option => option.id === draft.time);
  const luggageColor = draft.luggage ? transportAslColors.luggageYes : transportAslColors.luggageNo;
  const headerIcons = ['category', 'place', 'schedule', 'people', 'luggage', 'check-circle'] as const;
  const headerColor = step === 2 ? transportTimeAppearance(draft.time ?? '07:00').color
    : step === 3 ? transportAslColors.people.color
    : step >= 4 ? transportAslColors.luggageYes.color : transportAslColors.destination.color;
  const dismiss = () => help ? setHelp(null) : close();
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={dismiss}>
    <Pressable style={[styles.overlay, { paddingTop: Math.max(20, insets.top), paddingBottom: Math.max(20, insets.bottom) }]} onPress={dismiss}>
      <Pressable style={[styles.content, { backgroundColor }]} onPress={event => event.stopPropagation()}>
      <View style={styles.flow} accessibilityElementsHidden={!!help} importantForAccessibility={help ? 'no-hide-descendants' : 'auto'}>
        <View style={styles.header}>
          <MaterialIcons name={headerIcons[step]} size={26} color={headerColor} />
          <View style={{ flex: 1 }}><Text style={[styles.title, { color }]}>{STEPS[step]}</Text><Text style={{ color }}>{step + 1} / 6</Text></View>
          <TouchableOpacity disabled={busy} style={styles.icon} accessibilityRole="button" accessibilityLabel="Close taxi request" onPress={close}><MaterialIcons name="close" size={28} color={color} /></TouchableOpacity>
        </View>
        <ScrollView key={step} style={styles.scroll} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {step === 0 && TAXI_DESTINATION_CATEGORIES.map(category => <VisualChoice key={category.id} label={category.label}
            icon={category.icon as React.ComponentProps<typeof MaterialIcons>['name']} selected={draft.category === category.id}
            iconColor={category.iconColor} iconBackground={category.iconBackground}
            onPress={() => next(draft.category === category.id ? {} : { ...emptyDraft(), category: category.id })} />)}
          {step === 1 && draft.category && getDestinationsByCategory(draft.category).map(destination => <DestinationVisualCard key={destination.id} destination={destination}
            onSelect={() => next({ destination })} onHelp={() => openDestinationHelp(destination)} />)}
          {step === 2 && <>
            <TaxiDateSelector value={draft.date} showGuidance={false} iconColor={transportAslColors.destination.color} onChange={date => { setDraft({ ...draft, date, time: null }); setError(null); }} />
            <View style={styles.grid}>{TAXI_TIME_OPTIONS.map(option => { const period = transportTimeAppearance(option.id); return <View key={option.id} style={styles.cell}>
              <VisualChoice label={option.label} icon={period.icon} iconColor={period.color} iconBackground={period.background} selected={draft.time === option.id}
                onPress={() => { const message = taxiScheduleError(draft.date, option.id); if (message) setError(message); else next({ time: option.id }); }} />
            </View>; })}</View>
          </>}
          {step === 3 && <View style={styles.grid}>{TAXI_PASSENGER_OPTIONS.map(count => <View key={count} style={styles.cell}>
            <VisualChoice label={String(count)} icon="person" iconColor={transportAslColors.people.color} iconBackground={transportAslColors.people.background} selected={draft.passengers === count} onPress={() => next({ passengers: count })}><PeopleSymbols count={count} /></VisualChoice>
          </View>)}</View>}
          {step === 4 && <View style={styles.grid}>{[true, false].map(luggage => <View key={String(luggage)} style={styles.cell}>
            <VisualChoice label={luggage ? 'YES' : 'NO'} icon={luggage ? 'luggage' : 'no-luggage'} iconColor={luggage ? transportAslColors.luggageYes.color : transportAslColors.luggageNo.color} iconBackground={luggage ? transportAslColors.luggageYes.background : transportAslColors.luggageNo.background} selected={draft.luggage === luggage} onPress={() => next({ luggage })}>
              <MaterialIcons name={luggage ? 'check-circle' : 'cancel'} size={32} color={luggage ? transportAslColors.luggageYes.color : transportAslColors.luggageNo.color} />
            </VisualChoice>
          </View>)}</View>}
          {step === 5 && draft.destination && <>
            <DestinationVisualCard destination={draft.destination} onHelp={destinationHelp} />
            <TaxiMapPreview destination={draft.destination} />
            {time && <TaxiTimeSummary date={draft.date} time={time.id} label={time.label} />}
            <View style={styles.grid}>
              <View style={styles.cell}><VisualChoice label={`${draft.passengers} ${draft.passengers === 1 ? 'PERSON' : 'PEOPLE'}`} icon="person" iconColor={transportAslColors.people.color} iconBackground={transportAslColors.people.background}><PeopleSymbols count={draft.passengers ?? 0} /></VisualChoice></View>
              <View style={styles.cell}><VisualChoice label={draft.luggage ? 'LUGGAGE: YES' : 'LUGGAGE: NO'} icon={draft.luggage ? 'luggage' : 'no-luggage'} iconColor={luggageColor.color} iconBackground={luggageColor.background} /></View>
            </View>
          </>}
          {error && <Text accessibilityRole="alert" style={[styles.error, { color }]}>{error}</Text>}
        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.back, { borderColor: mutedColor }]} accessibilityRole="button" accessibilityLabel={step === 0 ? 'Cancel taxi request' : 'Back'} disabled={busy} onPress={() => { if (step === 0) close(); else { setStep(step - 1); setError(null); } }}>
            <MaterialIcons name={step === 0 ? 'close' : 'arrow-back'} size={26} color={color} />
          </TouchableOpacity>
          {step > 0 && step < 5 && <TouchableOpacity style={[styles.back, { borderColor: mutedColor }]} accessibilityRole="button" accessibilityLabel="Cancel taxi request" disabled={busy} onPress={close}><MaterialIcons name="close" size={26} color={color} /></TouchableOpacity>}
          {step === 5 && <TouchableOpacity style={[styles.send, busy && { opacity: 0.5 }]} accessibilityRole="button" disabled={busy} onPress={submit}>
            {busy ? <ActivityIndicator color="#FFFFFF" /> : <><MaterialIcons name="send" size={20} color="#FFFFFF" /><Text style={styles.sendLabel}>{error ? 'RETRY REQUEST' : 'SEND REQUEST'}</Text></>}
          </TouchableOpacity>}
        </View>
      </View>
      </Pressable>
      {help && <TaxiHelpSheet key={help.key} title={help.title} destination={help.destination} resource={helpResources[help.key]} onClose={() => setHelp(null)} bottomInset={insets.bottom} />}
    </Pressable>
  </Modal>;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  content: { width: '100%', maxWidth: 520, maxHeight: '92%', borderRadius: 20, padding: 20, overflow: 'hidden' },
  flow: { flexShrink: 1, gap: 16 }, scroll: { flexShrink: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 20, fontWeight: '700' }, icon: { minWidth: 40, minHeight: 44, alignItems: 'center', justifyContent: 'center' }, body: { gap: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, cell: { width: '47%', flexGrow: 1 },
  footer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, back: { flexGrow: 1, flexBasis: 100, borderWidth: 2, borderRadius: 12, padding: 16, alignItems: 'center', justifyContent: 'center' },
  send: { backgroundColor: '#4CAF50', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, flexGrow: 1, flexBasis: 140 },
  sendLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', flexShrink: 1 }, error: { borderWidth: 1, borderColor: '#D84343', borderRadius: 14, padding: 16 },
});
