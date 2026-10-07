import { useThemeColor } from '@/hooks/use-theme-color';
import { ASLVideoPreview } from '@/components/ASLComponents/ASLVideoPreview';
import { MaterialIcons } from "@expo/vector-icons";
import { Image, Modal, Pressable, ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CallModalProps {
    visible: boolean;
    onClose: () => void;
    onMakeCall: () => void;
    gifSource?: any;
    videoSource?: number;
}

export function CallModal({
    visible,
    onClose,
    onMakeCall,
    gifSource,
    videoSource = require('../../assets/gifs/00026.mp4'),
}: CallModalProps) {
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const mediaWidth = Math.max(Math.min(width - 40, 640) - 32, 0);
    const availableHeight = Math.max(height - Math.max(20, insets.top) - Math.max(20, insets.bottom), 0);
    const mediaHeight = Math.min(mediaWidth, availableHeight * 0.5, 360);
    const modalHeight = Math.min(availableHeight * 0.9, mediaHeight + 240);
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const iconColor = useThemeColor({ light: '#21864B', dark: '#81C784' }, 'tint');

    if (!visible) return null;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View
                style={[styles.modalOverlay, { paddingTop: Math.max(20, insets.top), paddingBottom: Math.max(20, insets.bottom) }]}
            >
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="CLOSE" />
                <View
                    style={[styles.modalContent, { backgroundColor, height: modalHeight }]}
                >
                    <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalInner} nestedScrollEnabled>
                        {/* Header del modal */}
                        <View style={styles.modalHeader}>
                            <View style={[styles.modalIcon, { backgroundColor, borderColor: iconColor, borderWidth: 2 }]}>
                                <MaterialIcons
                                    name="phone"
                                    size={48}
                                    color={iconColor}
                                />
                            </View>
                        </View>

                        <View pointerEvents="none" style={[styles.instructionMedia, { height: mediaHeight }]}>
                            {gifSource ? (
                                <Image source={gifSource} style={styles.media} resizeMode="contain" />
                            ) : (
                                <ASLVideoPreview source={videoSource} style={styles.media} />
                            )}
                        </View>

                        {/* Botones */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: '#21864B' }]}
                                accessibilityRole="button"
                                accessibilityLabel="Start video call"
                                onPress={onMakeCall}
                                activeOpacity={0.8}
                            >
                                <MaterialIcons name="phone" size={24} color="#FFFFFF" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.cancelButton, { backgroundColor, borderColor: textColor }]}
                                accessibilityRole="button"
                                accessibilityLabel="Cancel"
                                onPress={onClose}
                                activeOpacity={0.8}
                            >
                                <MaterialIcons name="close" size={24} color={textColor} />
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
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
        padding: 16,
        width: '100%',
        maxWidth: 640,
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
    modalScroll: { flex: 1, minHeight: 0 },
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
    instructionMedia: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
    },
    media: { width: '100%', height: '100%' },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    actionButton: {
        flex: 1,
        minHeight: 56,
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
        flex: 1,
        minHeight: 56,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 2,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
