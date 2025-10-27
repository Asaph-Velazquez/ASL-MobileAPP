import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from '@/hooks/use-theme-color';
import { commonStyles } from '@/styles/common';
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ASLRoomS(){
    const cardBg = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');
    const [servicioSeleccionado, setServicioSeleccionado] = useState('');
    const [cameraActive, setCameraActive] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    
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

    const handlePress = (opcionId: string) => {
        setServicioSeleccionado(opcionId);
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
                            { backgroundColor: cardBg },
                            servicioSeleccionado === opcion.id && styles.cardSelected
                        ]}
                        onPress={() => handlePress(opcion.id)}
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

                {servicioSeleccionado && !cameraActive && (
                    <View style={styles.cameraContainer}>
                        {/* GIF de instrucción para usar la cámara en ASL */}
                        <Image 
                            source={{ uri: "https://placeholder.com/asl-use-camera.gif" }}
                            style={styles.instructionGif}
                            resizeMode="contain"
                        />
                        <TouchableOpacity 
                            style={styles.cameraButton} 
                            onPress={handleActivateCamera}
                            activeOpacity={0.8}
                        >
                            <MaterialIcons name="videocam" size={32} color="#FFFFFF" />
                        </TouchableOpacity>
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
                                    onPress={() => setCameraActive(false)}
                                >
                                    <MaterialIcons name="close" size={32} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                        </CameraView>
                    </View>
                )}
            </View>

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
    cardSelected: {
        borderWidth: 2,
        borderColor: '#4A90E2',
    },
    cameraContainer: {
        marginTop: 20,
        gap: 12,
        alignItems: 'center',
    },
    instructionGif: {
        width: '100%',
        height: 100,
    },
    cameraButton: {
        backgroundColor: '#4A90E2',
        borderRadius: 50,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        width: 80,
        height: 80,
    },
    cameraViewContainer: {
        marginTop: 20,
        borderRadius: 12,
        overflow: 'hidden',
        height: 400,
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
