import { ThemedView } from "@/components/BothComponents/themed-view";
import { ScreenHeader } from "@/components/BothComponents/ScreenHeader";
import { ServiceCard, ServiceOption } from "@/components/TextComponents/ServiceCard";
import { PetitionModal } from "@/components/TextComponents/PetitionModal";
import { usePetitionSender } from "@/hooks/usePetitionSender";
import { useState } from "react";
import { ScrollView, RefreshControl, StyleSheet, View } from "react-native";

export default function ReportProblem() {
    const [selectedOption, setSelectedOption] = useState<ServiceOption | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const { sendPetition, isLoading } = usePetitionSender();

    const problemOptions: ServiceOption[] = [
        {
            id: "AIR CONDITIONING",
            description: "AC, HEAT PROBLEM, REPORT.",
            icon: "ac-unit",
            iconType: "material",
            iconColor: "#2196F3",
            bgColor: "#E3F2FD",
            placeholder: "EX: AC NOT COOL. ROOM STILL HOT."
        },
        {
            id: "PLUMBING",
            description: "WATER, DRAIN, TOILET PROBLEM.",
            icon: "plumbing",
            iconType: "material",
            iconColor: "#03A9F4",
            bgColor: "#E1F5FE",
            placeholder: "EX: SHOWER NO HOT WATER. SINK LEAK."
        },
        {
            id: "ELECTRICITY",
            description: "POWER, PLUG PROBLEM.",
            icon: "bolt",
            iconType: "material",
            iconColor: "#FFC107",
            bgColor: "#FFF8E1",
            placeholder: "EX: BED OUTLET NOT WORK. LIGHT FLICKER."
        },
        {
            id: "HOUSEKEEPING",
            description: "ROOM DIRTY, CLEANING NEED.",
            icon: "cleaning-services",
            iconType: "material",
            iconColor: "#4CAF50",
            bgColor: "#E8F5E9",
            placeholder: "EX: NEED EXTRA BATHROOM CLEANING. TOWELS MISSING."
        },
        {
            id: "FURNITURE",
            description: "FURNITURE, ITEM BROKEN.",
            icon: "weekend",
            iconType: "material",
            iconColor: "#795548",
            bgColor: "#EFEBE9",
            placeholder: "EX: CHAIR BROKEN. DRAWER NOT CLOSE."
        },
        {
            id: "TV / INTERNET",
            description: "TV, WIFI CONNECTION PROBLEM.",
            icon: "wifi-off",
            iconType: "material",
            iconColor: "#9C27B0",
            bgColor: "#F3E5F5",
            placeholder: "EX: WIFI NOT WORK. TV NO SIGNAL."
        },
        {
            id: "OTHER PROBLEM",
            description: "OTHER PROBLEM, EXPLAIN.",
            icon: "report-problem",
            iconType: "material",
            iconColor: "#F44336",
            bgColor: "#FFEBEE",
            placeholder: "EX: DESCRIBE PROBLEM HERE."
        }
    ];

    const handleCardPress = (option: ServiceOption) => {
        setSelectedOption(option);
        setModalVisible(true);
    };

    const handleSend = async (description: string) => {
        if (!selectedOption) return;

        const success = await sendPetition({
            type: 'problem',
            serviceName: selectedOption.id,
            description,
            priority: 'urgent'
        });

        if (success) {
            setModalVisible(false);
            setSelectedOption(null);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            // Recargar lista de problemas reportables
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
                    title="REPORT PROBLEM"
                    subtitle="PROBLEM YOU NEED REPORT WHAT?"
                />
                
                <View style={styles.cardsContainer}>
                    {problemOptions.map((option, index) => (
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
                    sendButtonText="SEND REPORT"
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
