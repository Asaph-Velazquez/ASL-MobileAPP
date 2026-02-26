import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from '@/hooks/use-theme-color';
import { commonStyles } from '@/styles/common';
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useWebSocketMobile } from "@/services/socket";

export default function ASLRoomS(){
    const cardBg = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');
    const [servicioSeleccionado, setServicioSeleccionado] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const { misPeticiones } = useWebSocketMobile();
    
    const opciones = [
        {
            id: "Comida",
            // GIF de "Comida" en ASL
            gifUrl: "https://placeholder.com/asl-food.gif",
            icon: "flatware",
            iconType: "material" as const,
            iconColor: "#FF6B6B",
            bgColor: "#FFE5E5"
        },
        {
            id: "Amenities",
            gifUrl: "https://placeholder.com/asl-amenities.gif",
            icon: "soap",
            iconType: "material" as const,
            iconColor: "#4ECDC4",
            bgColor: "#E0F7F5"
        },
        {
            id: "Lenceria",
            gifUrl: "https://placeholder.com/asl-linen.gif",
            icon: "bed",
            iconType: "material" as const,
            iconColor: "#95E1D3",
            bgColor: "#E8F8F5"
        },
        {
            id: "Comodidad",
            gifUrl: "https://placeholder.com/asl-comfort.gif",
            icon: "self-improvement",
            iconType: "material" as const,
            iconColor: "#A29BFE",
            bgColor: "#F0EFFF"
        },
        {
            id: "Extra",
            gifUrl: "https://placeholder.com/asl-extra.gif",
            icon: "question-mark",
            iconType: "material" as const,
            iconColor: "#FDCB6E",
            bgColor: "#FFF6E0"
        }       
    ];

    const handlePress = (opcion: any) => {
        setServicioSeleccionado(opcion);
        setModalVisible(true);
    };

    const handleActivateCamera = async () => {
        if (!permission) {
            // Permisos aún están cargando
            return;
        }

        if (!permission.granted) {
            // Solicitar permisos de cámara
            const { granted } = await requestPermission();
            if (!granted) {
                alert('Se necesitan permisos de cámara para usar esta función');
                return;
            }
        }

        setCameraActive(true);
    };

    return(
        <ScrollView>
        <ThemedView style={commonStyles.container}>
            <View style={commonStyles.header}>
                {/* GIF de "Servicio a la Habitación" en ASL */}
                <Image 
                    source={{ uri: "https://placeholder.com/asl-room-service-title.gif" }}
                    style={styles.titleGif}
                    resizeMode="contain"
                />
                {/* GIF de "¿En qué podemos ayudarte hoy?" en ASL */}
                <Image 
                    source={{ uri: "https://placeholder.com/asl-how-help.gif" }}
                    style={styles.subtitleGif}
                    resizeMode="contain"
                />
            </View>
            
            <View style={commonStyles.cardsContainer}>
                {opciones.map((opcion, index) => (
                    <TouchableOpacity 
                        key={index}
                        style={[
                            commonStyles.card,
                            { backgroundColor: cardBg }
                        ]}
                        onPress={() => handlePress(opcion)}
                        activeOpacity={0.8}
                    >
                        <View style={[commonStyles.iconContainer, { backgroundColor: opcion.bgColor }]}>
                            {opcion.iconType === "material" ? (
                                <MaterialIcons 
                                    name={opcion.icon as any} 
                                    size={32} 
                                    color={opcion.iconColor} 
                                />
                            ) : (
                                <MaterialCommunityIcons 
                                    name={opcion.icon as any} 
                                    size={32} 
                                    color={opcion.iconColor} 
                                />
                            )}
                        </View>
                        <View style={commonStyles.textContainer}>
                            {/* GIF de lenguaje de señas en lugar de texto */}
                            <Image 
                                source={{ uri: opcion.gifUrl }}
                                style={styles.cardGif}
                                resizeMode="contain"
                            />
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Modal de confirmación */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable 
                    style={styles.modalOverlay}
                    onPress={() => setModalVisible(false)}
                >
                    <Pressable 
                        style={[styles.modalContent, { backgroundColor: cardBg }]}
                        onPress={(e) => e.stopPropagation()}
                    >
                        {servicioSeleccionado && !cameraActive && (
                            <View style={styles.modalInner}>
                                {/* Header del modal */}
                                <View style={styles.modalHeader}>
                                    <View style={[styles.modalIcon, { backgroundColor: servicioSeleccionado.bgColor }]}>
                                        {servicioSeleccionado.iconType === "material" ? (
                                            <MaterialIcons 
                                                name={servicioSeleccionado.icon as any} 
                                                size={48} 
                                                color={servicioSeleccionado.iconColor} 
                                            />
                                        ) : (
                                            <MaterialCommunityIcons 
                                                name={servicioSeleccionado.icon as any} 
                                                size={48} 
                                                color={servicioSeleccionado.iconColor} 
                                            />
                                        )}
                                    </View>
                                    {/* GIF del servicio seleccionado */}
                                    <Image 
                                        source={{ uri: servicioSeleccionado.gifUrl }}
                                        style={styles.modalTitleGif}
                                        resizeMode="contain"
                                    />
                                </View>

                                {/* GIF de instrucción para usar la cámara en ASL */}
                                <Image 
                                    source={{ uri: "https://placeholder.com/asl-use-camera.gif" }}
                                    style={styles.instructionGif}
                                    resizeMode="contain"
                                />

                                {/* Botones */}
                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity 
                                        style={[styles.actionButton, { backgroundColor: servicioSeleccionado.iconColor }]} 
                                        onPress={handleActivateCamera}
                                        activeOpacity={0.8}
                                    >
                                        <MaterialIcons name="videocam" size={24} color="#FFFFFF" />
                                        <Text style={styles.buttonText}>Usar Cámara</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.cancelButton}
                                        onPress={() => setModalVisible(false)}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[styles.cancelButtonText, { color: textColor }]}>Cancelar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {cameraActive && (
                            <View style={styles.cameraViewContainer}>
                                <CameraView style={styles.camera} facing="front">
                                    <View style={styles.cameraOverlay}>
                                        <Text style={styles.cameraText}>
                                            Muestra tu mensaje en lenguaje de señas
                                        </Text>
                                        <TouchableOpacity 
                                            style={styles.closeCamera} 
                                            onPress={() => {
                                                setCameraActive(false);
                                                setModalVisible(false);
                                            }}
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

            {/* Historial de Peticiones */}
            {misPeticiones.length > 0 && (
                <View style={styles.historialContainer}>
                    <View style={styles.historialHeader}>
                        <MaterialIcons name="history" size={24} color={textColor} />
                        <Image 
                            source={{ uri: "https://placeholder.com/asl-history.gif" }}
                            style={styles.historialGif}
                            resizeMode="contain"
                        />
                    </View>
                    {misPeticiones.slice(0, 5).map((peticion: any) => {
                        const estadoConfig = {
                            'pending': { 
                                color: '#FFA726', 
                                icon: 'schedule',
                                iconType: 'material' as const,
                            },
                            'in-progress': { 
                                color: '#42A5F5', 
                                icon: 'autorenew',
                                iconType: 'material' as const,
                            },
                            'completed': { 
                                color: '#66BB6A', 
                                icon: 'check-circle',
                                iconType: 'material' as const,
                            }
                        };
                        const config = estadoConfig[peticion.status as keyof typeof estadoConfig];
                        
                        const tipoConfig = {
                            'room-service': { 
                                icon: 'restaurant-menu',
                                iconType: 'material' as const,
                                color: '#9C27B0'
                            },
                            'services': { 
                                icon: 'room-service',
                                iconType: 'material' as const,
                                color: '#4A90E2'
                            },
                            'problem': { 
                                icon: 'warning',
                                iconType: 'material' as const,
                                color: '#F44336'
                            },
                            'extra': { 
                                icon: 'star',
                                iconType: 'material' as const,
                                color: '#FF9800'
                            }
                        };
                        const tipoInfo = tipoConfig[peticion.type as keyof typeof tipoConfig] || tipoConfig.extra;
                        
                        return (
                            <View key={peticion.id} style={[styles.peticionCard, { backgroundColor: cardBg }]}>
                                <View style={styles.peticionHeader}>
                                    <View style={styles.peticionTipoContainer}>
                                        <MaterialIcons 
                                            name={tipoInfo.icon as any} 
                                            size={20} 
                                            color={tipoInfo.color} 
                                        />
                                    </View>
                                    <View style={[styles.estadoBadge, { backgroundColor: config.color }]}>
                                        <MaterialIcons 
                                            name={config.icon as any} 
                                            size={14} 
                                            color="#FFFFFF" 
                                        />
                                    </View>
                                </View>
                                {/* GIF del mensaje en ASL */}
                                <Image 
                                    source={{ uri: "https://placeholder.com/asl-message.gif" }}
                                    style={styles.peticionGif}
                                    resizeMode="contain"
                                />
                            </View>
                        );
                    })}
                </View>
            )}

        </ThemedView>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    titleGif: {
        width: '100%',
        height: 80,
        marginBottom: 8,
    },
    subtitleGif: {
        width: '100%',
        height: 60,
    },
    cardGif: {
        width: '100%',
        height: 80,
    },
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
    modalTitleGif: {
        width: '100%',
        height: 80,
    },
    instructionGif: {
        width: '100%',
        height: 100,
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
    buttonText: {
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
    historialContainer: {
        marginTop: 24,
        gap: 12,
    },
    historialHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    historialGif: {
        flex: 1,
        height: 40,
    },
    peticionCard: {
        padding: 16,
        borderRadius: 12,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    peticionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    peticionTipoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    estadoBadge: {
        padding: 6,
        borderRadius: 12,
    },
    peticionGif: {
        width: '100%',
        height: 60,
    },
});
