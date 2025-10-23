import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from '@/hooks/use-theme-color';
import { commonStyles } from '@/styles/common';
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function TextRoomS(){
    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');
    const cardBg = useThemeColor({}, 'card');
    const opciones = [
        {
            id: "Comida",
            desciption : "Disfruta de una deliciosa comida en tu habitación.",
            icon: "flatware",
            iconType: "material" as const,
            iconColor: "#4A90E2",
            bgColor: "#E3F2FD"
        },
        {
            id: "Amenities",
            desciption : "Si te hacen falta toallas, jabones o cualquier otro artículo, ¡solo pídelo!",
            icon: "soap",
            iconType: "material" as const,
            iconColor: "#4A90E2",
            bgColor: "#E3F2FD"
        },
        {
            id: "Lenceria",
            desciption : "solicita reposicion de  Sabanas, Toallas o Fundas",
            icon: "bed",
            iconType: "material" as const,
            iconColor: "#4A90E2",
            bgColor: "#E3F2FD"
        },
        {
            id: "Comodidad",
            desciption: "Solicita almohadas extra, mantas térmicas o artículos para mejorar tu descanso.",
            icon: "self-improvement",
            iconType: "material" as const,
            iconColor: "#4A90E2",
            bgColor: "#E3F2FD"
        },
        {
            id: "Extra",
            desciption : "Si quieres un servicio extra te comunicaremos con recepcion (se cobra adicionalmente y no aseguramos disponibilidad).",
            icon: "question-mark",
            iconType: "material" as const,
            iconColor: "#4A90E2",
            bgColor: "#E3F2FD"
        }       
    ]

    const handlePress = (opcionId: string) => {
        (opcionId == "Servicios")?
            router.push('/Text/TextServices')
            : null;
        (opcionId == "Room Service")?
            router.push('/Text/TextServices')
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