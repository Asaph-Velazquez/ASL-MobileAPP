import { ThemedView } from "@/components/BothComponents/themed-view";
import { commonStyles } from '@/styles/common';
import { useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { ScrollView } from "react-native";
import { ASLPetitionModal } from '@/components/ASLComponents/asl-petition-modal';
import { GifPreviewContainer } from "@/components/ASLComponents/GifPreviewContainer";
import { ASLGridView, ASLOption } from "@/components/ASLComponents/ASLGridView";
import { ASLPetitionHistory } from "@/components/ASLComponents/ASLPetitionHistory";
import { useWebSocket } from '@/components/BothComponents/websocket-provider';

export default function ASLReportProblem(){
    const [problemaSeleccionado, setProblemaSeleccionado] = useState<ASLOption | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const { misPeticiones } = useWebSocket();
    const [selectedGif, setSelectedGif] = useState<any>(require('../../assets/gifs/ComidaGif.gif'));
    
    const defaultGif = require('../../assets/gifs/ComidaGif.gif');
       
    const problemOptions: ASLOption[] = [
        {
            id: "Limpieza",
            gifSource: require('../../assets/gifs/ComidaGif.gif'),
            icon: "cleaning-services",
            iconType: "material",
            iconColor: "#2196F3",
            bgColor: "#E3F2FD",
            cameraText: "Show the cleaning problem in sign language"
        },
        {
            id: "Mantenimiento",
            gifSource: require('../../assets/gifs/ComidaGif.gif'),
            icon: "build",
            iconType: "material",
            iconColor: "#FF9800",
            bgColor: "#FFF3E0",
            cameraText: "Show the maintenance problem in sign language"
        },
        {
            id: "Ruido",
            gifSource: require('../../assets/gifs/ComidaGif.gif'),
            icon: "volume-up",
            iconType: "material",
            iconColor: "#F44336",
            bgColor: "#FFEBEE",
            cameraText: "Show the noise problem in sign language"
        },
        {
            id: "Temperatura",
            gifSource: require('../../assets/gifs/ComidaGif.gif'),
            icon: "thermostat",
            iconType: "material",
            iconColor: "#9C27B0",
            bgColor: "#F3E5F5",
            cameraText: "Show the temperature problem in sign language"
        },
        {
            id: "Otro",
            gifSource: require('../../assets/gifs/ComidaGif.gif'),
            icon: "more-horiz",
            iconType: "material",
            iconColor: "#607D8B",
            bgColor: "#ECEFF1",
            cameraText: "Show your problem in sign language"
        }
    ];

    const handlePress = (opcion: ASLOption) => {
        setProblemaSeleccionado(opcion);
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
                options={problemOptions}
                onOptionPress={handlePress}
                onPreviewChange={setSelectedGif}
                defaultGif={defaultGif}
            />

            <ASLPetitionModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                selectedOption={problemaSeleccionado}
                cameraActive={cameraActive}
                onActivateCamera={handleActivateCamera}
                onCloseCamera={handleCloseCamera}
                cameraText="Describe the problem in sign language"
            />

            <ASLPetitionHistory peticiones={misPeticiones} />

        </ThemedView>
        </ScrollView>
    );
}
