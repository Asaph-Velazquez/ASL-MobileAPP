import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from '@/hooks/use-theme-color';
import { commonStyles } from '@/styles/common';
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function TextServices(){
    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');
    const cardBg = useThemeColor({}, 'card');
    const ServiceOptions =[{
        id: "Desayuno incluido",
        desciption : "Disfruta de un delicioso desayuno en nuestra cafeteria.",
        icon: "food-bank",
        iconType: "material" as const,
        iconColor: "#4A90E2",
        bgColor: "#E3F2FD"
        },{
        id: "Alberca",
        desciption : "Disfruta de un refrescante experiencia en nuestra alberca.",
        icon: "pool",
        iconType: "material" as const,
        iconColor: "#4A90E2",
        bgColor: "#E3F2FD"
        },{
        id: "Gimnasio",
        desciption : "No dejes que pierdas tu rutina.",
        icon: "fitness-center",
        iconType: "material" as const,
        iconColor: "#4A90E2",
        bgColor: "#E3F2FD"
        },
        {
        id: "Spa",
        desciption : "Disfruta de un relajante día de spa.",
        icon: "spa",
        iconType: "material" as const,
        iconColor: "#4A90E2",
        bgColor: "#E3F2FD"
        }
    ];

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
                {ServiceOptions.map((opcion, index) => (
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
    );
}

