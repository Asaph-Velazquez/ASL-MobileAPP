import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from '@/hooks/use-theme-color';
import { commonStyles } from '@/styles/common';
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { toast } from 'sonner-native';
import { useWebSocket } from '../../components/websocket-provider';
import { useAuth } from '@/components/auth-provider';

export default function TextMovilidad(){
    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');
    const cardBg = useThemeColor({}, 'card');
    const [descripcion, setDescripcion] = useState('');
    const [servicioSeleccionado, setServicioSeleccionado] = useState('');
    const { estaConectado, enviarPeticion, misPeticiones } = useWebSocket();
    const { guestName, roomNumber } = useAuth();
    
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
        // Validar que haya servicio y descripción
        if (!servicioSeleccionado || !descripcion.trim()) {
            toast.error('Campos incompletos', {
                description: 'Por favor selecciona un servicio y agrega una descripción',
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
            type: 'extra',
            message: `${servicioSeleccionado}: ${descripcion}`,
            priority: 'medium',
        });

        if (success) {
            toast.success('Solicitud Enviada', {
                description: `Tu solicitud de ${servicioSeleccionado} ha sido enviada.`,
            });
            setDescripcion('');
            setServicioSeleccionado('');
        } else {
            toast.error('Error de conexión', {
                description: 'No hay conexión con el servidor. Verifica tu conexión.',
            });
        }
    };
    
    return(
        <ScrollView>
        <ThemedView style={commonStyles.container}>
            <View style={[commonStyles.header, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                <View>
                    <Text style={[commonStyles.title, { color: textColor }]}>Servicios de Movilidad</Text>
                    <Text style={[commonStyles.subtitle, { color: mutedColor }]}>¿Qué servicio necesitas?</Text>
                </View>
                <View style={{ alignItems: 'center', gap: 4 }}>
                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: estaConectado ? '#4CAF50' : '#F44336' }} />
                    <Text style={{ fontSize: 12, color: estaConectado ? '#4CAF50' : '#F44336', fontWeight: '600' }}>
                        {estaConectado ? 'Conectado' : 'Desconectado'}
                    </Text>
                </View>
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
                            style={[styles.submitButton, !estaConectado && styles.submitButtonDisabled]}
                            onPress={handleEnviar}
                            activeOpacity={0.8}
                            disabled={!estaConectado}
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
    submitButtonDisabled: {
        opacity: 0.5,
    },
});
