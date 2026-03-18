import { ThemedView } from "@/components/BothComponents/themed-view";
import { GifPreviewContainer } from "@/components/ASLComponents/GifPreviewContainer";
import { ASLGridView, ASLOption } from "@/components/ASLComponents/ASLGridView";
import { ASLPetitionModal } from '@/components/ASLComponents/asl-petition-modal';
import { useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { ScrollView } from "react-native";
import { useWebSocket } from '@/components/BothComponents/websocket-provider';
import { commonStyles } from '@/styles/common';

export default function ASLRoomS(){
    const [servicioSeleccionado, setServicioSeleccionado] = useState<ASLOption | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const { misPeticiones } = useWebSocket();
    const [selectedGif, setSelectedGif] = useState<any>(require('../../assets/gifs/ComidaGif.gif'));
    
    const defaultGif = require('../../assets/gifs/ComidaGif.gif');
    
    const opciones: ASLOption[] = [
        {
            id: "Comida",
            gifSource: require('../../assets/gifs/ComidaGif.gif'),
            icon: "flatware",
            iconType: "material",
            iconColor: "#FF6B6B",
            bgColor: "#FFE5E5",
            cameraText: "Show your food request in sign language"
        },
        {
            id: "Amenities",
            gifSource: require('../../assets/gifs/ComidaGif.gif'),
            icon: "soap",
            iconType: "material",
            iconColor: "#4ECDC4",
            bgColor: "#E0F7F5",
            cameraText: "Show your amenities request in sign language"
        },
        {
            id: "Lenceria",
            gifSource: require('../../assets/gifs/ComidaGif.gif'),
            icon: "bed",
            iconType: "material",
            iconColor: "#95E1D3",
            bgColor: "#E8F8F5",
            cameraText: "Show your linen request in sign language"
        },
        {
            id: "Comodidad",
            gifSource: require('../../assets/gifs/ComidaGif.gif'),
            icon: "self-improvement",
            iconType: "material",
            iconColor: "#A29BFE",
            bgColor: "#F0EFFF",
            cameraText: "Show your comfort request in sign language"
        },
        {
            id: "Extra",
            gifSource: require('../../assets/gifs/ComidaGif.gif'),
            icon: "question-mark",
            iconType: "material",
            iconColor: "#FDCB6E",
            bgColor: "#FFF6E0",
            cameraText: "Show your extra request in sign language"
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
                alert('Camera permissions are needed to use this feature');
                return;
            }
        }

        setCameraActive(true);
    };

    const handleCloseCamera = () => {
        setCameraActive(false);
        setModalVisible(false);
    };

    return(
        <ScrollView>
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
                cameraText="Show your message in sign language"
            />

        </ThemedView>
        </ScrollView>
    )
}