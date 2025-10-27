import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from '@/hooks/use-theme-color';
import { commonStyles } from '@/styles/common';
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ASLReportProblem(){
    const cardBg = useThemeColor({}, 'card');
    const [problemaSeleccionado, setProblemaSeleccionado] = useState('');
    const [cameraActive, setCameraActive] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
       
    const problemOptions = [
        {
            id: "Limpieza",
            gifUrl: "https://placeholder.com/asl-cleaning.gif",
            icon: "cleaning-services",
            iconType: "material" as const,
            iconColor: "#2196F3",
            bgColor: "#E3F2FD"
        },
        {
            id: "Mantenimiento",
            gifUrl: "https://placeholder.com/asl-maintenance.gif",
            icon: "build",
            iconType: "material" as const,
            iconColor: "#FF9800",
            bgColor: "#FFF3E0"
        },
        {
            id: "Ruido",
            gifUrl: "https://placeholder.com/asl-noise.gif",
            icon: "volume-up",
            iconType: "material" as const,
            iconColor: "#F44336",
            bgColor: "#FFEBEE"
        },
        {
            id: "Temperatura",
            gifUrl: "https://placeholder.com/asl-temperature.gif",
            icon: "thermostat",
            iconType: "material" as const,
            iconColor: "#9C27B0",
            bgColor: "#F3E5F5"
        },
        {
            id: "Otro",
            gifUrl: "https://placeholder.com/asl-other.gif",
            icon: "more-horiz",
            iconType: "material" as const,
            iconColor: "#607D8B",
            bgColor: "#ECEFF1"
        }
    ];

    const handlePress = (problemaId: string) => {
        setProblemaSeleccionado(problemaId);
    };

    const handleActivateCamera = async () => {
        if (!permission) {
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
                {/* GIF de "Reportar Problema" en ASL */}
                <Image 
                    source={{ uri: "https://placeholder.com/asl-report-problem-title.gif" }}
                    style={styles.titleGif}
                    resizeMode="contain"
                />
                {/* GIF de "¿Qué problema tienes?" en ASL */}
                <Image 
                    source={{ uri: "https://placeholder.com/asl-what-problem.gif" }}
                    style={styles.subtitleGif}
                    resizeMode="contain"
                />
            </View>
            
            <View style={commonStyles.cardsContainer}>
                {problemOptions.map((opcion, index) => (
                    <TouchableOpacity 
                        key={index}
                        style={[
                            commonStyles.card, 
                            { backgroundColor: cardBg },
                            problemaSeleccionado === opcion.id && styles.cardSelected
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

                {problemaSeleccionado && !cameraActive && (
                    <View style={styles.cameraContainer}>
                        {/* GIF de instrucción para usar la cámara en ASL */}
                        <Image 
                            source={{ uri: "https://placeholder.com/asl-describe-problem.gif" }}
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
                                    Describe el problema en lenguaje de señas
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
    );
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
