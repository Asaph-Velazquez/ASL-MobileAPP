import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { ServiceOption } from './ServiceCard';
import { useWebSocket } from '../BothComponents/websocket-provider';

interface PetitionModalProps {
  visible: boolean;
  onClose: () => void;
  selectedOption: ServiceOption | null;
  onSend: (description: string) => void | Promise<void>;
  placeholder?: string;
  sendButtonText?: string;
  isLoading?: boolean;
}

/**
 * Modal reutilizable para enviar peticiones con descripción
 * Usado en TextRoomS, TextReportProblem, TextMovilidad
 */
export function PetitionModal({
  visible,
  onClose,
  selectedOption,
  onSend,
  placeholder,
  sendButtonText = "Send Request",
  isLoading = false
}: PetitionModalProps) {
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'muted');
  const cardBg = useThemeColor({}, 'card');
  const bgColor = useThemeColor({}, 'background');
  const { estaConectado } = useWebSocket();
  const [description, setDescription] = useState('');

  const handleSend = async () => {
    await onSend(description);
    setDescription('');
  };

  const handleClose = () => {
    setDescription('');
    onClose();
  };

  if (!selectedOption) return null;

  const finalPlaceholder = placeholder || selectedOption.placeholder || 'Describe your request...';

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <Pressable 
        style={styles.modalOverlay}
        onPress={handleClose}
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
              
              {/* Indicador de conexión */}
              <View style={styles.connectionIndicator}>
                <View style={[styles.connectionDot, { backgroundColor: estaConectado ? '#4CAF50' : '#F44336' }]} />
                <Text style={[styles.connectionText, { color: mutedColor }]}>
                  {estaConectado ? 'Connected' : 'Disconnected'}
                </Text>
              </View>
              
              <Text style={[styles.modalDescription, { color: mutedColor }]}>
                {selectedOption.desciption || selectedOption.description}
              </Text>
            </View>

            {/* TextArea */}
            <TextInput
              style={[styles.textArea, { 
                color: textColor, 
                backgroundColor: bgColor,
                borderColor: selectedOption.iconColor 
              }]}
              placeholder={finalPlaceholder}
              placeholderTextColor={mutedColor}
              multiline
              numberOfLines={6}
              value={description}
              onChangeText={setDescription}
              textAlignVertical="top"
            />

            {/* Botones */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.sendButton, { 
                  backgroundColor: selectedOption.iconColor,
                  opacity: isLoading || !description.trim() ? 0.5 : 1
                }]} 
                onPress={handleSend}
                disabled={isLoading || !description.trim()}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialIcons name="send" size={20} color="#FFFFFF" />
                    <Text style={styles.sendButtonText}>{sendButtonText}</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: mutedColor }]}
                onPress={handleClose}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Text style={[styles.cancelButtonText, { color: textColor }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
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
  textArea: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    marginBottom: 20,
  },
  buttonContainer: {
    gap: 12,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    padding: 16,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  connectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 12,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
