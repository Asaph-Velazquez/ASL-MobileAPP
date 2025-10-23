import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from '@/hooks/use-theme-color';
import { commonStyles } from '@/styles/common';
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function TextHome(){
    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');
    const cardBg = useThemeColor({}, 'card');
    const opciones = [
        {
            id: "Servicios",
            desciption : "Explora los servicios que ofrecemos en nuestro hotel.",
            icon: "room-service",
            iconType: "material" as const,
            iconColor: "#4A90E2",
            bgColor: "#E3F2FD"
        },
        {
            id: "Room Service",
            desciption : "Revisa que opciones de room service tenemos disponibles.",
            icon: "silverware-fork-knife",
            iconType: "community" as const,
            iconColor: "#9C27B0",
            bgColor: "#F3E5F5"
        },
        {
            id: "Problema",
            desciption : "Informa sobre cualquier problema que puedas tener durante tu estancia.",
            icon: "warning",
            iconType: "material" as const,
            iconColor: "#F44336",
            bgColor: "#FFEBEE"
        },
        {
            id: "Movilidad",
            desciption: "Solicita valet parking, transporte privado o servicios especiales.",
            icon: "local-taxi",
            iconType: "material" as const,
            iconColor: "#ffe100ff",
            bgColor: "#fffde5ff"
        }
    ]

    const handlePress = (opcionId: string) => {
        (opcionId == "Servicios")?
            router.push('/Text/TextServices')
            : null;
        (opcionId == "Room Service")?
            router.push('/Text/TextRoomS')
            : null;
        (opcionId == "Problema")?
            router.push('/Text/TextReportProblem')
            : null;
        (opcionId == "Movilidad")?
            router.push('/Text/TextMovilidad')
            : null;
    };

    return(
        <ScrollView>
        <ThemedView style={commonStyles.container}>
            <View style={commonStyles.header}>
                <Text style={[commonStyles.title, { color: textColor }]}>Hotel Aurora Central</Text>
                <Text style={[commonStyles.subtitle, { color: mutedColor }]}>¿Qué necesitas hoy?</Text>
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
                            <Text style={[commonStyles.cardTitle, { color: textColor }]}>{opcion.id}</Text>
                            <Text style={[commonStyles.cardDescription, { color: mutedColor }]}>{opcion.desciption}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </ThemedView>
        </ScrollView>
    )
}