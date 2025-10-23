import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from '@/hooks/use-theme-color';
import { commonStyles } from '@/styles/common';
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function ReportProblem(){
    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');
    const cardBg = useThemeColor({}, 'card');
    const ProblemOptions =[
        {
            id: "Aire Acondicionado",
            desciption : "Reporta problemas con el aire acondicionado o calefacción.",
            icon: "ac-unit",
            iconType: "material" as const,
            iconColor: "#2196F3",
            bgColor: "#E3F2FD"
        },{
            id: "Plomería",
            desciption : "Problemas con el agua, drenaje o instalaciones sanitarias.",
            icon: "plumbing",
            iconType: "material" as const,
            iconColor: "#03A9F4",
            bgColor: "#E1F5FE"
        },{
            id: "Electricidad",
            desciption : "Fallas eléctricas, apagones o problemas con enchufes.",
            icon: "bolt",
            iconType: "material" as const,
            iconColor: "#FFC107",
            bgColor: "#FFF8E1"
        },
        {
            id: "Limpieza",
            desciption : "Solicita limpieza adicional o reporta problemas de higiene.",
            icon: "cleaning-services",
            iconType: "material" as const,
            iconColor: "#4CAF50",
            bgColor: "#E8F5E9"
        },
        {
            id: "Ruido",
            desciption : "Reporta molestias por ruido excesivo.",
            icon: "volume-up",
            iconType: "material" as const,
            iconColor: "#FF5722",
            bgColor: "#FBE9E7"
        },
        {
            id: "Mobiliario",
            desciption : "Muebles dañados o que necesitan reparación.",
            icon: "weekend",
            iconType: "material" as const,
            iconColor: "#795548",
            bgColor: "#EFEBE9"
        },
        {
            id: "TV / Internet",
            desciption : "Problemas con televisión, WiFi o conectividad.",
            icon: "wifi-off",
            iconType: "material" as const,
            iconColor: "#9C27B0",
            bgColor: "#F3E5F5"
        },
        {
            id: "Otro Problema",
            desciption : "Describe cualquier otro problema que necesites reportar.",
            icon: "report-problem",
            iconType: "material" as const,
            iconColor: "#F44336",
            bgColor: "#FFEBEE"
        }
    ];

    const handlePress = (opcionId: string) => {
        console.log("Reportando problema:", opcionId);
    };
    
    return(
        <ScrollView>
        <ThemedView style={commonStyles.container}>
            <View style={commonStyles.header}>
                <Text style={[commonStyles.title, { color: textColor }]}>Reportar Problema</Text>
                <Text style={[commonStyles.subtitle, { color: mutedColor }]}>¿Qué problema necesitas reportar?</Text>
            </View>
            
            <View style={commonStyles.cardsContainer}>
                {ProblemOptions.map((opcion, index) => (
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
