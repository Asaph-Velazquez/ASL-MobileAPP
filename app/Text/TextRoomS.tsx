import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from '@/hooks/use-theme-color';
import { commonStyles } from '@/styles/common';
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useWebSocket } from "@/components/websocket-provider";
import { toast } from 'sonner-native';

export default function TextRoomS(){
    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');
    const cardBg = useThemeColor({}, 'card');
    const [descripcion, setDescripcion] = useState('');
    const [servicioSeleccionado, setServicioSeleccionado] = useState('');
    const opciones = [
        {
            id: "Comida",
            desciption : "Disfruta de una deliciosa comida en tu habitación.",
            icon: "flatware",
            iconType: "material" as const,
            iconColor: "#FF6B6B",
            bgColor: "#FFE5E5",
            placeholder: "Ej: Quiero ordenar cena para 2 personas a las 20:00..."
        },
        {
            id: "Amenities",
            desciption : "Si te hacen falta toallas, jabones o cualquier otro artículo, ¡solo pídelo!",
            icon: "soap",
            iconType: "material" as const,
            iconColor: "#4ECDC4",
            bgColor: "#E0F7F5",
            placeholder: "Ej: Solicito toallas extra y jabón, por favor."
        },
        {
            id: "Lenceria",
            desciption : "solicita reposicion de  Sabanas, Toallas o Fundas",
            icon: "bed",
            iconType: "material" as const,
            iconColor: "#95E1D3",
            bgColor: "#E8F8F5",
            placeholder: "Ej: Necesito cambio de sábanas y toallas, por favor."
        },
        {
            id: "Comodidad",
            desciption: "Solicita almohadas extra, mantas térmicas o artículos para mejorar tu descanso.",
            icon: "self-improvement",
            iconType: "material" as const,
            iconColor: "#A29BFE",
            bgColor: "#F0EFFF",
            placeholder: "Ej: Solicito una almohada extra y una manta adicional."
        },
        {
            id: "Extra",
            desciption : "Si quieres un servicio extra te comunicaremos con recepcion (se cobra adicionalmente y no aseguramos disponibilidad).",
            icon: "question-mark",
            iconType: "material" as const,
            iconColor: "#FDCB6E",
            bgColor: "#FFF6E0",
            placeholder: "Ej: Me gustaría solicitar un servicio adicional, describa..."
        }       
    ]

    //logica de envio de datos por websocket
    const { estaConectado, enviarPeticion, misPeticiones } = useWebSocket();
    const [roomNumber, setRoomNumber] = useState(''); 
    const [guestName, setGuestName] = useState('');

    const handlePress = (opcionId: string) => {
        setServicioSeleccionado(opcionId);
        setDescripcion('');
    };

    const handleEnviar = () => {
        // Validar que haya servicio y descripción
        if (!servicioSeleccionado || !descripcion.trim()) {
            toast.error('Campos incompletos', {
                description: 'Por favor selecciona un servicio y escribe la descripción',
            });
            return;
        }

        // Validar datos del huésped
        if (!roomNumber || !guestName) {
            toast.error('Datos faltantes', {
                description: 'Por favor completa tu número de habitación y nombre',
            });
            return;
        }

        // Enviar por WebSocket
        const success = enviarPeticion({
            type: 'room-service',
            roomNumber,
            guestName,
            message: `${servicioSeleccionado}: ${descripcion}`,
            priority: 'high', // Alta prioridad para room service
        });

        if (success) {
            toast.success('Solicitud Enviada', {
                description: `Tu solicitud de ${servicioSeleccionado} ha sido enviada al personal del hotel.`,
            });
            setServicioSeleccionado('');
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
                <Text style={[commonStyles.title, { color: textColor }]}>Servicio a la Habitación</Text>
                <Text style={[commonStyles.subtitle, { color: mutedColor }]}>¿En que podemos ayudarte hoy?</Text>
            </View>
            
            <View style={commonStyles.cardsContainer}>
                {opciones.map((opcion, index) => (
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
                        </View>
                    </TouchableOpacity>
                ))}

                {servicioSeleccionado && (
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

                        {/* Datos del huésped */}
                        <Text style={[styles.inputLabel, { color: textColor }]}>Tus datos:</Text>
                        <TextInput
                            style={[
                                styles.textInput,
                                { backgroundColor: cardBg, color: textColor, borderColor: mutedColor, minHeight: 50, maxHeight: 50 }
                            ]}
                            placeholder="Número de habitación"
                            placeholderTextColor={mutedColor}
                            value={roomNumber}
                            onChangeText={setRoomNumber}
                            keyboardType="numeric"
                        />
                        <TextInput
                            style={[
                                styles.textInput,
                                { backgroundColor: cardBg, color: textColor, borderColor: mutedColor, minHeight: 50, maxHeight: 50 }
                            ]}
                            placeholder="Tu nombre"
                            placeholderTextColor={mutedColor}
                            value={guestName}
                            onChangeText={setGuestName}
                        />

                        <Text style={[styles.inputLabel, { color: textColor }]}>Describe tu solicitud:</Text>
                        <TextInput
                            style={[
                                styles.textInput,
                                { backgroundColor: cardBg, color: textColor, borderColor: mutedColor }
                            ]}
                            placeholder={opciones.find(op => op.id === servicioSeleccionado)?.placeholder || 'Describe tu solicitud...'}
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
                                {estaConectado ? 'Enviar Solicitud' : 'Sin Conexión'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Historial de Peticiones */}
            {misPeticiones.length > 0 && (
                <View style={styles.historialContainer}>
                    <Text style={[styles.historialTitle, { color: textColor }]}>
                        📋 Mis Peticiones ({misPeticiones.length})
                    </Text>
                    {misPeticiones.slice(0, 5).map((peticion) => {
                        const estadoConfig = {
                            'pending': { color: '#FFA726', icon: '⏳', label: 'Pendiente' },
                            'in-progress': { color: '#42A5F5', icon: '🔄', label: 'En Proceso' },
                            'completed': { color: '#66BB6A', icon: '✅', label: 'Completada' }
                        };
                        const config = estadoConfig[peticion.status as keyof typeof estadoConfig];
                        
                        return (
                            <View key={peticion.id} style={[styles.peticionCard, { backgroundColor: cardBg }]}>
                                <View style={styles.peticionHeader}>
                                    <Text style={[styles.peticionTipo, { color: textColor }]}>
                                        {peticion.type === 'room-service' ? '🍽️ Room Service' : 
                                         peticion.type === 'services' ? '🛎️ Servicios' :
                                         peticion.type === 'problem' ? '⚠️ Problema' : '✨ Extra'}
                                    </Text>
                                    <View style={[styles.estadoBadge, { backgroundColor: config.color }]}>
                                        <Text style={styles.estadoText}>
                                            {config.icon} {config.label}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={[styles.peticionMensaje, { color: mutedColor }]} numberOfLines={2}>
                                    {peticion.message}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            )}

        </ThemedView>
        </ScrollView>
    )
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
    historialContainer: {
        marginTop: 24,
        gap: 12,
    },
    historialTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    peticionCard: {
        padding: 16,
        borderRadius: 12,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    peticionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    peticionTipo: {
        fontSize: 14,
        fontWeight: '600',
    },
    estadoBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    estadoText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    peticionMensaje: {
        fontSize: 13,
        lineHeight: 18,
    },
});