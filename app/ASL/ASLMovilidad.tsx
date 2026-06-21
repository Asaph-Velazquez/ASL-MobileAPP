import { ThemedView } from "@/components/BothComponents/themed-view";
import { commonStyles } from '@/styles/common';
import { useCameraPermissions } from "expo-camera";
import { useEffect, useState } from "react";
import { ScrollView, RefreshControl, StyleSheet, TouchableOpacity } from "react-native";
import { ASLPetitionModal } from '@/components/ASLComponents/asl-petition-modal';
import { GifPreviewContainer } from "@/components/ASLComponents/GifPreviewContainer";
import { ASLGridView, ASLOption } from "@/components/ASLComponents/ASLGridView";
import { TaxiRequestModal, TaxiRequestPayload } from "@/components/BothComponents/TaxiRequestModal";
import { usePetitionSender } from "@/hooks/usePetitionSender";
import { MobilityNoticeModal } from "@/components/BothComponents/MobilityNoticeModal";
import { hasSeenMobilityNotice, markMobilityNoticeSeen } from "@/services/mobilityNotice";
import { MaterialIcons } from "@expo/vector-icons";
import { ScreenHeader } from "@/components/BothComponents/ScreenHeader";

export default function ASLMovilidad(){
    const [servicioSeleccionado, setServicioSeleccionado] = useState<ASLOption | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [taxiModalVisible, setTaxiModalVisible] = useState(false);
    const [noticeVisible, setNoticeVisible] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const [selectedGif, setSelectedGif] = useState<any>(require('../../assets/gifs/ComidaGif.gif'));
    const [refreshing, setRefreshing] = useState(false);
    const { sendPetition, isLoading } = usePetitionSender();
    
    const defaultGif = require('../../assets/gifs/ComidaGif.gif');
    
    const MovilidadOptions: ASLOption[] = [{
        id: "VALET PARKING",
        gifSource: require('../../assets/gifs/ComidaGif.gif'),
        icon: "local-parking",
        iconType: "material",
        iconColor: "#3F51B5",
        bgColor: "#E8EAF6",
        cameraText: "VALET PARKING REQUEST IN SIGN LANGUAGE"
    }, {
        id: "TAXI OR RIDE-HAIL",
        gifSource: require('../../assets/gifs/ComidaGif.gif'),
        icon: "local-taxi",
        iconType: "material",
        iconColor: "#FFEB3B",
        bgColor: "#FFFDE7",
        cameraText: "TAXI REQUEST IN SIGN LANGUAGE"
    }];

    const handlePress = (opcion: ASLOption) => {
        if (opcion.id === "TAXI OR RIDE-HAIL") {
            setServicioSeleccionado(opcion);
            setTaxiModalVisible(true);
            return;
        }

        setServicioSeleccionado(opcion);
        setModalVisible(true);
    };

    const handleTaxiSend = async (payload: TaxiRequestPayload) => {
        const success = await sendPetition({
            type: 'services',
            serviceName: 'TAXI',
            description: payload.summary,
            priority: 'medium',
            details: payload,
        });

        if (success) {
            setTaxiModalVisible(false);
            setServicioSeleccionado(null);
        }
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
            // Recargar datos de disponibilidad de servicios
            await new Promise(resolve => setTimeout(resolve, 1000));
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const checkMobilityNotice = async () => {
            const seen = await hasSeenMobilityNotice();
            if (!seen && isMounted) {
                setNoticeVisible(true);
                await markMobilityNoticeSeen();
            }
        };

        checkMobilityNotice();

        return () => {
            isMounted = false;
        };
    }, []);

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
            <ScreenHeader
                title="TRANSPORT SERVICE"
                subtitle="SERVICE YOU NEED WHAT?"
            />
            <GifPreviewContainer gifSource={selectedGif} />
            <TouchableOpacity
                style={styles.helpButton}
                onPress={() => setNoticeVisible(true)}
                activeOpacity={0.85}
            >
                <MaterialIcons name="question-mark" size={20} color="#FFD54F" />
            </TouchableOpacity>
            
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
                cameraText="YOUR MESSAGE SHOW IN SIGN LANGUAGE"
            />

            <TaxiRequestModal
                visible={taxiModalVisible}
                onClose={() => setTaxiModalVisible(false)}
                onSend={handleTaxiSend}
                isLoading={isLoading}
                sourceMode="asl_guided"
            />

            <MobilityNoticeModal
                visible={noticeVisible}
                onClose={() => setNoticeVisible(false)}
            />

        </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    helpButton: {
        alignSelf: 'center',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#FFD54F',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 5,
        elevation: 4,
    },
});
