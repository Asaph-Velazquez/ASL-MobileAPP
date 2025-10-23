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
            iconColor: "#FF6B6B",
            bgColor: "#FFE5E5"
        },
        {
            id: "Amenities",
            desciption : "Si te hacen falta toallas, jabones o cualquier otro artículo, ¡solo pídelo!",
            icon: "soap",
            iconType: "material" as const,
            iconColor: "#4ECDC4",
            bgColor: "#E0F7F5"
        },
        {
            id: "Lenceria",
            desciption : "solicita reposicion de  Sabanas, Toallas o Fundas",
            icon: "bed",
            iconType: "material" as const,
            iconColor: "#95E1D3",
            bgColor: "#E8F8F5"
        },
        {
            id: "Comodidad",
            desciption: "Solicita almohadas extra, mantas térmicas o artículos para mejorar tu descanso.",
            icon: "self-improvement",
            iconType: "material" as const,
            iconColor: "#A29BFE",
            bgColor: "#F0EFFF"
        },
        {
            id: "Extra",
            desciption : "Si quieres un servicio extra te comunicaremos con recepcion (se cobra adicionalmente y no aseguramos disponibilidad).",
            icon: "question-mark",
            iconType: "material" as const,
            iconColor: "#FDCB6E",
            bgColor: "#FFF6E0"
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
                <Text style={[commonStyles.title, { color: textColor }]}>Servicio a la Habitación</Text>
                <Text style={[commonStyles.subtitle, { color: mutedColor }]}>¿En que podemos ayudarte hoy?</Text>
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