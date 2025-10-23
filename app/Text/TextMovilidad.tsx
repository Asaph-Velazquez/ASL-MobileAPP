import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from '@/hooks/use-theme-color';
import { commonStyles } from '@/styles/common';
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function TextMovilidad(){
    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');
    const cardBg = useThemeColor({}, 'card');
    const MovilidadOptions =[{
        id: "Valet Parking",
        desciption : "Personal del hotel estaciona tu vehículo",
        icon: "local-parking",
        iconType: "material" as const,
        iconColor: "#3F51B5",
        bgColor: "#E8EAF6",
        disponibilidad: "Sí"
        },{
        id: "Taxi o Ride-hailing",
        desciption : "Solicitud de taxi o apps como Uber/Didi",
        icon: "local-taxi",
        iconType: "material" as const,
        iconColor: "#FFEB3B",
        bgColor: "#FFFDE7",
        disponibilidad: "Variable"
        }
    ];

    const handlePress = (opcionId: string) => {
        console.log("Solicitando servicio de movilidad:", opcionId);
    };
    
    return(
        <ScrollView>
        <ThemedView style={commonStyles.container}>
            <View style={commonStyles.header}>
                <Text style={[commonStyles.title, { color: textColor }]}>Servicios de Movilidad</Text>
                <Text style={[commonStyles.subtitle, { color: mutedColor }]}>¿Qué servicio necesitas?</Text>
            </View>
            
            <View style={commonStyles.cardsContainer}>
                {MovilidadOptions.map((opcion, index) => (
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
                            <Text style={[commonStyles.cardDescription, { color: mutedColor, fontWeight: '600', marginTop: 4 }]}>
                                Disponibilidad: {opcion.disponibilidad}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </ThemedView>
        </ScrollView>
    );
}
