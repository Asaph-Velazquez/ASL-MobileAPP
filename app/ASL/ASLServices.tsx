import { ThemedView } from "@/components/BothComponents/themed-view";
import { ASLCardIcon } from '@/components/ASLComponents/ASLCardIcon';
import { ASLVideoPreview } from '@/components/ASLComponents/ASLVideoPreview';
import { useThemeColor } from '@/hooks/use-theme-color';
import { commonStyles } from '@/styles/common';
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image, Modal, Pressable, ScrollView, RefreshControl, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";

type ServiceDetail = 'horarioGif' | 'ubicacionGif' | 'incluyeGif' | 'notaGif';

export default function ASLServices(){
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();
    const modalVideoWidth = Math.max(Math.min(width - 40, 640) - 32, 0);
    const availableHeight = Math.max(height - Math.max(20, insets.top) - Math.max(20, insets.bottom), 0);
    const modalVideoHeight = Math.min(modalVideoWidth, availableHeight * 0.5, 360);
    const modalHeight = Math.min(availableHeight * 0.9, modalVideoHeight + 560);
    const cardBg = useThemeColor({}, 'card');
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedService, setSelectedService] = useState<any>(null);
    const [selectedGif, setSelectedGif] = useState<any>(require('../../assets/gifs/00006.mp4'));
    const [selectedMediaType, setSelectedMediaType] = useState<'gif' | 'video'>('video');
    const [modalGif, setModalGif] = useState<any>(null);
    const [modalMediaType, setModalMediaType] = useState<'gif' | 'video'>('video');
    const [selectedDetail, setSelectedDetail] = useState<ServiceDetail | null>(null);
    const [replayToken, setReplayToken] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    
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
        gifUrl: require('../../assets/gifs/00008.mp4'),
        mediaType: 'video' as const,
        icon: "food-bank",
        iconType: "material" as const,
        iconColor: "#FF9800",
        bgColor: "#FFF3E0",
        detalles: {
            // GIF de horario en ASL
            horarioGif: require('../../assets/gifs/00008.mp4'),
            // GIF de ubicación en ASL
            ubicacionGif: require('../../assets/gifs/00008.mp4'),
            incluyeGif: null,
            notaGif: null
        }
        },{
        id: "Alberca",
        gifUrl: require('../../assets/gifs/00009.mp4'),
        mediaType: 'video' as const,
        icon: "pool",
        iconType: "material" as const,
        iconColor: "#00BCD4",
        bgColor: "#E0F7FA",
        detalles: {
            horarioGif: require('../../assets/gifs/00009.mp4'),
            ubicacionGif: require('../../assets/gifs/00009.mp4'),
            incluyeGif: null,
            notaGif: null
        }
        },{
        id: "Gimnasio",
        gifUrl: require('../../assets/gifs/00010.mp4'),
        mediaType: 'video' as const,
        icon: "fitness-center",
        iconType: "material" as const,
        iconColor: "#F44336",
        bgColor: "#FFEBEE",
        detalles: {
            horarioGif: require('../../assets/gifs/00010.mp4'),
            ubicacionGif: require('../../assets/gifs/00010.mp4'),
            incluyeGif: null,
            notaGif: null
        }
        },
        {
        id: "Spa",
        gifUrl: require('../../assets/gifs/00011.mp4'),
        mediaType: 'video' as const,
        icon: "spa",
        iconType: "material" as const,
        iconColor: "#9C27B0",
        bgColor: "#F3E5F5",
        detalles: {
            horarioGif: require('../../assets/gifs/00011.mp4'),
            ubicacionGif: require('../../assets/gifs/00011.mp4'),
            incluyeGif: null,
            notaGif: null
        }
    }];

    const handlePress = (opcion: any) => {
        setSelectedService(opcion);
        setModalGif(opcion.gifUrl);
        setModalMediaType(opcion.mediaType ?? 'gif');
        setSelectedDetail(null);
        setReplayToken(0);
        setModalVisible(true);
    };

    const showDetail = (detail: ServiceDetail) => {
        setSelectedDetail(detail);
        setModalGif(selectedService.detalles[detail] ?? selectedService.gifUrl);
        setModalMediaType(selectedService.mediaType ?? 'gif');
        setReplayToken(current => current + 1);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            // Recargar servicios disponibles
            await new Promise(resolve => setTimeout(resolve, 1000));
        } finally {
            setRefreshing(false);
        }
    };
    
    return(
        <ScrollView
          decelerationRate="fast"
          scrollEventThrottle={16}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={
              <RefreshControl 
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#4A90E2"
              />
          }
        >
        <ThemedView style={commonStyles.container}>
            {/* Área de visualización del GIF grande */}
            <View style={styles.gifPreviewContainer}>
                {selectedMediaType === 'video' ? <ASLVideoPreview source={selectedGif} style={styles.gifPreview} /> : <Image
                    source={getImageSource(selectedGif)} style={styles.gifPreview} resizeMode="contain"
                />}
            </View>
            
            {/* Cuadrícula de opciones */}
            <View style={styles.gridContainer}>
                {ServiceOptions.map((opcion, index) => (
                    <TouchableOpacity 
                        key={index}
                        style={[styles.gridItem, { backgroundColor: cardBg }]}
                        onPressIn={() => { setSelectedGif(opcion.gifUrl); setSelectedMediaType(opcion.mediaType ?? 'gif'); }}
                        onPressOut={() => { setSelectedGif(require('../../assets/gifs/00006.mp4')); setSelectedMediaType('video'); }}
                        onPress={() => handlePress(opcion)}
                        activeOpacity={0.7}
                    >
                        <ASLCardIcon name={opcion.icon} type={opcion.iconType} color={opcion.iconColor} />
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
                <View
                    style={[styles.modalOverlay, { paddingTop: Math.max(20, insets.top), paddingBottom: Math.max(20, insets.bottom) }]}
                >
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setModalVisible(false)} accessibilityLabel="Close service details" />
                    <View
                        style={[styles.modalContent, { backgroundColor: cardBg, height: modalHeight }]}
                    >
                        {modalVisible && selectedService && (
                            <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalInner} nestedScrollEnabled>
                                {/* Header del modal */}
                                <View style={styles.modalHeader}>
                                    <View style={[styles.modalIcon, { backgroundColor: backgroundColor, borderColor: selectedService.iconColor, borderWidth: 2 }]}>
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

                                <View style={styles.modalGifContainer} pointerEvents="none">
                                    {modalGif == null ? (
                                        <View style={[styles.unavailableVideo, { height: modalVideoHeight }]}>
                                            <MaterialIcons name="videocam-off" size={48} color={textColor} />
                                            <Text style={[styles.unavailableText, { color: textColor }]}>ASL VIDEO NOT AVAILABLE</Text>
                                        </View>
                                    ) : modalMediaType === 'video' ? (
                                        <ASLVideoPreview
                                            source={modalGif}
                                            replayToken={replayToken}
                                            style={[styles.modalGifPreview, { height: modalVideoHeight }]}
                                        />
                                    ) : (
                                        <Image
                                            source={getImageSource(modalGif)}
                                            style={[styles.modalGifPreview, { height: modalVideoHeight }]}
                                            resizeMode="contain"
                                        />
                                    )}
                                </View>

                                {/* Cuadrícula de detalles */}
                                <View style={styles.modalGridContainer}>
                                    {/* Horario */}
                                    <TouchableOpacity 
                                        style={[styles.modalGridItem, { backgroundColor: selectedService.bgColor, borderColor: selectedDetail === 'horarioGif' ? selectedService.iconColor : 'transparent' }]}
                                        onPress={() => showDetail('horarioGif')}
                                        accessibilityLabel="SCHEDULE"
                                        accessibilityRole="button"
                                        accessibilityState={{ selected: selectedDetail === 'horarioGif' }}
                                        activeOpacity={0.7}
                                    >
                                        <ASLCardIcon name="schedule" type="material" color={selectedService.iconColor} />
                                    </TouchableOpacity>

                                    {/* Ubicación */}
                                    <TouchableOpacity 
                                        style={[styles.modalGridItem, { backgroundColor: selectedService.bgColor, borderColor: selectedDetail === 'ubicacionGif' ? selectedService.iconColor : 'transparent' }]}
                                        onPress={() => showDetail('ubicacionGif')}
                                        accessibilityLabel="LOCATION"
                                        accessibilityRole="button"
                                        accessibilityState={{ selected: selectedDetail === 'ubicacionGif' }}
                                        activeOpacity={0.7}
                                    >
                                        <ASLCardIcon name="location-on" type="material" color={selectedService.iconColor} />
                                    </TouchableOpacity>

                                    {/* Incluye */}
                                    <TouchableOpacity 
                                        style={[styles.modalGridItem, { backgroundColor: selectedService.bgColor, borderColor: selectedDetail === 'incluyeGif' ? selectedService.iconColor : 'transparent' }]}
                                        onPress={() => showDetail('incluyeGif')}
                                        accessibilityLabel="INCLUDED"
                                        accessibilityRole="button"
                                        accessibilityState={{ selected: selectedDetail === 'incluyeGif' }}
                                        activeOpacity={0.7}
                                    >
                                        <ASLCardIcon name="check-circle" type="material" color={selectedService.iconColor} />
                                    </TouchableOpacity>

                                    {/* Nota */}
                                    <TouchableOpacity 
                                        style={[styles.modalGridItem, { backgroundColor: selectedService.bgColor, borderColor: selectedDetail === 'notaGif' ? selectedService.iconColor : 'transparent' }]}
                                        onPress={() => showDetail('notaGif')}
                                        accessibilityLabel="NOTES"
                                        accessibilityRole="button"
                                        accessibilityState={{ selected: selectedDetail === 'notaGif' }}
                                        activeOpacity={0.7}
                                    >
                                        <ASLCardIcon name="info" type="material" color={selectedService.iconColor} />
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
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    gifPreviewContainer: {
        marginTop: 20,
        marginHorizontal: 20,
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
        width: '100%',
        maxWidth: 560,
        alignSelf: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
        gap: 16,
        justifyContent: 'center',
    },
    gridItem: {
        width: '47%',
        maxWidth: 240,
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
        padding: 16,
        width: '100%',
        maxWidth: 640,
        maxHeight: '100%',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalScroll: { flex: 1, minHeight: 0 },
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
        borderRadius: 16,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalGifPreview: {
        width: '100%',
    },
    unavailableVideo: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    unavailableText: { fontSize: 16, textAlign: 'center', fontWeight: '600' },
    modalGridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'center',
    },
    modalGridItem: {
        width: '48%',
        maxWidth: 200,
        aspectRatio: 1,
        borderRadius: 12,
        padding: 8,
        borderWidth: 2,
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
