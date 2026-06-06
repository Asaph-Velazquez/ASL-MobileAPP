import { ThemedView } from "@/components/BothComponents/themed-view";
import { ScreenHeader } from "@/components/BothComponents/ScreenHeader";
import { ServiceCard, ServiceOption } from "@/components/TextComponents/ServiceCard";
import { PetitionModal } from "@/components/TextComponents/PetitionModal";
import { usePetitionSender } from "@/hooks/usePetitionSender";
import { useState } from "react";
import { ScrollView, RefreshControl, StyleSheet, View } from "react-native";

export default function TextMovilidad() {
    const [selectedOption, setSelectedOption] = useState<ServiceOption | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const { sendPetition, isLoading } = usePetitionSender();

    const mobilityOptions: ServiceOption[] = [
        {
            id: "VALET PARKING",
            description: "YOUR VEHICLE, HOTEL STAFF PARK.",
            icon: "local-parking",
            iconType: "material",
            iconColor: "#3F51B5",
            bgColor: "#E8EAF6",
            placeholder: "EX: NEED VALET PARKING 3:00 PM."
        },
        {
            id: "TAXI OR RIDE-HAIL",
            description: "TAXI OR APP TRANSPORT, REQUEST.",
            icon: "local-taxi",
            iconType: "material",
            iconColor: "#FFEB3B",
            bgColor: "#FFFDE7",
            placeholder: "EX: NEED TAXI AIRPORT TOMORROW 7:00 AM."
        }
    ];

    const handleCardPress = (option: ServiceOption) => {
        setSelectedOption(option);
        setModalVisible(true);
    };

    const handleSend = async (description: string) => {
        if (!selectedOption) return;

        const success = await sendPetition({
            type: 'extra',
            serviceName: selectedOption.id,
            description,
            priority: 'medium'
        });

        if (success) {
            setModalVisible(false);
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
                    title="MOBILITY SERVICES"
                    subtitle="WHAT SERVICE YOU NEED?"
                />
                
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
});
