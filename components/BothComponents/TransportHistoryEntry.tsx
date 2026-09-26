import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTransportTheme } from '@/hooks/useTransportTheme';
import { useWebSocket } from './websocket-provider';
import { ASLTransportDetail, ASLTransportOptionCard } from '../ASLComponents/ASLTransportCards';
import { formatTransportPrice, isCurrentAcceptance, transportDetails, transportStage } from '@/data/transport';
import { TextTransportDetail, TextTransportOptionCard } from '../TextComponents/TextTransportCards';

interface Props {
  request: { id: string; status: string; details?: unknown };
  mode: 'ASL' | 'Text';
}

export function TransportHistoryEntry({ request, mode }: Props) {
  const { acceptTransportOption, cancelarPeticion, estaConectado } = useWebSocket();
  const details = transportDetails(request.details);
  const proposals = details.transportProposals;
  const currentAccepted = isCurrentAcceptance(details);
  const active = request.status === 'pending' || request.status === 'in-progress';
  const canChoose = active && !!proposals && !currentAccepted;
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState<{ revision: number; id: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [help, setHelp] = useState(false);
  const theme = useTransportTheme();
  const s = createStyles(theme);
  const themeText = theme.text;
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const panelHeight = Math.max(0, windowHeight - Math.max(insets.top, 20) - Math.max(insets.bottom, 20));
  const asl = mode === 'ASL';
  const backgroundColor = theme.background;
  const color = theme.text;
  const accent = asl ? theme.accent : theme.blue;
  const selected = selection && selection.revision === proposals?.revision ? proposals?.options.find(option => option.id === selection.id) : undefined;

  useEffect(() => {
    setSelection(null);
    setConfirmCancel(false);
  }, [proposals?.revision, request.id]);

  const close = () => {
    if (busy) return;
    if (help) { setHelp(false); return; }
    if (confirmCancel) { setConfirmCancel(false); return; }
    setOpen(false);
    setError('');
    setSelection(null);
  };
  const accept = async () => {
    if (!selected || !proposals || busy || !canChoose) return;
    setBusy(true);
    setError('');
    try {
      await acceptTransportOption(request.id, proposals.revision, selected.id);
      setSelection(null);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'OPTION NOT ACCEPTED. TRY AGAIN.');
    } finally { setBusy(false); }
  };
  const openMap = async () => {
    const coords = details.destinationCoords;
    if (!coords) return;
    try {
      await Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${coords.latitude},${coords.longitude}`)}`);
    } catch { setError('MAP COULD NOT OPEN. TRY AGAIN.'); }
  };
  const cancel = () => {
    if (cancelarPeticion(request.id)) { setConfirmCancel(false); setOpen(false); }
    else setError('NO CONNECTION. REQUEST NOT CANCELLED.');
  };

  return <>
    <Pressable accessibilityRole="button" onPress={() => { setOpen(true); setError(''); }} style={[s.entry, { borderColor: accent }]}>
      <MaterialIcons name={canChoose ? 'directions-car' : 'local-taxi'} size={26} color={accent} />
      <View style={s.grow}><Text style={[s.entryTitle, { color: themeText }]}>{transportStage(details, request.status)}</Text><Text style={{ color: themeText }}>{canChoose ? 'VIEW OPTIONS' : 'YOUR REQUEST'}</Text></View>
      <MaterialIcons name="chevron-right" size={24} color={accent} />
    </Pressable>
    <Modal visible={open} transparent animationType="slide" onRequestClose={close}>
      <View style={[s.overlay, asl && s.aslOverlay, { paddingTop: Math.max(insets.top, 20), paddingBottom: asl ? Math.max(insets.bottom, 20) : 0 }]}>
        <View style={[asl ? s.aslSheet : s.sheet, asl && { height: panelHeight }, { backgroundColor, paddingBottom: asl ? 20 : Math.max(insets.bottom, 16) }]}>
          <View style={[s.header, asl && s.aslHeader]}><Text style={[s.title, asl && s.aslTitle, s.grow, { color }]}>{canChoose ? 'Transport options' : 'Your request'}</Text><Pressable accessibilityRole="button" accessibilityLabel="Close transport details" disabled={busy} onPress={close} style={s.close}><MaterialIcons name="close" size={24} color={color} /></Pressable></View>
          <ScrollView style={{ flex: 1, minHeight: 0 }} nestedScrollEnabled keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator contentContainerStyle={[s.content, asl && s.aslContent]}>
            {asl ? <ASLTransportDetail details={details} status={request.status} onOpenMap={openMap} /> : <TextTransportDetail details={details} status={request.status} onOpenMap={openMap} />}
            {canChoose && <>
              <Text style={[s.entryTitle, { color }]}>SELECT ONE OPTION</Text>
              {!asl && <Text style={{ color: theme.muted }}>Compare the hotel proposals, select one and confirm. Prices cover all vehicles in each option.</Text>}
              {proposals!.options.map(option => asl ? <ASLTransportOptionCard key={`${proposals!.revision}-${option.id}`} option={option} selected={selected?.id === option.id} disabled={busy} onSelect={() => setSelection({ revision: proposals!.revision, id: option.id })} onHelp={() => setHelp(true)} /> :
                <TextTransportOptionCard key={`${proposals!.revision}-${option.id}`} option={option} selected={selected?.id === option.id} disabled={busy} onSelect={() => setSelection({ revision: proposals!.revision, id: option.id })} />)}
            </>}
            {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
            {!estaConectado && <Text style={s.error}>NO CONNECTION. RECONNECT TO CONTINUE.</Text>}
          </ScrollView>
          {canChoose && <View style={[s.footer, asl && s.aslFooter]}>
            <View style={s.totalRow}><MaterialIcons name="payments" size={26} color={theme.success} /><Text style={[s.total, { color: theme.success }]}>TOTAL {selected ? formatTransportPrice(selected.priceCents) : '—'}</Text></View>
            <View style={s.buttons}>
              <Pressable style={[s.button, s.cancel]} disabled={busy || !estaConectado} onPress={() => setConfirmCancel(true)} accessibilityRole="button" accessibilityLabel="Cancel taxi request"><MaterialIcons name="cancel" color={theme.danger} size={22} />{!asl && <Text style={s.cancelText}>Cancel request</Text>}</Pressable>
              <Pressable style={[s.button, s.confirm, (!selected || busy || !estaConectado) && s.disabled]} disabled={!selected || busy || !estaConectado} onPress={accept} accessibilityRole="button">{busy ? <ActivityIndicator color="#FFFFFF" /> : <><MaterialIcons name="check-circle" color="#FFFFFF" size={22} /><Text style={s.confirmText}>Confirm</Text></>}</Pressable>
            </View>
          </View>}
          {(confirmCancel || help) && <View style={s.innerOverlay}>
            <View style={[s.prompt, { backgroundColor }]}>
              {help ? <><MaterialIcons name="pan-tool" size={44} color={accent} /><Text style={[s.title, { color }]}>ASL HELP</Text><View style={s.pending}><MaterialIcons name="hourglass-empty" size={38} color={theme.warning} /><Text style={s.pendingText}>ASL RESOURCE PENDING</Text></View><Text style={{ color }}>Validated sign-language material will appear here.</Text><Pressable onPress={() => setHelp(false)} accessibilityRole="button" style={[s.button, s.confirm]}><Text style={s.confirmText}>Close</Text></Pressable></> : <>
                <MaterialIcons name="warning" size={40} color={theme.danger} /><Text style={[s.title, { color }]}>CANCEL TAXI REQUEST?</Text><Text style={{ color }}>ALL TRANSPORT CANCEL. HOTEL STAFF RECEIVE NOTICE.</Text>
                <Pressable style={[s.button, s.cancel]} onPress={cancel} accessibilityRole="button"><Text style={s.cancelText}>YES, CANCEL REQUEST</Text></Pressable>
                <Pressable style={[s.button, s.confirm]} onPress={() => setConfirmCancel(false)} accessibilityRole="button"><Text style={s.confirmText}>NO, KEEP REQUEST</Text></Pressable>
              </>}
            </View>
          </View>}
        </View>
      </View>
    </Modal>
  </>;
}

