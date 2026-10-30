import { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TERMS_AND_CONDITIONS } from '@/data/termsAndConditions';
import { useThemeColor } from '@/hooks/use-theme-color';

const paragraphs = TERMS_AND_CONDITIONS.replace(' (ACADEMIC PROPOSAL)', '').split(/\n\s*\n/);

function FormattedText({ text }: { text: string }) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => (
    <Text key={index} style={part.startsWith('**') ? styles.bold : undefined}>
      {part.replace(/^\*\*|\*\*$/g, '').replace(/_landmarks_/g, 'landmarks')}
    </Text>
  ));
}

export function TermsConsentModal({ onContinue, onClose }: { onContinue: () => void; onClose?: () => void }) {
  const [accepted, setAccepted] = useState(false);
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'muted');
  const borderColor = useThemeColor({ light: '#CBD5E1', dark: '#475569' }, 'background');
  const accent = useThemeColor({ light: '#1D4ED8', dark: '#93C5FD' }, 'text');
  const buttonColor = useThemeColor({ light: '#1D4ED8', dark: '#2563EB' }, 'background');

  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => onClose?.()}>
      <View style={[styles.overlay, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
        <View style={[styles.panel, { backgroundColor, height: Math.min(820, height - insets.top - insets.bottom - 32) }]}>
          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            <MaterialIcons name="policy" size={28} color={accent} />
            <Text accessibilityRole="header" style={[styles.title, { color: textColor }]}>Terms and conditions</Text>
          </View>
          <ScrollView style={styles.document} contentContainerStyle={styles.documentContent}
            showsVerticalScrollIndicator testID="terms-document">
            <Text style={[styles.introduction, { color: mutedColor }]}>
              Please read the terms, conditions and privacy policy before scanning your room QR code.
            </Text>
            {paragraphs.map((paragraph, index) => (
              <Text key={index} selectable style={[styles.paragraph, { color: textColor }]}>
                <FormattedText text={paragraph} />
              </Text>
            ))}
          </ScrollView>
          <View style={[styles.footer, { borderTopColor: borderColor }]}>
            {onClose ? <Pressable accessibilityRole="button" onPress={onClose} testID="terms-close" style={styles.checkboxRow}>
              <Text style={{ color: accent }}>CLOSE PRIVACY POLICY</Text>
            </Pressable> : <>
            <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: accepted }}
              accessibilityLabel="I accept the terms and conditions."
              onPress={() => setAccepted(value => !value)} style={styles.checkboxRow} testID="terms-checkbox">
              <MaterialIcons name={accepted ? 'check-box' : 'check-box-outline-blank'} size={28} color={accent} />
              <Text style={[styles.checkboxLabel, { color: textColor }]}>I accept the terms and conditions.</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityState={{ disabled: !accepted }}
              disabled={!accepted} onPress={() => { if (accepted) onContinue(); }}
              style={[styles.continueButton, { backgroundColor: buttonColor, opacity: accepted ? 1 : 0.45 }]}
              testID="terms-continue">
              <Text style={styles.continueLabel}>Continue</Text>
              <MaterialIcons name="arrow-forward" size={22} color="#FFFFFF" />
            </Pressable>
            </>}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  panel: { width: '100%', maxWidth: 720, borderRadius: 20, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 18, borderBottomWidth: 1 },
  title: { flex: 1, fontSize: 21, fontWeight: '700' },
  document: { flex: 1, minHeight: 0 },
  documentContent: { padding: 20 },
  introduction: { fontSize: 15, lineHeight: 23, marginBottom: 20 },
  paragraph: { fontSize: 15, lineHeight: 24, marginBottom: 16 },
  bold: { fontWeight: '700' },
  footer: { borderTopWidth: 1, paddingHorizontal: 18, paddingVertical: 12, gap: 12 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48 },
  checkboxLabel: { flex: 1, fontSize: 16, lineHeight: 23 },
  continueButton: { minHeight: 48, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 12 },
  continueLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
