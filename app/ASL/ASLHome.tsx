import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from '@/hooks/use-theme-color';
import { commonStyles } from '@/styles/common';
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

export default function ASLHome(){
    const cardBg = useThemeColor({}, 'card');
    const opciones = [
        {
            id: "Servicios",
            // Ruta al GIF de lenguaje de señas para "Servicios"
            gifUrl: "https://placeholder.com/asl-services.gif", // Reemplazar con GIF que usaremos 
            icon: "room-service",
            iconType: "material" as const,
            iconColor: "#4A90E2",
            bgColor: "#E3F2FD"
        },
        {
            id: "Room Service",
            // Ruta al GIF de lenguaje de señas para "Room Service"
            gifUrl: "https://placeholder.com/asl-roomservice.gif", // Reemplazar con GIF que usaremos
            icon: "silverware-fork-knife",
            iconType: "community" as const,
            iconColor: "#9C27B0",
            bgColor: "#F3E5F5"
        },
        {
            id: "Problema",
            // Ruta al GIF de lenguaje de señas para "Problema"
            gifUrl: "https://placeholder.com/asl-problem.gif", // Reemplazar con GIF que usaremos
            icon: "warning",
            iconType: "material" as const,
            iconColor: "#F44336",
            bgColor: "#FFEBEE"
        },
        {
            id: "Movilidad",
            // Ruta al GIF de lenguaje de señas para "Movilidad"
            gifUrl: "https://placeholder.com/asl-mobility.gif", // Reemplazar con GIF que usaremos
            icon: "local-taxi",
            iconType: "material" as const,
            iconColor: "#ffe100ff",
            bgColor: "#fffde5ff"
        }
    ]

    const handlePress = (opcionId: string) => {
        (opcionId == "Servicios")?
            router.push('/ASL/ASLServices')
            : null;
        (opcionId == "Room Service")?
            router.push('/ASL/ASLRoomS')
            : null;
        (opcionId == "Problema")?
            router.push('/ASL/ASLReportProblem')
            : null;
        (opcionId == "Movilidad")?
            router.push('/ASL/ASLMovilidad')
            : null;
    };

    return(
        <ScrollView>
        <ThemedView style={commonStyles.container}>
            <View style={commonStyles.header}>
                {/* GIF del título del hotel en lenguaje de señas */}
                <Image 
                    source={{ uri: "https://placeholder.com/asl-hotel-title.gif" }} // Reemplazar con GIF del título del hotel o algo asociado
                    style={styles.titleGif}
                    resizeMode="contain"
                />
                {/* GIF de "¿Qué necesitas hoy?" en lenguaje de señas */}
                <Image 
                    source={{ uri: "https://placeholder.com/asl-what-need.gif" }} // Reemplazar con GIF de "¿Qué necesitas hoy?"
                    style={styles.subtitleGif}
                    resizeMode="contain"
                />
            </View>
            
            <View style={commonStyles.cardsContainer}>
                {opciones.map((opcion, index) => (
                    <TouchableOpacity 
                        key={index}
                        style={[commonStyles.card, { backgroundColor: cardBg }]}
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
                            <Image 
                                source={{ uri: opcion.gifUrl }}
                                style={styles.cardGif}
                                resizeMode="contain"
                            />
                        </View>
                    </TouchableOpacity>
                ))}
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
});