function createStyles(theme: ReturnType<typeof useTransportTheme>) { return StyleSheet.create({
  aslOverlay: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  aslSheet: { width: '100%', maxWidth: 520, maxHeight: '100%', alignSelf: 'center', borderRadius: 20, padding: 20, gap: 16, overflow: 'hidden' },
  aslHeader: { paddingHorizontal: 0, paddingVertical: 0, borderBottomWidth: 0 }, aslTitle: { fontSize: 20, fontWeight: '700' },
  aslContent: { padding: 0, gap: 12 }, aslFooter: { padding: 0, borderTopWidth: 0 },
  grow: { flex: 1 }, entry: { borderWidth: 1.5, borderRadius: 14, padding: 14, gap: 10, flexDirection: 'row', alignItems: 'center' },
  entryTitle: { fontSize: 16, fontWeight: '700' }, overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { flex: 1, width: '100%', maxWidth: 620, alignSelf: 'center', borderTopLeftRadius: 26, borderTopRightRadius: 26, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderColor: theme.border },
  title: { fontSize: 25, fontWeight: '800' }, close: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 18, gap: 18 }, textPanel: { padding: 16, borderRadius: 14, gap: 12 },
  footer: { padding: 16, borderTopWidth: 1, borderColor: theme.border, gap: 12 }, total: { fontSize: 22, fontWeight: '800', flexShrink: 1 }, totalRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  buttons: { flexDirection: 'row', gap: 12 }, button: { flexGrow: 1, flexBasis: 0, minHeight: 54, padding: 14, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  cancel: { borderWidth: 2, borderColor: theme.danger, backgroundColor: theme.dangerBackground }, confirm: { backgroundColor: '#245B2A' },
  cancelText: { fontWeight: '800', fontSize: 17, color: theme.danger, flexShrink: 1 }, confirmText: { fontWeight: '800', fontSize: 17, color: '#FFFFFF', flexShrink: 1 },
  disabled: { opacity: 0.45 }, error: { color: theme.danger, fontWeight: '600', fontSize: 14 },
  innerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end', padding: 16 },
  prompt: { borderRadius: 24, padding: 24, gap: 16 }, pending: { minHeight: 160, borderWidth: 2, borderStyle: 'dashed', borderColor: theme.warning, alignItems: 'center', justifyContent: 'center', borderRadius: 18, gap: 12, backgroundColor: theme.warningBackground },
  pendingText: { color: theme.warning, fontWeight: '700' },
}); }
