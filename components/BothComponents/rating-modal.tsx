import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialIcons } from "@expo/vector-icons";
import { Modal, StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { useState } from 'react';

interface RatingModalProps {
    visible: boolean;
    onSubmit: (rating: number) => void;
    onCancel: () => void;
    mode: "ASL" | "Text";
    peticionType?: string;
}

/**
 * Modal de calificación con sistema de 5 estrellas
 * Soporta modo ASL (visual con GIFs) y modo Text
 */
export function RatingModal({ visible, onSubmit, onCancel, mode }: RatingModalProps) {
    const cardBg = useThemeColor({}, 'card');
    const mutedColor = useThemeColor({}, 'tabIconDefault');
    
    const [rating, setRating] = useState(0);
    const [hoveredStar, setHoveredStar] = useState(0);

    const handleSubmit = () => {
        if (rating > 0) {
            onSubmit(rating);
            setRating(0);
            setHoveredStar(0);
        }
    };

    const handleCancel = () => {
        setRating(0);
        setHoveredStar(0);
        onCancel();
    };

    const displayRating = hoveredStar || rating;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleCancel}
        >
            <TouchableOpacity 
                style={styles.overlay} 
                activeOpacity={1}
                onPress={handleCancel}
            >
                <TouchableOpacity 
                    activeOpacity={1} 
                    onPress={(e) => e.stopPropagation()}
                    style={[styles.modalContainer, { backgroundColor: cardBg }]}
                >
                    <View style={styles.starsContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity
                                key={star}
                                onPress={() => setRating(star)}
                                onPressIn={() => setHoveredStar(star)}
                                onPressOut={() => setHoveredStar(0)}
                                style={styles.starButton}
                            >
                                <MaterialIcons 
                                    name={star <= displayRating ? "star" : "star-border"}
                                    size={48}
                                    color={star <= displayRating ? "#FFD700" : mutedColor}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity 
                            style={[styles.button, styles.cancelButton]}
                            onPress={handleCancel}
                        >
                            <MaterialIcons name="close" size={20} color="#999999" />
                            {mode === 'Text' && <Text style={styles.cancelButtonText}>Cancel</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[
                                styles.button,
                                styles.submitButton,
                                rating === 0 && styles.submitButtonDisabled
                            ]}
                            onPress={handleSubmit}
                            disabled={rating === 0}
                        >
                            <MaterialIcons name="send" size={20} color="#FFFFFF" />
                            {mode === 'Text' && <Text style={styles.submitButtonText}>Submit</Text>}
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 360,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginVertical: 6,
    },
    starButton: {
        padding: 4,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        gap: 8,
    },
    cancelButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#999',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#999',
    },
    submitButton: {
        backgroundColor: '#4CAF50',
    },
    submitButtonDisabled: {
        backgroundColor: '#CCCCCC',
        opacity: 0.5,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
