import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from '@/hooks/use-theme-color';
import { commonStyles } from '@/styles/common';
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { toast } from 'sonner-native';
import { useWebSocket } from "@/components/websocket-provider";
import { useAuth } from "@/components/auth-provider";

export default function ReportProblem(){
    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');
    const cardBg = useThemeColor({}, 'card');
    const [descripcion, setDescripcion] = useState('');
    const [problemaSeleccionado, setProblemaSeleccionado] = useState('');
    const { estaConectado, enviarPeticion, misPeticiones } = useWebSocket();
    const { guestName, roomNumber } = useAuth();
    
    
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
        // Validar que haya problema y descripción
        if (!problemaSeleccionado || !descripcion.trim()) {
            toast.error('Campos incompletos', {
                description: 'Por favor selecciona un tipo de problema y agrega una descripción',
            });
            return;
        }

        // Validar datos del huésped (from auth context)
        if (!roomNumber || !guestName) {
            toast.error('No autenticado', {
                description: 'Por favor inicia sesión con tu código QR',
            });
            return;
        }

        // Enviar por WebSocket (roomNumber and guestName auto-injected by provider)
        const success = enviarPeticion({
            type: 'problem',
            message: `${problemaSeleccionado}: ${descripcion}`,
            priority: 'urgent',
        });

        if (success) {
            toast.success('Problema Reportado', {
                description: 'Tu reporte ha sido enviado al personal del hotel.',
            });
            setProblemaSeleccionado('');
            setDescripcion('');
        } else {
            toast.error('Error de conexión', {
                description: 'No hay conexión con el servidor. Verifica tu conexión.',
            });
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
                        {/* Indicador de conexión */}
                        <View style={styles.connectionIndicator}>
                            <View style={[
                                styles.connectionDot,
                                { backgroundColor: estaConectado ? '#4CAF50' : '#F44336' }
                            ]} />
                            <Text style={[styles.connectionText, { color: mutedColor }]}>
                                {estaConectado ? 'Conectado' : 'Sin conexión'}
                            </Text>
                        </View>

                        <Text style={[styles.inputLabel, { color: textColor }]}>Describe el problema:</Text>
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
                            style={[
                                styles.submitButton,
                                !estaConectado && styles.disabledButton
                            ]}
                            onPress={handleEnviar}
                            activeOpacity={0.8}
                            disabled={!estaConectado}
                        >
                            <Text style={styles.submitButtonText}>
                                {estaConectado ? 'Enviar Reporte' : 'Sin Conexión'}
                            </Text>
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
    connectionIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    connectionDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    connectionText: {
        fontSize: 14,
        fontWeight: '500',
    },
    disabledButton: {
        backgroundColor: '#BDBDBD',
    },
});
