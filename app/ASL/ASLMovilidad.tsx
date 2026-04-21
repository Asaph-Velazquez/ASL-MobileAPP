import { ThemedView } from "@/components/BothComponents/themed-view";
import { commonStyles } from '@/styles/common';
import { useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { ScrollView, RefreshControl } from "react-native";
import { ASLPetitionModal } from '@/components/ASLComponents/asl-petition-modal';
import { GifPreviewContainer } from "@/components/ASLComponents/GifPreviewContainer";
import { ASLGridView, ASLOption } from "@/components/ASLComponents/ASLGridView";
import { useWebSocket } from '@/components/BothComponents/websocket-provider';

export default function ASLMovilidad(){
    const [servicioSeleccionado, setServicioSeleccionado] = useState<ASLOption | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const { misPeticiones } = useWebSocket();
    const [selectedGif, setSelectedGif] = useState<any>(require('../../assets/gifs/ComidaGif.gif'));
    const [refreshing, setRefreshing] = useState(false);
    
    const defaultGif = require('../../assets/gifs/ComidaGif.gif');
    
    const MovilidadOptions: ASLOption[] = [{
        id: "Valet Parking",
        gifSource: require('../../assets/gifs/ComidaGif.gif'),
        icon: "local-parking",
        iconType: "material",
        iconColor: "#3F51B5",
        bgColor: "#E8EAF6",
        cameraText: "Request valet parking in sign language"
    }, {
        id: "Taxi o Ride-hailing",
        gifSource: require('../../assets/gifs/ComidaGif.gif'),
        icon: "local-taxi",
        iconType: "material",
        iconColor: "#FFEB3B",
        bgColor: "#FFFDE7",
        cameraText: "Request a taxi in sign language"
    }];

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
    
    const onRefresh = async () => {
        setRefreshing(true);
        try {
            // Recargar datos de disponibilidad de servicios
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
                options={MovilidadOptions}
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
    );
}
