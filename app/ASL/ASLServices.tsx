import { ThemedView } from "@/components/BothComponents/themed-view";
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
    const [selectedGif, setSelectedGif] = useState<any>(require('../../assets/gifs/ComidaGif.gif'));
    const [modalGif, setModalGif] = useState<any>(null);
    
    // Función helper para manejar tanto URLs como rutas locales
    const getImageSource = (source: any) => {
        if (typeof source === 'string') {
            return { uri: source };
        }
        return source;
    };
    
    const ServiceOptions =[{
        id: "Desayuno incluido",
        // GIF de "Desayuno incluido" en ASL
        gifUrl: require('../../assets/gifs/ComidaGif.gif'),
        icon: "food-bank",
        iconType: "material" as const,
        iconColor: "#FF9800",
        bgColor: "#FFF3E0",
        detalles: {
            // GIF de horario en ASL
            horarioGif: require('../../assets/gifs/ComidaGif.gif'),
            // GIF de ubicación en ASL
            ubicacionGif: require('../../assets/gifs/ComidaGif.gif'),
            // GIF de lo que incluye en ASL
            incluyeGif: require('../../assets/gifs/ComidaGif.gif'),
            // GIF de nota en ASL
            notaGif: require('../../assets/gifs/ComidaGif.gif')
        }
        },{
        id: "Alberca",
        gifUrl: require('../../assets/gifs/ComidaGif.gif'),
        icon: "pool",
        iconType: "material" as const,
        iconColor: "#00BCD4",
        bgColor: "#E0F7FA",
        detalles: {
            horarioGif: require('../../assets/gifs/ComidaGif.gif'),
            ubicacionGif: require('../../assets/gifs/ComidaGif.gif'),
            incluyeGif: require('../../assets/gifs/ComidaGif.gif'),
            notaGif: require('../../assets/gifs/ComidaGif.gif')
        }
        },{
        id: "Gimnasio",
        gifUrl: require('../../assets/gifs/ComidaGif.gif'),
        icon: "fitness-center",
        iconType: "material" as const,
        iconColor: "#F44336",
        bgColor: "#FFEBEE",
        detalles: {
            horarioGif: require('../../assets/gifs/ComidaGif.gif'),
            ubicacionGif: require('../../assets/gifs/ComidaGif.gif'),
            incluyeGif: require('../../assets/gifs/ComidaGif.gif'),
            notaGif: require('../../assets/gifs/ComidaGif.gif')
        }
        },
        {
        id: "Spa",
        gifUrl: require('../../assets/gifs/ComidaGif.gif'),
        icon: "spa",
        iconType: "material" as const,
        iconColor: "#9C27B0",
        bgColor: "#F3E5F5",
        detalles: {
            horarioGif: require('../../assets/gifs/ComidaGif.gif'),
            ubicacionGif: require('../../assets/gifs/ComidaGif.gif'),
            incluyeGif: require('../../assets/gifs/ComidaGif.gif'),
            notaGif: require('../../assets/gifs/ComidaGif.gif')
        }
    }];

    const handlePress = (opcion: any) => {
        setSelectedService(opcion);
        setModalGif(opcion.gifUrl); // Iniciar con el GIF del servicio
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
            {/* Área de visualización del GIF grande */}
            <View style={styles.gifPreviewContainer}>
                <Image 
                    source={getImageSource(selectedGif)}
                    style={styles.gifPreview}
                    resizeMode="contain"
                />
            </View>
            
            {/* Cuadrícula de opciones */}
            <View style={styles.gridContainer}>
                {ServiceOptions.map((opcion, index) => (
                    <TouchableOpacity 
                        key={index}
                        style={[styles.gridItem, { backgroundColor: cardBg }]}
                        onPressIn={() => setSelectedGif(opcion.gifUrl)}
                        onPressOut={() => setSelectedGif(require('../../assets/gifs/ComidaGif.gif'))}
                        onPress={() => handlePress(opcion)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.gridIconContainer, { backgroundColor: opcion.bgColor }]}>
                            {opcion.iconType === "material" ? (
                                <MaterialIcons 
                                    name={opcion.icon as any} 
                                    size={40} 
                                    color={opcion.iconColor} 
                                />
                            ) : (
                                <MaterialCommunityIcons 
                                    name={opcion.icon as any} 
                                    size={40} 
                                    color={opcion.iconColor} 
                                />
                            )}
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
                            <View style={styles.modalInner}>
                                {/* Header del modal */}
                                <View style={styles.modalHeader}>
                                    <View style={[styles.modalIcon, { backgroundColor: selectedService.bgColor }]}>
                                        {selectedService.iconType === "material" ? (
                                            <MaterialIcons 
                                                name={selectedService.icon as any} 
                                                size={40} 
                                                color={selectedService.iconColor} 
                                            />
                                        ) : (
                                            <MaterialCommunityIcons 
                                                name={selectedService.icon as any} 
                                                size={40} 
                                                color={selectedService.iconColor} 
                                            />
                                        )}
                                    </View>
                                </View>

                                {/* Área de visualización del GIF grande */}
                                <View style={styles.modalGifContainer}>
                                    <Image 
                                        source={getImageSource(modalGif)}
                                        style={styles.modalGifPreview}
                                        resizeMode="contain"
                                    />
                                </View>

                                {/* Cuadrícula de detalles */}
                                <View style={styles.modalGridContainer}>
                                    {/* Horario */}
                                    <TouchableOpacity 
                                        style={[styles.modalGridItem, { backgroundColor: selectedService.bgColor }]}
                                        onPressIn={() => setModalGif(selectedService.detalles.horarioGif)}
                                        onPressOut={() => setModalGif(selectedService.gifUrl)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.modalIconContainer, { backgroundColor: '#FFF' }]}>
                                            <MaterialIcons 
                                                name="schedule" 
                                                size={36} 
                                                color={selectedService.iconColor} 
                                            />
                                        </View>
                                    </TouchableOpacity>

                                    {/* Ubicación */}
                                    <TouchableOpacity 
                                        style={[styles.modalGridItem, { backgroundColor: selectedService.bgColor }]}
                                        onPressIn={() => setModalGif(selectedService.detalles.ubicacionGif)}
                                        onPressOut={() => setModalGif(selectedService.gifUrl)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.modalIconContainer, { backgroundColor: '#FFF' }]}>
                                            <MaterialIcons 
                                                name="location-on" 
                                                size={36} 
                                                color={selectedService.iconColor} 
                                            />
                                        </View>
                                    </TouchableOpacity>

                                    {/* Incluye */}
                                    <TouchableOpacity 
                                        style={[styles.modalGridItem, { backgroundColor: selectedService.bgColor }]}
                                        onPressIn={() => setModalGif(selectedService.detalles.incluyeGif)}
                                        onPressOut={() => setModalGif(selectedService.gifUrl)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.modalIconContainer, { backgroundColor: '#FFF' }]}>
                                            <MaterialIcons 
                                                name="check-circle" 
                                                size={36} 
                                                color={selectedService.iconColor} 
                                            />
                                        </View>
                                    </TouchableOpacity>

                                    {/* Nota */}
                                    <TouchableOpacity 
                                        style={[styles.modalGridItem, { backgroundColor: selectedService.bgColor }]}
                                        onPressIn={() => setModalGif(selectedService.detalles.notaGif)}
                                        onPressOut={() => setModalGif(selectedService.gifUrl)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.modalIconContainer, { backgroundColor: '#FFF' }]}>
                                            <MaterialIcons 
                                                name="info" 
                                                size={36} 
                                                color={selectedService.iconColor} 
                                            />
                                        </View>
                                    </TouchableOpacity>
                                </View>

                                {/* Botón cerrar */}
                                <TouchableOpacity
                                    style={[styles.closeButton, { backgroundColor: selectedService.iconColor }]}
                                    onPress={() => setModalVisible(false)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.closeButtonText}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </Pressable>
                </Pressable>
            </Modal>
        </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    gifPreviewContainer: {
        marginTop: 20,
        marginHorizontal: 20,
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        padding: 20,
        minHeight: 300,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    gifPreview: {
        width: '100%',
        height: 280,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
        gap: 16,
        justifyContent: 'space-between',
    },
    gridItem: {
        width: '47%',
        aspectRatio: 1,
        borderRadius: 16,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    gridIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
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
        padding: 20,
        width: '100%',
        maxWidth: 500,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalInner: {
        gap: 16,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 4,
    },
    modalIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalGifContainer: {
        backgroundColor: '#f5f5f5',
        borderRadius: 16,
        padding: 12,
        minHeight: 160,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalGifPreview: {
        width: '100%',
        height: 160,
    },
    modalGridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'space-between',
    },
    modalGridItem: {
        width: '48%',
        aspectRatio: 1,
        borderRadius: 12,
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
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
