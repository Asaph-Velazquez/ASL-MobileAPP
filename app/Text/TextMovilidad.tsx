import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from '@/hooks/use-theme-color';
import { commonStyles } from '@/styles/common';
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function TextMovilidad(){
    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');
    const cardBg = useThemeColor({}, 'card');
    const [descripcion, setDescripcion] = useState('');
    const [servicioSeleccionado, setServicioSeleccionado] = useState('');
    
    const MovilidadOptions =[{
        id: "Valet Parking",
        desciption : "Personal del hotel estaciona tu vehículo",
        icon: "local-parking",
        iconType: "material" as const,
        iconColor: "#3F51B5",
        bgColor: "#E8EAF6",
        disponibilidad: "Sí",
        placeholder: "Ej: Necesito valet parking a las 3:00 PM para un evento..."
        },{
        id: "Taxi o Ride-hailing",
        desciption : "Solicitud de taxi o apps como Uber/Didi",
        icon: "local-taxi",
        iconType: "material" as const,
        iconColor: "#FFEB3B",
        bgColor: "#FFFDE7",
        disponibilidad: "Variable",
        placeholder: "Ej: Necesito un taxi al aeropuerto mañana a las 7:00 AM..."
        }
    ];

    const handlePress = (opcionId: string) => {
        setServicioSeleccionado(opcionId);
        console.log("Servicio seleccionado:", opcionId);
    };

    const handleEnviar = () => {
        if (servicioSeleccionado && descripcion.trim()) {
            console.log("Enviando solicitud:", {
                servicio: servicioSeleccionado,
                descripcion: descripcion
            });
            // TODO: agregar la lógica para enviar la solicitud
            alert(`Solicitud enviada:\nServicio: ${servicioSeleccionado}\nDescripción: ${descripcion}`);
            setDescripcion('');
            setServicioSeleccionado('');
        } else {
            alert('Por favor selecciona un servicio y agrega una descripción');
        }
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
                            <Text style={[commonStyles.cardTitle, { color: textColor }]}>{opcion.id}</Text>
                            <Text style={[commonStyles.cardDescription, { color: mutedColor }]}>{opcion.desciption}</Text>
                            <Text style={[commonStyles.cardDescription, { color: mutedColor, fontWeight: '600', marginTop: 4 }]}>
                                Disponibilidad: {opcion.disponibilidad}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}

                {servicioSeleccionado && (
                    <View style={styles.inputContainer}>
                        <Text style={[styles.inputLabel, { color: textColor }]}>
                            Describe tu solicitud:
                        </Text>
                        <TextInput
                            style={[
                                styles.textInput,
                                { 
                                    backgroundColor: cardBg,
                                    color: textColor,
                                    borderColor: mutedColor
                                }
                            ]}
                            placeholder={MovilidadOptions.find(op => op.id === servicioSeleccionado)?.placeholder || "Describe tu solicitud..."}
                            placeholderTextColor={mutedColor}
                            value={descripcion}
                            onChangeText={setDescripcion}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleEnviar}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.submitButtonText}>Enviar Solicitud</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    cardSelected: {
        borderWidth: 2,
        borderColor: '#4A90E2',
    },
    inputContainer: {
        marginTop: 20,
        gap: 12,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    textInput: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        minHeight: 120,
        maxHeight: 200,
    },
    submitButton: {
        backgroundColor: '#4A90E2',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
