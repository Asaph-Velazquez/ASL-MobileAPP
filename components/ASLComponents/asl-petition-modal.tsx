import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { CameraView, CameraType } from 'expo-camera';
import { Image, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ASLPetitionModalProps {
    visible: boolean;
    onClose: () => void;
    selectedOption: {
        id: string;
        gifSource: any;
        icon: string;
        iconType: 'material' | 'community';
        iconColor: string;
        bgColor: string;
    } | null;
    cameraActive: boolean;
    onActivateCamera: () => void;
    onCloseCamera: () => void;
    cameraText?: string;
}

export function ASLPetitionModal({
    visible,
    onClose,
    selectedOption,
    cameraActive,
    onActivateCamera,
    onCloseCamera,
    cameraText = "Show your message in sign language"
}: ASLPetitionModalProps) {
    const cardBg = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');

    if (!selectedOption) return null;

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
                    {!cameraActive ? (
                        <View style={styles.modalInner}>
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
                            </View>

                            {/* GIF de la petición del servicio seleccionado */}
                            <Image 
                                source={selectedOption.gifSource}
                                style={styles.instructionGif}
                                resizeMode="contain"
                            />

                            {/* Botones */}
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity 
                                    style={[styles.actionButton, { backgroundColor: selectedOption.iconColor }]} 
                                    onPress={onActivateCamera}
                                    activeOpacity={0.8}
                                >
                                    <MaterialIcons name="videocam" size={24} color="#FFFFFF" />
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
                    ) : (
                        <View style={styles.cameraViewContainer}>
                            <CameraView style={styles.camera} facing="front">
                                <View style={styles.cameraOverlay}>
                                    <Text style={styles.cameraText}>
                                        {cameraText}
                                    </Text>
                                    <TouchableOpacity 
                                        style={styles.closeCamera} 
                                        onPress={onCloseCamera}
                                    >
                                        <MaterialIcons name="close" size={32} color="#FFFFFF" />
                                    </TouchableOpacity>
                                </View>
                            </CameraView>
                        </View>
                    )}
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
    cameraViewContainer: {
        borderRadius: 12,
        overflow: 'hidden',
        height: 500,
    },
    camera: {
        flex: 1,
    },
    cameraOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'space-between',
        padding: 20,
    },
    cameraText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 12,
        borderRadius: 8,
    },
    closeCamera: {
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 50,
        padding: 15,
    },
});
