import { ThemedView } from "@/components/BothComponents/themed-view";
import { GifPreviewContainer } from "@/components/ASLComponents/GifPreviewContainer";
import { ASLGridView, ASLOption } from "@/components/ASLComponents/ASLGridView";
import { ASLPetitionModal } from '@/components/ASLComponents/asl-petition-modal';
import { useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { ScrollView, RefreshControl } from "react-native";
import { useWebSocket } from '@/components/BothComponents/websocket-provider';
import { commonStyles } from '@/styles/common';

export default function ASLRoomS(){
    const [servicioSeleccionado, setServicioSeleccionado] = useState<ASLOption | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const { misPeticiones } = useWebSocket();
    const [selectedGif, setSelectedGif] = useState<any>(require('../../assets/gifs/ComidaGif.gif'));
    const [refreshing, setRefreshing] = useState(false);
    
    const defaultGif = require('../../assets/gifs/ComidaGif.gif');
    
    const opciones: ASLOption[] = [
        {
            id: "FOOD",
            gifSource: require('../../assets/gifs/ComidaGif.gif'),
            icon: "flatware",
            iconType: "material",
            iconColor: "#FF6B6B",
            bgColor: "#FFE5E5",
            cameraText: "FOOD REQUEST SHOW IN SIGN LANGUAGE"
        },
        {
            id: "AMENITIES",
            gifSource: require('../../assets/gifs/ComidaGif.gif'),
            icon: "sanitizer",
            iconType: "material",
            iconColor: "#4ECDC4",
            bgColor: "#E0F7F5",
            cameraText: "AMENITIES REQUEST SHOW IN SIGN LANGUAGE"
        },
        {
            id: "LINENS",
            gifSource: require('../../assets/gifs/ComidaGif.gif'),
            icon: "bed",
            iconType: "material",
            iconColor: "#95E1D3",
            bgColor: "#E8F8F5",
            cameraText: "LINEN REQUEST SHOW IN SIGN LANGUAGE"
        },
        {
            id: "COMFORT ITEMS",
            gifSource: require('../../assets/gifs/ComidaGif.gif'),
            icon: "self-improvement",
            iconType: "material",
            iconColor: "#A29BFE",
            bgColor: "#F0EFFF",
            cameraText: "COMFORT REQUEST SHOW IN SIGN LANGUAGE"
        },
        {
            id: "EXTRA",
            gifSource: require('../../assets/gifs/ComidaGif.gif'),
            icon: "question-mark",
            iconType: "material",
            iconColor: "#FDCB6E",
            bgColor: "#FFF6E0",
            cameraText: "EXTRA REQUEST SHOW IN SIGN LANGUAGE"
        }       
    ];

    const handlePress = (opcion: ASLOption) => {
        setServicioSeleccionado(opcion);
        setModalVisible(true);
    };

    const handleActivateCamera = async () => {
        if (!permission) {
            return;
        }

        if (!permission.granted) {
            const { granted } = await requestPermission();
            if (!granted) {
                alert('CAMERA PERMISSION NEED FOR THIS FEATURE');
                return;
            }
        }

        setCameraActive(true);
    };

    const handleCloseCamera = () => {
        setCameraActive(false);
        setModalVisible(false);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            // Recargar datos de peticiones o estado
            await new Promise(resolve => setTimeout(resolve, 1000));
        } finally {
            setRefreshing(false);
        }
    };

    return(
        <ScrollView
            refreshControl={
                <RefreshControl 
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#4A90E2"
                />
            }
        >
        <ThemedView style={commonStyles.container}>
            <GifPreviewContainer gifSource={selectedGif} />
            
            <ASLGridView 
                options={opciones}
                onOptionPress={handlePress}
                onPreviewChange={setSelectedGif}
                defaultGif={defaultGif}
            />

            <ASLPetitionModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                selectedOption={servicioSeleccionado}
                cameraActive={cameraActive}
                onActivateCamera={handleActivateCamera}
                onCloseCamera={handleCloseCamera}
                cameraText="YOUR MESSAGE SHOW IN SIGN LANGUAGE"
            />

        </ThemedView>
        </ScrollView>
    )
}
