import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialIcons } from "@expo/vector-icons";
import { Modal, StyleSheet, View, Text, TouchableOpacity, Image } from "react-native";
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
export function RatingModal({ visible, onSubmit, onCancel, mode, peticionType }: RatingModalProps) {
    const textColor = useThemeColor({}, 'text');
    const backgroundColor = useThemeColor({}, 'background');
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

    const ratingLabels = [
        'Poor',
        'Fair', 
        'Good',
        'Very Good',
        'Excellent'
    ];

    const ratingGif = mode === 'ASL' ? require('../../assets/gifs/ComidaGif.gif') : null;

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
                    {/* Header */}
                    <View style={styles.header}>
                        <MaterialIcons name="star" size={32} color="#FFD700" />
                        <Text style={[styles.title, { color: textColor }]}>
                            {mode === 'ASL' ? 'RATE REQUEST' : 'Rate this Request'}
                        </Text>
                        <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
                            <MaterialIcons name="close" size={24} color={mutedColor} />
                        </TouchableOpacity>
                    </View>

                    {/* GIF para modo ASL */}
                    {mode === 'ASL' && ratingGif && (
                        <View style={styles.gifContainer}>
                            <Image 
                                source={ratingGif}
                                style={styles.gif}
                                resizeMode="contain"
                            />
                        </View>
                    )}

                    {/* Descripción */}
                    <Text style={[styles.description, { color: mutedColor }]}>
                        {mode === 'ASL' 
                            ? 'HOW WAS YOUR EXPERIENCE?' 
                            : 'How satisfied are you with the service provided?'
                        }
                    </Text>

                    {/* Sistema de estrellas */}
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

                    {/* Label de calificación */}
                    {rating > 0 && (
                        <Text style={[styles.ratingLabel, { color: textColor }]}>
                            {ratingLabels[rating - 1]}
                        </Text>
                    )}

                    {/* Botones de acción */}
                    <View style={styles.actions}>
                        <TouchableOpacity 
                            style={[styles.button, styles.cancelButton]}
                            onPress={handleCancel}
                        >
                            <Text style={styles.cancelButtonText}>
                                {mode === 'ASL' ? 'CANCEL' : 'Cancel'}
                            </Text>
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
                            <MaterialIcons 
                                name="send" 
                                size={20} 
                                color="#FFFFFF" 
                            />
                            <Text style={styles.submitButtonText}>
                                {mode === 'ASL' ? 'SUBMIT' : 'Submit Rating'}
                            </Text>
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
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        position: 'relative',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 8,
        flex: 1,
        textAlign: 'center',
    },
    closeButton: {
        position: 'absolute',
        right: 0,
        padding: 4,
    },
    gifContainer: {
        alignItems: 'center',
        marginVertical: 12,
    },
    gif: {
        width: 120,
        height: 120,
    },
    description: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 16,
    },
    starButton: {
        padding: 4,
    },
    ratingLabel: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 20,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
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
