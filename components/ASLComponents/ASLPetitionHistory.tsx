import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialIcons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { ConfirmationModal } from '../BothComponents/confirmation-modal';
import { RatingModal } from '../BothComponents/rating-modal';
import { useState, useMemo } from 'react';

interface ASLPetitionHistoryProps {
    peticiones: any[];
    onCancelar: (peticionId: string) => void;
    onRate?: (peticionId: string, rating: number) => void;
}

export function ASLPetitionHistory({ peticiones, onCancelar, onRate }: ASLPetitionHistoryProps) {
    const cardBg = useThemeColor({}, 'card');
    const shadowColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'tabIconDefault');
    
    const [modalVisible, setModalVisible] = useState(false);
    const [ratingModalVisible, setRatingModalVisible] = useState(false);
    const [selectedPeticion, setSelectedPeticion] = useState<any>(null);

    const estadoConfig: { [key: string]: { color: string; icon: string } } = {
        pending: { color: '#FFA726', icon: 'schedule' },
        'in-progress': { color: '#42A5F5', icon: 'autorenew' },
        completed: { color: '#66BB6A', icon: 'check-circle' },
        cancelled: { color: '#F44336', icon: 'cancel' },
    };

    const tipoConfig: { [key: string]: { icon: string; iconType: 'material' | 'community'; color: string } } = {
        'room-service': { icon: 'silverware-fork-knife', iconType: 'community', color: '#9C27B0' },
        services: { icon: 'room-service', iconType: 'material', color: '#4A90E2' },
        problem: { icon: 'warning', iconType: 'material', color: '#F44336' },
        extra: { icon: 'question-mark', iconType: 'material', color: '#FF9800' },
    };

    const iconosEspecificos: { [key: string]: { icon: string; iconType: 'material' | 'community'; color: string } } = {
        comida: { icon: 'flatware', iconType: 'material', color: '#FF6B6B' },
        amenities: { icon: 'soap', iconType: 'material', color: '#4ECDC4' },
        lenceria: { icon: 'bed', iconType: 'material', color: '#95E1D3' },
        comodidad: { icon: 'self-improvement', iconType: 'material', color: 'A29BFE' },
        desayuno: { icon: 'food-bank', iconType: 'material', color: '#FF9800' },
        alberca: { icon: 'pool', iconType: 'material', color: '#00BCD4' },
        gimnasio: { icon: 'fitness-center', iconType: 'material', color: '#F44336' },
        spa: { icon: 'spa', iconType: 'material', color: '#9C27B0' },
        'air conditioning': { icon: 'ac-unit', iconType: 'material', color: '#2196F3' },
        plumbing: { icon: 'plumbing', iconType: 'material', color: '#03A9F4' },
        electricity: { icon: 'bolt', iconType: 'material', color: '#FFC107' },
        housekeeping: { icon: 'cleaning-services', iconType: 'material', color: '#4CAF50' },
        noise: { icon: 'volume-up', iconType: 'material', color: '#FF5722' },
        furniture: { icon: 'weekend', iconType: 'material', color: '#795548' },
        tv: { icon: 'wifi-off', iconType: 'material', color: '#9C27B0' },
        internet: { icon: 'wifi-off', iconType: 'material', color: '#9C27B0' },
        other: { icon: 'report-problem', iconType: 'material', color: '#F44336' },
        valet: { icon: 'local-parking', iconType: 'material', color: '#3F51B5' },
        parking: { icon: 'local-parking', iconType: 'material', color: '#3F51B5' },
        taxi: { icon: 'local-taxi', iconType: 'material', color: '#FFEB3B' },
    };

    const getTipoIcono = (peticion: any) => {
        if (!peticion) return { icon: 'help-outline', iconType: 'material' as const, color: '#9E9E9E' };
        
        const serviceName = (peticion.message || '').split(':')[0]?.trim().toLowerCase() || '';
        
        for (const [key, value] of Object.entries(iconosEspecificos)) {
            if (serviceName.includes(key) || key.includes(serviceName)) return value;
        }
        
        return tipoConfig[peticion.type] || { icon: 'help-outline', iconType: 'material' as const, color: '#9E9E9E' };
    };

    const peticionesOrdenadas = useMemo(() => {
        const ordenEstado: { [key: string]: number } = { pending: 1, 'in-progress': 2, completed: 3, cancelled: 4 };
        return [...peticiones].sort((a, b) => {
            const diff = (ordenEstado[a.status as string] || 5) - (ordenEstado[b.status as string] || 5);
            if (diff !== 0) return diff;
            return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
        });
    }, [peticiones]);

    const getNumeroPeticion = (peticion: any) => {
        const ordenadas = [...peticiones].sort((a, b) => 
            new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
        );
        return ordenadas.findIndex(p => p.id === peticion.id) + 1;
    };

    if (peticiones.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <MaterialIcons name="inbox" size={48} color={mutedColor} />
            </View>
        );
    }

    return (
        <>
            <ConfirmationModal
                visible={modalVisible}
                onConfirm={() => { if (selectedPeticion) { onCancelar(selectedPeticion.id); setModalVisible(false); setSelectedPeticion(null); } }}
                onCancel={() => setModalVisible(false)}
                mode="ASL"
                title="Cancelar peticion?"
                gif={require('../../assets/gifs/ComidaGif.gif')}
                iconName="warning"
                iconColor="#F44336"
                confirmText="Si"
                cancelText="No"
            />
            <RatingModal
                visible={ratingModalVisible}
                onSubmit={(rating) => { if (selectedPeticion && onRate) { onRate(selectedPeticion.id, rating); setRatingModalVisible(false); setSelectedPeticion(null); } }}
                onCancel={() => setRatingModalVisible(false)}
                mode="ASL"
                peticionType={selectedPeticion?.type}
            />
            <View style={styles.container}>
                {peticionesOrdenadas.map((peticion: any, index: number) => {
                    const config = estadoConfig[peticion.status] || estadoConfig.pending;
                    const tipoInfo = getTipoIcono(peticion);
                    const esMasReciente = index === 0;
                    const numeroPeticion = getNumeroPeticion(peticion);

                    return (
                        <View key={peticion.id || index} style={styles.cardWrapper}>
                            <View style={[styles.statusBar, { backgroundColor: config.color }]} />
                            <View style={[styles.card, { backgroundColor: cardBg, shadowColor }]}>
                                <View style={styles.mainRow}>
                                    <View style={[styles.numberIndicator, { backgroundColor: esMasReciente ? '#4CAF50' : 'rgba(128, 128, 128, 0.2)' }]}>
                                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: esMasReciente ? '#FFFFFF' : mutedColor }}>
                                            {numeroPeticion}
                                        </Text>
                                    </View>
                                    <View style={[styles.typeContainer, { backgroundColor: `${tipoInfo.color}22` }]}>
                                        {tipoInfo.iconType === 'community' ? (
                                            <MaterialCommunityIcons name={tipoInfo.icon as any} size={28} color={tipoInfo.color} />
                                        ) : (
                                            <MaterialIcons name={tipoInfo.icon as any} size={28} color={tipoInfo.color} />
                                        )}
                                    </View>
                                    <View style={[styles.stateContainer, { backgroundColor: config.color }]}>
                                        <MaterialIcons name={config.icon as any} size={20} color="#FFFFFF" />
                                    </View>
                                    <View style={styles.spacer} />
                                    <View style={styles.actionContainer}>
                                        {(peticion.status === 'pending' || peticion.status === 'in-progress') && (
                                            <TouchableOpacity style={styles.actionButton} onPress={() => { setSelectedPeticion(peticion); setModalVisible(true); }}>
                                                <MaterialIcons name="cancel" size={24} color="#F44336" />
                                            </TouchableOpacity>
                                        )}
                                        {peticion.status === 'completed' && !peticion.rating && onRate && (
                                            <TouchableOpacity style={styles.actionButton} onPress={() => { setSelectedPeticion(peticion); setRatingModalVisible(true); }}>
                                                <MaterialIcons name="star" size={24} color="#FFD700" />
                                            </TouchableOpacity>
                                        )}
                                        {peticion.status === 'cancelled' && (
                                            <View style={styles.actionButton}>
                                                <MaterialIcons name="block" size={24} color={mutedColor} />
                                            </View>
                                        )}
                                        {peticion.rating && (
                                            <View style={styles.ratingDisplay}>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <MaterialIcons key={star} name="star" size={16} color={star <= peticion.rating ? "#FFD700" : mutedColor} />
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>
                        </View>
                    );
                })}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: { gap: 12 },
    cardWrapper: { flexDirection: 'row', borderRadius: 16, overflow: 'hidden' },
    statusBar: { width: 8 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 12 },
    card: { flex: 1, padding: 14, borderTopRightRadius: 16, borderBottomRightRadius: 16, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 },
    mainRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    numberIndicator: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    typeContainer: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    stateContainer: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    spacer: { flex: 1 },
    actionContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    actionButton: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: 'rgba(128, 128, 128, 0.3)', backgroundColor: 'rgba(128, 128, 128, 0.08)', alignItems: 'center', justifyContent: 'center' },
    ratingDisplay: { flexDirection: 'row', gap: 2 },
});
