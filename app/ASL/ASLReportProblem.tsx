import { ThemedView } from "@/components/BothComponents/themed-view";
import { commonStyles } from '@/styles/common';
import { useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { ScrollView, RefreshControl } from "react-native";
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
    const [refreshing, setRefreshing] = useState(false);
    
    const defaultGif = require('../../assets/gifs/ComidaGif.gif');
       
    const problemOptions: ASLOption[] = [
        {
            id: "AIR CONDITIONING",
            gifSource: require('../../assets/gifs/ComidaGif.gif'),
            icon: "ac-unit",
            iconType: "material",
            iconColor: "#2196F3",
            bgColor: "#E3F2FD",
            cameraText: "AIR CONDITIONING PROBLEM SHOW IN SIGN LANGUAGE"
        },
        {
            id: "PLUMBING",
            gifSource: require('../../assets/gifs/ComidaGif.gif'),
            icon: "plumbing",
            iconType: "material",
            iconColor: "#03A9F4",
            bgColor: "#E1F5FE",
            cameraText: "PLUMBING PROBLEM SHOW IN SIGN LANGUAGE"
        },
        {
            id: "ELECTRICITY",
            gifSource: require('../../assets/gifs/ComidaGif.gif'),
            icon: "bolt",
            iconType: "material",
            iconColor: "#FFC107",
            bgColor: "#FFF8E1",
            cameraText: "ELECTRICITY PROBLEM SHOW IN SIGN LANGUAGE"
        },
        {
            id: "HOUSEKEEPING",
            gifSource: require('../../assets/gifs/ComidaGif.gif'),
            icon: "cleaning-services",
            iconType: "material",
            iconColor: "#4CAF50",
            bgColor: "#E8F5E9",
            cameraText: "HOUSEKEEPING PROBLEM SHOW IN SIGN LANGUAGE"
        },
        {
            id: "FURNITURE",
            gifSource: require('../../assets/gifs/ComidaGif.gif'),
            icon: "weekend",
            iconType: "material",
            iconColor: "#795548",
            bgColor: "#EFEBE9",
            cameraText: "FURNITURE PROBLEM SHOW IN SIGN LANGUAGE"
        },
        {
            id: "TV / INTERNET",
            gifSource: require('../../assets/gifs/ComidaGif.gif'),
            icon: "wifi-off",
            iconType: "material",
            iconColor: "#9C27B0",
            bgColor: "#F3E5F5",
            cameraText: "TV INTERNET PROBLEM SHOW IN SIGN LANGUAGE"
        },
        {
            id: "OTHER PROBLEM",
            gifSource: require('../../assets/gifs/ComidaGif.gif'),
            icon: "report-problem",
            iconType: "material",
            iconColor: "#F44336",
            bgColor: "#FFEBEE",
            cameraText: "YOUR PROBLEM SHOW IN SIGN LANGUAGE"
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
            // Recargar datos de reportes o problemas
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
                cameraText="PROBLEM DESCRIBE IN SIGN LANGUAGE"
            />

        </ThemedView>
        </ScrollView>
    );
}
