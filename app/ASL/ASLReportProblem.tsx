import { ThemedView } from "@/components/BothComponents/themed-view";
import { commonStyles } from '@/styles/common';
import { useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { ScrollView } from "react-native";
import { ASLPetitionModal } from '@/components/ASLComponents/asl-petition-modal';
import { GifPreviewContainer } from "@/components/ASLComponents/GifPreviewContainer";
import { ASLGridView, ASLOption } from "@/components/ASLComponents/ASLGridView";
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
            id: "Air Conditioning",
            gifSource: require('../../assets/gifs/ComidaGif.gif'),
            icon: "ac-unit",
            iconType: "material",
            iconColor: "#2196F3",
            bgColor: "#E3F2FD",
            cameraText: "Show the air conditioning problem in sign language"
        },
        {
            id: "Plumbing",
            gifSource: require('../../assets/gifs/ComidaGif.gif'),
            icon: "plumbing",
            iconType: "material",
            iconColor: "#03A9F4",
            bgColor: "#E1F5FE",
            cameraText: "Show the plumbing problem in sign language"
        },
        {
            id: "Electricity",
            gifSource: require('../../assets/gifs/ComidaGif.gif'),
            icon: "bolt",
            iconType: "material",
            iconColor: "#FFC107",
            bgColor: "#FFF8E1",
            cameraText: "Show the electricity problem in sign language"
        },
        {
            id: "Housekeeping",
            gifSource: require('../../assets/gifs/ComidaGif.gif'),
            icon: "cleaning-services",
            iconType: "material",
            iconColor: "#4CAF50",
            bgColor: "#E8F5E9",
            cameraText: "Show the housekeeping problem in sign language"
        },
        {
            id: "Noise",
            gifSource: require('../../assets/gifs/ComidaGif.gif'),
            icon: "volume-up",
            iconType: "material",
            iconColor: "#FF5722",
            bgColor: "#FBE9E7",
            cameraText: "Show the noise problem in sign language"
        },
        {
            id: "Furniture",
            gifSource: require('../../assets/gifs/ComidaGif.gif'),
            icon: "weekend",
            iconType: "material",
            iconColor: "#795548",
            bgColor: "#EFEBE9",
            cameraText: "Show the furniture problem in sign language"
        },
        {
            id: "TV / Internet",
            gifSource: require('../../assets/gifs/ComidaGif.gif'),
            icon: "wifi-off",
            iconType: "material",
            iconColor: "#9C27B0",
            bgColor: "#F3E5F5",
            cameraText: "Show the TV/Internet problem in sign language"
        },
        {
            id: "Other Problem",
            gifSource: require('../../assets/gifs/ComidaGif.gif'),
            icon: "report-problem",
            iconType: "material",
            iconColor: "#F44336",
            bgColor: "#FFEBEE",
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

        </ThemedView>
        </ScrollView>
    );
}
