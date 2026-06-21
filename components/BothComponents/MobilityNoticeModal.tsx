import { MaterialIcons } from '@expo/vector-icons';
import { Image, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

interface MobilityNoticeModalProps {
  visible: boolean;
  onClose: () => void;
}

export function MobilityNoticeModal({ visible, onClose }: MobilityNoticeModalProps) {
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'muted');
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.modalContainer, { backgroundColor }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="info-outline" size={36} color="#D4A300" />
            </View>
          </View>

          <Text style={[styles.title, { color: textColor }]}>
            TRANSPORT NOTICE
          </Text>
          <Text style={[styles.message, { color: mutedColor }]}>
            TRANSPORT SERVICE NEED SCHEDULE 24 TO 48 HOURS BEFORE.
          </Text>

          <View style={styles.gifContainer}>
            <Image
              source={require('../../assets/gifs/ModASL.gif')}
              style={styles.gif}
              resizeMode="contain"
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.buttonText}>UNDERSTAND</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 460,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  iconContainer: {
    marginTop: 4,
  },
  iconCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#FFF8D6',
    borderWidth: 2,
    borderColor: '#FFD54F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
  },
  gifContainer: {
    width: '100%',
    height: 170,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFD54F',
    backgroundColor: '#FFF8D6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gif: {
    width: '100%',
    height: '100%',
  },
  button: {
    marginTop: 4,
    width: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
