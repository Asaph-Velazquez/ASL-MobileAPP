import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from '@/hooks/use-theme-color';
import { commonStyles } from '@/styles/common';
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function ReportProblem(){
    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');
    const cardBg = useThemeColor({}, 'card');
    const [descripcion, setDescripcion] = useState('');
    const [problemaSeleccionado, setProblemaSeleccionado] = useState('');
    
    const ProblemOptions =[
        {
            id: "Aire Acondicionado",
            desciption : "Reporta problemas con el aire acondicionado o calefacción.",
            icon: "ac-unit",
            iconType: "material" as const,
            iconColor: "#2196F3",
            bgColor: "#E3F2FD",
            placeholder: "Ej: El aire acondicionado no enfría bien, la temperatura no baja de 25°C..."
        },{
            id: "Plomería",
            desciption : "Problemas con el agua, drenaje o instalaciones sanitarias.",
            icon: "plumbing",
            iconType: "material" as const,
            iconColor: "#03A9F4",
            bgColor: "#E1F5FE",
            placeholder: "Ej: La ducha no tiene agua caliente, hay una fuga en el lavabo..."
        },{
            id: "Electricidad",
            desciption : "Fallas eléctricas, apagones o problemas con enchufes.",
            icon: "bolt",
            iconType: "material" as const,
            iconColor: "#FFC107",
            bgColor: "#FFF8E1",
            placeholder: "Ej: El enchufe cerca de la cama no funciona, las luces parpadean..."
        },
        {
            id: "Limpieza",
            desciption : "Solicita limpieza adicional o reporta problemas de higiene.",
            icon: "cleaning-services",
            iconType: "material" as const,
            iconColor: "#4CAF50",
            bgColor: "#E8F5E9",
            placeholder: "Ej: Necesito limpieza adicional en el baño, falta reposición de toallas..."
        },
        {
            id: "Ruido",
            desciption : "Reporta molestias por ruido excesivo.",
            icon: "volume-up",
            iconType: "material" as const,
            iconColor: "#FF5722",
            bgColor: "#FBE9E7",
            placeholder: "Ej: Hay mucho ruido proveniente de la habitación de al lado..."
        },
        {
            id: "Mobiliario",
            desciption : "Muebles dañados o que necesitan reparación.",
            icon: "weekend",
            iconType: "material" as const,
            iconColor: "#795548",
            bgColor: "#EFEBE9",
            placeholder: "Ej: La silla del escritorio está rota, el cajón no cierra bien..."
        },
        {
            id: "TV / Internet",
            desciption : "Problemas con televisión, WiFi o conectividad.",
            icon: "wifi-off",
            iconType: "material" as const,
            iconColor: "#9C27B0",
            bgColor: "#F3E5F5",
            placeholder: "Ej: El WiFi no funciona, la TV no enciende o no hay señal..."
        },
        {
            id: "Otro Problema",
            desciption : "Describe cualquier otro problema que necesites reportar.",
            icon: "report-problem",
            iconType: "material" as const,
            iconColor: "#F44336",
            bgColor: "#FFEBEE",
            placeholder: "Ej: Describe el problema que estás experimentando..."
        }
    ];

    const handlePress = (opcionId: string) => {
        setProblemaSeleccionado(opcionId);
        console.log("Problema seleccionado:", opcionId);
    };

    const handleEnviar = () => {
        if (problemaSeleccionado && descripcion.trim()) {
            console.log("Enviando reporte:", {
                problema: problemaSeleccionado,
                descripcion: descripcion
            });
            // Aquí puedes agregar la lógica para enviar el reporte
            alert(`Reporte enviado:\nProblema: ${problemaSeleccionado}\nDescripción: ${descripcion}`);
            setDescripcion('');
            setProblemaSeleccionado('');
        } else {
            alert('Por favor selecciona un tipo de problema y agrega una descripción');
        }
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
                            <Text style={[commonStyles.cardTitle, { color: textColor }]}>{opcion.id}</Text>
                            <Text style={[commonStyles.cardDescription, { color: mutedColor }]}>{opcion.desciption}</Text>
                        </View>
                    </TouchableOpacity>
                ))}

                {problemaSeleccionado && (
                    <View style={styles.inputContainer}>
                        <Text style={[styles.inputLabel, { color: textColor }]}>
                            Describe el problema:
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
                            placeholder={ProblemOptions.find(op => op.id === problemaSeleccionado)?.placeholder || "Describe el problema..."}
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
                            <Text style={styles.submitButtonText}>Enviar Reporte</Text>
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
        borderColor: '#F44336',
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
        backgroundColor: '#F44336',
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
