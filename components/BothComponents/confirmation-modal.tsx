import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, Dimensions, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ConfirmationModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  mode: 'ASL' | 'Text';
  title: string;
  description?: string;
  gif?: any;
  iconName: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  confirmText: string;
  cancelText: string;
}

export function ConfirmationModal({ 
  visible, 
  onConfirm, 
  onCancel, 
  mode,
  title,
  description,
  gif,
  iconName,
  iconColor = '#F44336',
  confirmText,
  cancelText
}: ConfirmationModalProps) {
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'tabIconDefault');
  const cardBg = useThemeColor({}, 'card');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: cardBg }]}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={[styles.iconCircle, { backgroundColor: `${iconColor}20` }]}>
              <MaterialIcons name={iconName} size={40} color={iconColor} />
            </View>
          </View>

          {/* GIF para modo ASL */}
          {mode === 'ASL' && gif && (
            <View style={styles.gifContainer}>
              <Image 
                source={gif}
                style={styles.gif}
                resizeMode="contain"
              />
            </View>
          )}

          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: textColor }]}>
              {title}
            </Text>
            {mode === 'Text' && description && (
              <Text style={[styles.description, { color: mutedColor }]}>
                {description}
              </Text>
            )}
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <MaterialIcons name="close" size={20} color="#6B7280" />
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <MaterialIcons name="check" size={20} color="#FFFFFF" />
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: SCREEN_WIDTH * 0.85,
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F44336',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  gifContainer: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  gif: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#F44336',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
