import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { TextPetitionHistory } from '@/components/TextComponents/TextPetitionHistory';
import { ASLPetitionHistory } from '@/components/ASLComponents/ASLPetitionHistory';

interface HistoryModalProps {
  visible: boolean;
  onClose: () => void;
  peticiones: any[];
  mode: 'ASL' | 'Text';
  onCancelarPeticion: (peticionId: string) => void;
  onRatePeticion?: (peticionId: string, rating: number) => void;
}

export function HistoryModal({ visible, onClose, peticiones, mode, onCancelarPeticion, onRatePeticion }: HistoryModalProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'tabIconDefault');
  const shadowColor = useThemeColor({}, 'text');

  // Debug: Verificar el modo recibido
  console.log('📜 HistoryModal - mode recibido:', mode, 'peticiones:', peticiones.length);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={false}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { 
          backgroundColor,
          shadowColor: shadowColor,
        }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            <View style={styles.headerTitle}>
              <MaterialIcons name="notifications" size={24} color={textColor} />
              <Text style={[styles.title, { color: textColor }]}>
                Request History
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {mode === 'Text' ? (
              <>
                {console.log('📝 Renderizando TextPetitionHistory')}
                <TextPetitionHistory 
                  peticiones={peticiones} 
                  onCancelar={onCancelarPeticion}
                  onRate={onRatePeticion}
                />
              </>
            ) : (
              <>
                {console.log('🤟 Renderizando ASLPetitionHistory')}
                <ASLPetitionHistory 
                  peticiones={peticiones}
                  onCancelar={onCancelarPeticion}
                  onRate={onRatePeticion}
                />
              </>
            )}
          </ScrollView>
          
          {/* Footer with info */}
          {peticiones.length > 0 && (
            <View style={[styles.footer, { borderTopColor: borderColor }]}>
              <Text style={[styles.footerText, { color: textColor }]}>
                Total requests: {peticiones.length}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    height: '92%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 9999,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
