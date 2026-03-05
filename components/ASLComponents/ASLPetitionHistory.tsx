import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialIcons } from "@expo/vector-icons";
import { Image, StyleSheet, View } from "react-native";

interface ASLPetitionHistoryProps {
    peticiones: any[];
}

/**
 * Historial de peticiones en modo ASL
 * Muestra GIFs de mensajes enviados con su estado
 */
export function ASLPetitionHistory({ peticiones }: ASLPetitionHistoryProps) {
    const textColor = useThemeColor({}, 'text');
    const cardBg = useThemeColor({}, 'card');

    if (peticiones.length === 0) return null;

    const estadoConfig = {
        'pending': { 
            color: '#FFA726', 
            icon: 'schedule' as const,
        },
        'in-progress': { 
            color: '#42A5F5', 
            icon: 'autorenew' as const,
        },
        'completed': { 
            color: '#66BB6A', 
            icon: 'check-circle' as const,
        }
    };

    const tipoConfig = {
        'room-service': { 
            icon: 'restaurant-menu' as const,
            color: '#9C27B0'
        },
        'services': { 
            icon: 'room-service' as const,
            color: '#4A90E2'
        },
        'problem': { 
            icon: 'warning' as const,
            color: '#F44336'
        },
        'extra': { 
            icon: 'star' as const,
            color: '#FF9800'
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <MaterialIcons name="history" size={24} color={textColor} />
                <Image 
                    source={{ uri: "https://placeholder.com/asl-history.gif" }}
                    style={styles.headerGif}
                    resizeMode="contain"
                />
            </View>
            
            {peticiones.slice(0, 5).map((peticion: any) => {
                const config = estadoConfig[peticion.status as keyof typeof estadoConfig];
                const tipoInfo = tipoConfig[peticion.type as keyof typeof tipoConfig] || tipoConfig.extra;
                
                return (
                    <View key={peticion.id} style={[styles.card, { backgroundColor: cardBg }]}>
                        <View style={styles.cardHeader}>
                            <View style={styles.tipoContainer}>
                                <MaterialIcons 
                                    name={tipoInfo.icon} 
                                    size={20} 
                                    color={tipoInfo.color} 
                                />
                            </View>
                            <View style={[styles.estadoBadge, { backgroundColor: config.color }]}>
                                <MaterialIcons 
                                    name={config.icon} 
                                    size={14} 
                                    color="#FFFFFF" 
                                />
                            </View>
                        </View>
                        {/* GIF del mensaje en ASL */}
                        <Image 
                            source={{ uri: "https://placeholder.com/asl-message.gif" }}
                            style={styles.messageGif}
                            resizeMode="contain"
                        />
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
        gap: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    headerGif: {
        flex: 1,
        height: 40,
    },
    card: {
        padding: 16,
        borderRadius: 12,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
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
        gap: 6,
    },
    estadoBadge: {
        padding: 6,
        borderRadius: 12,
    },
    messageGif: {
        width: '100%',
        height: 60,
    },
});
