import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialIcons } from "@expo/vector-icons";
import { Image, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CallModalProps {
    visible: boolean;
    onClose: () => void;
    onMakeCall: () => void;
    gifSource?: any;
}

export function CallModal({
    visible,
    onClose,
    onMakeCall,
    gifSource = require('../../assets/gifs/ComidaGif.gif'), // GIF por defecto, cambiar por el de llamada
}: CallModalProps) {
    const cardBg = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');

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
                    <View style={styles.modalInner}>
                        {/* Header del modal */}
                        <View style={styles.modalHeader}>
                            <View style={[styles.modalIcon, { backgroundColor: '#4CAF50' }]}>
                                <MaterialIcons 
                                    name="phone" 
                                    size={48} 
                                    color="#FFFFFF" 
                                />
                            </View>
                        </View>

                        {/* GIF de instrucción para llamada en ASL */}
                        <Image 
                            source={gifSource}
                            style={styles.instructionGif}
                            resizeMode="contain"
                        />

                        {/* Botones */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity 
                                style={[styles.actionButton, { backgroundColor: '#4CAF50' }]} 
                                onPress={onMakeCall}
                                activeOpacity={0.8}
                            >
                            <MaterialIcons name="phone" size={24} color="#FFFFFF" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={onClose}
                                activeOpacity={0.8}
                            >
                                <MaterialIcons name="close" size={24} color={textColor} />
                            </TouchableOpacity>
                        </View>
                    </View>
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
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalInner: {
        gap: 20,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 12,
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
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        textAlign: 'center',
        opacity: 0.7,
    },
    instructionGif: {
        width: '100%',
        height: 200,
    },
    buttonContainer: {
        gap: 12,
        marginTop: 8,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 12,
        padding: 16,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButton: {
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
