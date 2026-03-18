import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { ConfirmationModal } from '../BothComponents/confirmation-modal';
import { RatingModal } from '../BothComponents/rating-modal';
import { useState } from 'react';

interface TextPetitionHistoryProps {
    peticiones: any[];
    onCancelar: (peticionId: string) => void;
    onRate?: (peticionId: string, rating: number) => void;
}

/**
 * Historial de peticiones en modo Text
 * Muestra mensajes de texto enviados con su estado
 */
export function TextPetitionHistory({ peticiones, onCancelar, onRate }: TextPetitionHistoryProps) {
    const textColor = useThemeColor({}, 'text');
    const cardBg = useThemeColor({}, 'card');
    const mutedColor = useThemeColor({}, 'tabIconDefault');
    const shadowColor = useThemeColor({}, 'text');
    
    const [modalVisible, setModalVisible] = useState(false);
    const [ratingModalVisible, setRatingModalVisible] = useState(false);
    const [selectedPeticion, setSelectedPeticion] = useState<any>(null);

    // Debug: Ver las peticiones
    console.log('📋 TextPetitionHistory - Peticiones:', peticiones.length, peticiones);

    const handleCancelar = (peticion: any) => {
        setSelectedPeticion(peticion);
        setModalVisible(true);
    };

    const confirmCancelar = () => {
        if (selectedPeticion) {
            onCancelar(selectedPeticion.id);
            setModalVisible(false);
            setSelectedPeticion(null);
        }
    };

    const handleRate = (peticion: any) => {
        setSelectedPeticion(peticion);
        setRatingModalVisible(true);
    };

    const submitRating = (rating: number) => {
        if (selectedPeticion && onRate) {
            onRate(selectedPeticion.id, rating);
            setRatingModalVisible(false);
            setSelectedPeticion(null);
        }
    };

    if (peticiones.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <MaterialIcons name="inbox" size={48} color={mutedColor} />
                <Text style={[styles.emptyText, { color: mutedColor }]}>
                    No requests registered
                </Text>
            </View>
        );
    }

    const estadoConfig = {
        'pending': { 
            color: '#FFA726', 
            icon: 'schedule' as const,
            text: 'Pending'
        },
        'in-progress': { 
            color: '#42A5F5', 
            icon: 'autorenew' as const,
            text: 'In Progress'
        },
        'completed': { 
            color: '#66BB6A', 
            icon: 'check-circle' as const,
            text: 'Completed'
        },
        'cancelled': { 
            color: '#F44336', 
            icon: 'cancel' as const,
            text: 'Cancelled'
        }
    };

    const tipoConfig = {
        'room-service': { 
            icon: 'restaurant-menu' as const,
            color: '#9C27B0',
            text: 'Room Service'
        },
        'services': { 
            icon: 'room-service' as const,
            color: '#4A90E2',
            text: 'Services'
        },
        'problem': { 
            icon: 'warning' as const,
            color: '#F44336',
            text: 'Problem'
        },
        'extra': { 
            icon: 'star' as const,
            color: '#FF9800',
            text: 'Other'
        }
    };

    // Ordenar peticiones: activas primero (pending, in-progress), luego finalizadas (completed, cancelled)
    // Dentro de cada grupo, ordenar por timestamp descendente (más reciente primero)
    const peticionesOrdenadas = [...peticiones].sort((a, b) => {
        const ordenEstado: { [key: string]: number } = {
            'pending': 1,
            'in-progress': 2,
            'completed': 3,
            'cancelled': 4
        };
        
        const estadoA = ordenEstado[a.status] || 5;
        const estadoB = ordenEstado[b.status] || 5;
        
        // Si tienen diferente estado, ordenar por prioridad de estado
        if (estadoA !== estadoB) {
            return estadoA - estadoB;
        }
        
        // Si tienen el mismo estado, ordenar por timestamp descendente (más reciente primero)
        const timestampA = new Date(a.timestamp || 0).getTime();
        const timestampB = new Date(b.timestamp || 0).getTime();
        return timestampB - timestampA;
    });

    return (
        <>
            <ConfirmationModal
                visible={modalVisible}
                onConfirm={confirmCancelar}
                onCancel={() => setModalVisible(false)}
                mode="Text"
                title="Cancel Request?"
                description="This action will notify the hotel staff that you no longer need this service. You cannot undo this action."
                iconName="warning"
                iconColor="#F44336"
                confirmText="Yes, cancel"
                cancelText="No, keep it"
            />
            <RatingModal
                visible={ratingModalVisible}
                onSubmit={submitRating}
                onCancel={() => setRatingModalVisible(false)}
                mode="Text"
                peticionType={selectedPeticion?.type}
            />
            <View style={styles.container}>
                {peticionesOrdenadas.map((peticion: any, index: number) => {
                const estadoInfo = estadoConfig[peticion.status as keyof typeof estadoConfig] || estadoConfig.pending;
                const tipoInfo = tipoConfig[peticion.type as keyof typeof tipoConfig] || tipoConfig.extra;
                
                return (
                    <View key={peticion.id || index} style={styles.cardWrapper}>
                        {/* Barra de color lateral para indicar el estado */}
                        <View style={[styles.statusBar, { backgroundColor: estadoInfo.color }]} />
                        
                        <View style={[styles.card, { 
                            backgroundColor: cardBg,
                            shadowColor: shadowColor,
                        }]}>
                            <View style={styles.cardHeader}>
                            <View style={styles.tipoContainer}>
                                <MaterialIcons 
                                    name={tipoInfo.icon} 
                                    size={20} 
                                    color={tipoInfo.color} 
                                />
                                <Text style={[styles.tipoText, { color: textColor }]}>
                                    {tipoInfo.text}
                                </Text>
                            </View>
                            <View style={[styles.estadoBadge, { backgroundColor: estadoInfo.color }]}>
                                <MaterialIcons 
                                    name={estadoInfo.icon} 
                                    size={16} 
                                    color="#FFFFFF" 
                                />
                                <Text style={styles.estadoText}>{estadoInfo.text}</Text>
                            </View>
                        </View>
                        
                        {/* Información de habitación y huésped */}
                        <View style={styles.infoContainer}>
                            {peticion.roomNumber && (
                                <View style={styles.infoRow}>
                                    <MaterialIcons name="hotel" size={16} color={mutedColor} />
                                    <Text style={[styles.infoText, { color: textColor }]}>
                                        Room {peticion.roomNumber}
                                    </Text>
                                </View>
                            )}
                            {peticion.guestName && (
                                <View style={styles.infoRow}>
                                    <MaterialIcons name="person" size={16} color={mutedColor} />
                                    <Text style={[styles.infoText, { color: textColor }]}>
                                        {peticion.guestName}
                                    </Text>
                                </View>
                            )}
                        </View>
                        
                        {/* Mensaje de la petición */}
                        <View style={styles.messageContainer}>
                            <Text style={[styles.messageLabel, { color: mutedColor }]}>
                                MESSAGE:
                            </Text>
                            <Text style={[styles.messageText, { color: textColor }]}>
                                {peticion.message || 'No message'}
                            </Text>
                        </View>
                        
                        <View style={styles.footer}>
                            <Text style={[styles.timestamp, { color: mutedColor }]}>
                                {new Date(peticion.timestamp || Date.now()).toLocaleString('es-ES', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </Text>
                        </View>
                        
                        {/* Botón de cancelación - Solo si está pendiente o en progreso */}
                        {(peticion.status === 'pending' || peticion.status === 'in-progress') && (
                            <TouchableOpacity 
                                style={styles.cancelButton}
                                onPress={() => handleCancelar(peticion)}
                            >
                                <MaterialIcons name="cancel" size={20} color="#F44336" />
                                <Text style={styles.cancelButtonText}>Cancel Request</Text>
                            </TouchableOpacity>
                        )}

                        {/* Botón de calificación - Solo si está completada y no ha sido calificada */}
                        {peticion.status === 'completed' && !peticion.rating && onRate && (
                            <TouchableOpacity 
                                style={styles.rateButton}
                                onPress={() => handleRate(peticion)}
                            >
                                <MaterialIcons name="star" size={20} color="#FFD700" />
                                <Text style={styles.rateButtonText}>Rate this request</Text>
                            </TouchableOpacity>
                        )}

                        {/* Mostrar calificación si ya fue calificada */}
                        {peticion.rating && (
                            <View style={styles.ratedContainer}>
                                <Text style={[styles.ratedText, { color: mutedColor }]}>
                                    Your Rating:
                                </Text>
                                <View style={styles.ratedStars}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <MaterialIcons 
                                            key={star}
                                            name="star"
                                            size={18}
                                            color={star <= peticion.rating ? "#FFD700" : mutedColor}
                                        />
                                    ))}
                                </View>
                            </View>
                        )}
                        </View>
                    </View>
                );
            })}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 12,
    },
    cardWrapper: {
        flexDirection: 'row',
        borderRadius: 12,
        overflow: 'hidden',
    },
    statusBar: {
        width: 6,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        gap: 12,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
    card: {
        flex: 1,
        padding: 16,
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
        gap: 12,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tipoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    tipoText: {
        fontSize: 14,
        fontWeight: '600',
    },
    estadoBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    estadoText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    infoContainer: {
        gap: 6,
        paddingVertical: 4,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoText: {
        fontSize: 13,
        fontWeight: '500',
    },
    messageContainer: {
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(128, 128, 128, 0.05)',
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#4A90E2',
    },
    messageLabel: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '400',
    },
    footer: {
        marginTop: 4,
        alignItems: 'flex-end',
    },
    timestamp: {
        fontSize: 12,
    },
    cancelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginTop: 12,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: '#F44336',
        backgroundColor: 'rgba(244, 67, 54, 0.05)',
    },
    cancelButtonText: {
        color: '#F44336',
        fontSize: 14,
        fontWeight: '600',
    },
    rateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginTop: 12,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
    },
    rateButtonText: {
        color: '#FFD700',
        fontSize: 14,
        fontWeight: '600',
    },
    ratedContainer: {
        marginTop: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 215, 0, 0.05)',
    },
    ratedText: {
        fontSize: 13,
        fontWeight: '600',
    },
    ratedStars: {
        flexDirection: 'row',
        gap: 2,
    },
});
