import { ThemedView } from "@/components/BothComponents/themed-view";
import { ScreenHeader } from "@/components/BothComponents/ScreenHeader";
import { ServiceCard, ServiceOption } from "@/components/TextComponents/ServiceCard";
import { PetitionModal } from "@/components/TextComponents/PetitionModal";
import { usePetitionSender } from "@/hooks/usePetitionSender";
import { useEffect, useState } from "react";
import { ScrollView, RefreshControl, StyleSheet, TouchableOpacity, View } from "react-native";
import { TaxiRequestModal, TaxiRequestPayload } from "@/components/BothComponents/TaxiRequestModal";
import { MobilityNoticeModal } from "@/components/BothComponents/MobilityNoticeModal";
import { hasSeenMobilityNotice, markMobilityNoticeSeen } from "@/services/mobilityNotice";
import { MaterialIcons } from "@expo/vector-icons";

export default function TextMovilidad() {
    const [selectedOption, setSelectedOption] = useState<ServiceOption | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [taxiModalVisible, setTaxiModalVisible] = useState(false);
    const [noticeVisible, setNoticeVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const { sendPetition, isLoading } = usePetitionSender();

    const mobilityOptions: ServiceOption[] = [
        {
            id: "VALET PARKING",
            description: "YOUR CAR, HOTEL STAFF PARK.",
            icon: "local-parking",
            iconType: "material",
            iconColor: "#3F51B5",
            bgColor: "#E8EAF6",
            placeholder: "EX: NEED VALET PARKING 3:00 PM."
        },
        {
            id: "TAXI, APP TRANSPORT",
            description: "TAXI, APP CAR ORDER.",
            icon: "local-taxi",
            iconType: "material",
            iconColor: "#FFEB3B",
            bgColor: "#FFFDE7",
            placeholder: "EX: NEED TAXI AIRPORT TOMORROW 7:00 AM."
        }
    ];

    const handleCardPress = (option: ServiceOption) => {
        if (option.id === "TAXI, APP TRANSPORT") {
            setSelectedOption(option);
            setTaxiModalVisible(true);
            return;
        }

        setSelectedOption(option);
        setModalVisible(true);
    };

    const handleSend = async (description: string) => {
        if (!selectedOption) return;

        const success = await sendPetition({
            type: 'services',
            serviceName: selectedOption.id,
            description,
            priority: 'medium',
            details: {
                serviceType: 'valet',
                sourceMode: 'text_guided',
            },
        });

        if (success) {
            setModalVisible(false);
            setSelectedOption(null);
        }
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
            setSelectedOption(null);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            // Recargar servicios de movilidad
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

    return (
        <ScrollView
            refreshControl={
                <RefreshControl 
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#4A90E2"
                />
            }
        >
            <ThemedView style={styles.container}>
                <ScreenHeader 
                    title="TRANSPORT SERVICE"
                    subtitle="SERVICE YOU NEED WHAT?"
                />
                <TouchableOpacity
                    style={styles.helpButton}
                    onPress={() => setNoticeVisible(true)}
                    activeOpacity={0.85}
                >
                    <MaterialIcons name="question-mark" size={20} color="#FFD54F" />
                </TouchableOpacity>
                
                <View style={styles.cardsContainer}>
                    {mobilityOptions.map((option, index) => (
                        <ServiceCard 
                            key={index} 
                            option={option}
                            onPress={handleCardPress}
                            isSelected={selectedOption?.id === option.id}
                        />
                    ))}
                </View>

                <PetitionModal
                    visible={modalVisible}
                    selectedOption={selectedOption}
                    onClose={() => setModalVisible(false)}
                    onSend={handleSend}
                    isLoading={isLoading}
                />

                <TaxiRequestModal
                    visible={taxiModalVisible}
                    onClose={() => setTaxiModalVisible(false)}
                    onSend={handleTaxiSend}
                    isLoading={isLoading}
                    sourceMode="text_guided"
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
    container: {
        flex: 1,
        padding: 20,
    },
    cardsContainer: {
        marginTop: 24,
        gap: 16,
    },
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
        marginTop: -8,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 5,
        elevation: 4,
    },
});
