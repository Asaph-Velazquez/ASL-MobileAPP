import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from '@/hooks/use-theme-color';
import { commonStyles } from '@/styles/common';
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ASLServices(){
    const textColor = useThemeColor({}, 'text');
    const cardBg = useThemeColor({}, 'card');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedService, setSelectedService] = useState<any>(null);
    
    const ServiceOptions =[{
        id: "Desayuno incluido",
        // GIF de "Desayuno incluido" en ASL
        gifUrl: "https://placeholder.com/asl-breakfast.gif", // Reemplazar con GIF real
        icon: "food-bank",
        iconType: "material" as const,
        iconColor: "#FF9800",
        bgColor: "#FFF3E0",
        detalles: {
            // GIF de horario en ASL
            horarioGif: "https://placeholder.com/asl-breakfast-schedule.gif",
            // GIF de ubicación en ASL
            ubicacionGif: "https://placeholder.com/asl-breakfast-location.gif",
            // GIF de lo que incluye en ASL
            incluyeGif: "https://placeholder.com/asl-breakfast-includes.gif",
            // GIF de nota en ASL
            notaGif: "https://placeholder.com/asl-breakfast-note.gif"
        }
        },{
        id: "Alberca",
        gifUrl: "https://placeholder.com/asl-pool.gif",
        icon: "pool",
        iconType: "material" as const,
        iconColor: "#00BCD4",
        bgColor: "#E0F7FA",
        detalles: {
            horarioGif: "https://placeholder.com/asl-pool-schedule.gif",
            ubicacionGif: "https://placeholder.com/asl-pool-location.gif",
            incluyeGif: "https://placeholder.com/asl-pool-includes.gif",
            notaGif: "https://placeholder.com/asl-pool-note.gif"
        }
        },{
        id: "Gimnasio",
        gifUrl: "https://placeholder.com/asl-gym.gif",
        icon: "fitness-center",
        iconType: "material" as const,
        iconColor: "#F44336",
        bgColor: "#FFEBEE",
        detalles: {
            horarioGif: "https://placeholder.com/asl-gym-schedule.gif",
            ubicacionGif: "https://placeholder.com/asl-gym-location.gif",
            incluyeGif: "https://placeholder.com/asl-gym-includes.gif",
            notaGif: "https://placeholder.com/asl-gym-note.gif"
        }
        },
        {
        id: "Spa",
        gifUrl: "https://placeholder.com/asl-spa.gif",
        icon: "spa",
        iconType: "material" as const,
        iconColor: "#9C27B0",
        bgColor: "#F3E5F5",
        detalles: {
            horarioGif: "https://placeholder.com/asl-spa-schedule.gif",
            ubicacionGif: "https://placeholder.com/asl-spa-location.gif",
            incluyeGif: "https://placeholder.com/asl-spa-includes.gif",
            notaGif: "https://placeholder.com/asl-spa-note.gif"
        }
    }];

    const handlePress = (opcion: any) => {
        setSelectedService(opcion);
        setModalVisible(true);
    };
    
    return(
        <ScrollView
          decelerationRate="fast"
          scrollEventThrottle={16}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
        <ThemedView style={commonStyles.container}>
            <View style={commonStyles.header}>
                {/* GIF de "Servicios incluidos" en ASL */}
                <Image 
                    source={{ uri: "https://placeholder.com/asl-services-title.gif" }}
                    style={styles.titleGif}
                    resizeMode="contain"
                />
                {/* GIF de "¿Qué necesitas hoy?" en ASL */}
                <Image 
                    source={{ uri: "https://placeholder.com/asl-what-need-today.gif" }}
                    style={styles.subtitleGif}
                    resizeMode="contain"
                />
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
                            {/* GIF de lenguaje de señas en lugar de texto */}
                            <Image 
                                source={{ uri: opcion.gifUrl }}
                                style={styles.cardGif}
                                resizeMode="contain"
                            />
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Modal descriptivo con GIFs */}
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
                                    {/* GIF del título del servicio */}
                                    <Image 
                                        source={{ uri: selectedService.gifUrl }}
                                        style={styles.modalTitleGif}
                                        resizeMode="contain"
                                    />
                                </View>

                                {/* Detalles del servicio en GIFs */}
                                <View style={styles.detailsContainer}>
                                    {/* Horario GIF */}
                                    <View style={styles.detailRow}>
                                        <MaterialIcons name="schedule" size={24} color={selectedService.iconColor} />
                                        <Image 
                                            source={{ uri: selectedService.detalles.horarioGif }}
                                            style={styles.detailGif}
                                            resizeMode="contain"
                                        />
                                    </View>

                                    {/* Ubicación GIF */}
                                    <View style={styles.detailRow}>
                                        <MaterialIcons name="location-on" size={24} color={selectedService.iconColor} />
                                        <Image 
                                            source={{ uri: selectedService.detalles.ubicacionGif }}
                                            style={styles.detailGif}
                                            resizeMode="contain"
                                        />
                                    </View>

                                    {/* Incluye GIF */}
                                    <View style={styles.detailRow}>
                                        <MaterialIcons name="check-circle" size={24} color={selectedService.iconColor} />
                                        <Image 
                                            source={{ uri: selectedService.detalles.incluyeGif }}
                                            style={styles.detailGif}
                                            resizeMode="contain"
                                        />
                                    </View>

                                    {/* Nota GIF */}
                                    <View style={[styles.notaContainer, { backgroundColor: cardBg, borderColor: selectedService.iconColor, borderWidth: 1 }]}>
                                        <MaterialIcons name="info" size={20} color={selectedService.iconColor} />
                                        <Image 
                                            source={{ uri: selectedService.detalles.notaGif }}
                                            style={styles.notaGif}
                                            resizeMode="contain"
                                        />
                                    </View>
                                </View>

                                {/* Botón cerrar */}
                                <TouchableOpacity
                                    style={[styles.closeButton, { backgroundColor: selectedService.iconColor }]}
                                    onPress={() => setModalVisible(false)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.closeButtonText}>✕</Text>
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
    titleGif: {
        width: '100%',
        height: 80,
        marginBottom: 8,
    },
    subtitleGif: {
        width: '100%',
        height: 60,
    },
    cardGif: {
        width: '100%',
        height: 80,
    },
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
    modalTitleGif: {
        width: '100%',
        height: 80,
    },
    detailsContainer: {
        gap: 20,
        marginBottom: 24,
    },
    detailRow: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    detailGif: {
        flex: 1,
        height: 100,
    },
    notaContainer: {
        flexDirection: 'row',
        gap: 8,
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    notaGif: {
        flex: 1,
        height: 80,
    },
    closeButton: {
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    closeButtonText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '600',
    },
});
