import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from '@/hooks/use-theme-color';
import { commonStyles } from '@/styles/common';
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function TextServices(){
    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');
    const cardBg = useThemeColor({}, 'card');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedService, setSelectedService] = useState<any>(null);
    
    const ServiceOptions =[{
        id: "Desayuno incluido",
        desciption : "Disfruta de un delicioso desayuno en nuestra cafeteria.",
        icon: "food-bank",
        iconType: "material" as const,
        iconColor: "#FF9800",
        bgColor: "#FFF3E0",
        detalles: {
            horario: "6:00 AM - 11:00 AM",
            ubicacion: "Restaurante principal, piso 1",
            incluye: ["Buffet continental", "Frutas frescas", "Café y jugos", "Pan recién horneado"],
            nota: "Reserva con 1 día de anticipación para opciones especiales"
        }
        },{
        id: "Alberca",
        desciption : "Disfruta de un refrescante experiencia en nuestra alberca.",
        icon: "pool",
        iconType: "material" as const,
        iconColor: "#00BCD4",
        bgColor: "#E0F7FA",
        detalles: {
            horario: "7:00 AM - 10:00 PM",
            ubicacion: "Terraza, piso 5",
            incluye: ["Toallas incluidas", "Camastros disponibles", "Bar en la piscina", "Área infantil"],
            nota: "Capacidad máxima: 50 personas. Se recomienda reservar camastros en temporada alta"
        }
        },{
        id: "Gimnasio",
        desciption : "No dejes que pierdas tu rutina.",
        icon: "fitness-center",
        iconType: "material" as const,
        iconColor: "#F44336",
        bgColor: "#FFEBEE",
        detalles: {
            horario: "24 horas",
            ubicacion: "Piso 2, junto al spa",
            incluye: ["Equipo cardiovascular", "Pesas y mancuernas", "Toallas y agua", "Entrenador disponible con cita"],
            nota: "Acceso con llave de habitación. Se recomienda llevar tenis deportivos"
        }
        },
        {
        id: "Spa",
        desciption : "Disfruta de un relajante día de spa.",
        icon: "spa",
        iconType: "material" as const,
        iconColor: "#9C27B0",
        bgColor: "#F3E5F5",
        detalles: {
            horario: "9:00 AM - 8:00 PM",
            ubicacion: "Piso 2, ala oeste",
            incluye: ["Masajes terapéuticos", "Faciales", "Sauna y vapor", "Aromaterapia"],
            nota: "Reserva con 24 horas de anticipación. Servicios con costo adicional"
        }
    }];

    const handlePress = (opcion: any) => {
        setSelectedService(opcion);
        setModalVisible(true);
    };
    
    return(
        <ScrollView>
        <ThemedView style={commonStyles.container}>
            <View style={commonStyles.header}>
                <Text style={[commonStyles.title, { color: textColor }]}>Servicios incluidos</Text>
                <Text style={[commonStyles.subtitle, { color: mutedColor }]}>¿Qué necesitas hoy?</Text>
            </View>
            
            <View style={commonStyles.cardsContainer}>
                {ServiceOptions.map((opcion, index) => (
                    <TouchableOpacity 
                        key={index}
                        style={[commonStyles.card, { backgroundColor: cardBg }]}
                        onPress={() => handlePress(opcion)}
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

            {/* Modal descriptivo */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable 
                    style={styles.modalOverlay}
                    onPress={() => setModalVisible(false)}
                >
                    <Pressable 
                        style={[styles.modalContent, { backgroundColor: cardBg }]}
                        onPress={(e) => e.stopPropagation()}
                    >
                        {selectedService && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {/* Header del modal */}
                                <View style={styles.modalHeader}>
                                    <View style={[styles.modalIcon, { backgroundColor: selectedService.bgColor }]}>
                                        {selectedService.iconType === "material" ? (
                                            <MaterialIcons 
                                                name={selectedService.icon as any} 
                                                size={48} 
                                                color={selectedService.iconColor} 
                                            />
                                        ) : (
                                            <MaterialCommunityIcons 
                                                name={selectedService.icon as any} 
                                                size={48} 
                                                color={selectedService.iconColor} 
                                            />
                                        )}
                                    </View>
                                    <Text style={[styles.modalTitle, { color: textColor }]}>
                                        {selectedService.id}
                                    </Text>
                                    <Text style={[styles.modalDescription, { color: textColor, opacity: 0.8 }]}>
                                        {selectedService.desciption}
                                    </Text>
                                </View>

                                {/* Detalles del servicio */}
                                <View style={styles.detailsContainer}>
                                    {/* Horario */}
                                    <View style={styles.detailRow}>
                                        <MaterialIcons name="schedule" size={24} color={selectedService.iconColor} />
                                        <View style={styles.detailText}>
                                            <Text style={[styles.detailLabel, { color: textColor }]}>Horario</Text>
                                            <Text style={[styles.detailValue, { color: mutedColor }]}>
                                                {selectedService.detalles.horario}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Ubicación */}
                                    <View style={styles.detailRow}>
                                        <MaterialIcons name="location-on" size={24} color={selectedService.iconColor} />
                                        <View style={styles.detailText}>
                                            <Text style={[styles.detailLabel, { color: textColor }]}>Ubicación</Text>
                                            <Text style={[styles.detailValue, { color: mutedColor }]}>
                                                {selectedService.detalles.ubicacion}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Incluye */}
                                    <View style={styles.detailRow}>
                                        <MaterialIcons name="check-circle" size={24} color={selectedService.iconColor} />
                                        <View style={styles.detailText}>
                                            <Text style={[styles.detailLabel, { color: textColor }]}>Incluye</Text>
                                            {selectedService.detalles.incluye.map((item: string, idx: number) => (
                                                <Text key={idx} style={[styles.detailValue, { color: mutedColor }]}>
                                                    • {item}
                                                </Text>
                                            ))}
                                        </View>
                                    </View>

                                    {/* Nota */}
                                    <View style={[styles.notaContainer, { backgroundColor: cardBg, borderColor: selectedService.iconColor, borderWidth: 1 }]}>
                                        <MaterialIcons name="info" size={20} color={selectedService.iconColor} />
                                        <Text style={[styles.notaText, { color: textColor }]}>
                                            {selectedService.detalles.nota}
                                        </Text>
                                    </View>
                                </View>

                                {/* Botón cerrar */}
                                <TouchableOpacity
                                    style={[styles.closeButton, { backgroundColor: selectedService.iconColor }]}
                                    onPress={() => setModalVisible(false)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.closeButtonText}>Cerrar</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        )}
                    </Pressable>
                </Pressable>
            </Modal>
        </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 500,
        maxHeight: '90%',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    modalIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    modalDescription: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
    },
    detailsContainer: {
        gap: 20,
        marginBottom: 24,
    },
    detailRow: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-start',
    },
    detailText: {
        flex: 1,
        gap: 4,
    },
    detailLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    detailValue: {
        fontSize: 14,
        lineHeight: 20,
    },
    notaContainer: {
        flexDirection: 'row',
        gap: 8,
        padding: 12,
        borderRadius: 12,
        alignItems: 'flex-start',
        marginTop: 8,
    },
    notaText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
    },
    closeButton: {
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    closeButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});


