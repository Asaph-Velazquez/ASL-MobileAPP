import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ServiceOption } from './ServiceCard';

interface ServiceDetails {
  horario?: string;
  ubicacion?: string;
  incluye?: string[];
  nota?: string;
}

interface InfoModalProps {
  visible: boolean;
  onClose: () => void;
  selectedOption: ServiceOption | null;
}

/**
 * Modal informativo reutilizable
 * Usado en TextServices para mostrar detalles de servicios incluidos
 */
export function InfoModal({
  visible,
  onClose,
  selectedOption,
}: InfoModalProps) {
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'muted');
  const cardBg = useThemeColor({}, 'card');

  if (!selectedOption || !selectedOption.detalles) return null;

  const detalles: ServiceDetails = selectedOption.detalles;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable 
        style={styles.modalOverlay}
        onPress={onClose}
      >
        <Pressable 
          style={[styles.modalContent, { backgroundColor: cardBg }]}
          onPress={(e) => e.stopPropagation()}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header del modal */}
            <View style={styles.modalHeader}>
              <View style={[styles.modalIcon, { backgroundColor: selectedOption.bgColor }]}>
                {selectedOption.iconType === "material" ? (
                  <MaterialIcons 
                    name={selectedOption.icon as any} 
                    size={48} 
                    color={selectedOption.iconColor} 
                  />
                ) : (
                  <MaterialCommunityIcons 
                    name={selectedOption.icon as any} 
                    size={48} 
                    color={selectedOption.iconColor} 
                  />
                )}
              </View>
              <Text style={[styles.modalTitle, { color: textColor }]}>
                {selectedOption.id}
              </Text>
              <Text style={[styles.modalDescription, { color: mutedColor }]}>
                {selectedOption.desciption || selectedOption.description}
              </Text>
            </View>

            {/* Detalles del servicio */}
            <View style={styles.detailsContainer}>
              {/* Horario */}
              {detalles.horario && (
                <View style={styles.detailRow}>
                  <MaterialIcons name="schedule" size={24} color={selectedOption.iconColor} />
                  <View style={styles.detailText}>
                    <Text style={[styles.detailLabel, { color: textColor }]}>Schedule</Text>
                    <Text style={[styles.detailValue, { color: mutedColor }]}>
                      {detalles.horario}
                    </Text>
                  </View>
                </View>
              )}

              {/* Ubicación */}
              {detalles.ubicacion && (
                <View style={styles.detailRow}>
                  <MaterialIcons name="location-on" size={24} color={selectedOption.iconColor} />
                  <View style={styles.detailText}>
                    <Text style={[styles.detailLabel, { color: textColor }]}>Location</Text>
                    <Text style={[styles.detailValue, { color: mutedColor }]}>
                      {detalles.ubicacion}
                    </Text>
                  </View>
                </View>
              )}

              {/* Incluye */}
              {detalles.incluye && detalles.incluye.length > 0 && (
                <View style={styles.detailRow}>
                  <MaterialIcons name="check-circle" size={24} color={selectedOption.iconColor} />
                  <View style={styles.detailText}>
                    <Text style={[styles.detailLabel, { color: textColor }]}>Includes</Text>
                    {detalles.incluye.map((item: string, idx: number) => (
                      <Text key={idx} style={[styles.detailValue, { color: mutedColor }]}>
                        • {item}
                      </Text>
                    ))}
                  </View>
                </View>
              )}

              {/* Nota */}
              {detalles.nota && (
                <View style={[styles.notaContainer, { 
                  backgroundColor: cardBg,
                  borderColor: selectedOption.iconColor 
                }]}>
                  <MaterialIcons name="info" size={20} color={selectedOption.iconColor} />
                  <Text style={styles.notaText}>
                    <Text style={{ color: selectedOption.iconColor, fontWeight: '600' }}>Note: </Text>
                    <Text style={{ color: textColor }}>{detalles.nota}</Text>
                  </Text>
                </View>
              )}
            </View>

            {/* Botón cerrar */}
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: selectedOption.iconColor }]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  detailsContainer: {
    gap: 20,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  detailText: {
    flex: 1,
    gap: 4,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    lineHeight: 20,
  },
  notaContainer: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    alignItems: 'flex-start',
    marginTop: 8,
    borderWidth: 1,
  },
  notaText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  closeButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
