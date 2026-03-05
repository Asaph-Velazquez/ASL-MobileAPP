import { ThemedView } from "@/components/BothComponents/themed-view";
import { ScreenHeader } from "@/components/BothComponents/ScreenHeader";
import { ServiceCard, ServiceOption } from "@/components/TextComponents/ServiceCard";
import { PetitionModal } from "@/components/TextComponents/PetitionModal";
import { usePetitionSender } from "@/hooks/usePetitionSender";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

export default function ReportProblem() {
    const [selectedOption, setSelectedOption] = useState<ServiceOption | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const { sendPetition, isLoading } = usePetitionSender();

    const problemOptions: ServiceOption[] = [
        {
            id: "Air Conditioning",
            description: "Report problems with air conditioning or heating.",
            icon: "ac-unit",
            iconType: "material",
            iconColor: "#2196F3",
            bgColor: "#E3F2FD",
            placeholder: "Ex: The AC is not cooling well, temperature won't drop below 77°F..."
        },
        {
            id: "Plumbing",
            description: "Problems with water, drainage or sanitary facilities.",
            icon: "plumbing",
            iconType: "material",
            iconColor: "#03A9F4",
            bgColor: "#E1F5FE",
            placeholder: "Ex: The shower has no hot water, there's a leak in the sink..."
        },
        {
            id: "Electricity",
            description: "Electrical failures, power outages or outlet problems.",
            icon: "bolt",
            iconType: "material",
            iconColor: "#FFC107",
            bgColor: "#FFF8E1",
            placeholder: "Ex: The outlet near the bed doesn't work, lights are flickering..."
        },
        {
            id: "Housekeeping",
            description: "Request additional cleaning or report hygiene issues.",
            icon: "cleaning-services",
            iconType: "material",
            iconColor: "#4CAF50",
            bgColor: "#E8F5E9",
            placeholder: "Ex: I need additional cleaning in the bathroom, missing towel replacement..."
        },
        {
            id: "Noise",
            description: "Report disturbances from excessive noise.",
            icon: "volume-up",
            iconType: "material",
            iconColor: "#FF5722",
            bgColor: "#FBE9E7",
            placeholder: "Ex: There's a lot of noise coming from the next room..."
        },
        {
            id: "Furniture",
            description: "Damaged furniture or items needing repair.",
            icon: "weekend",
            iconType: "material",
            iconColor: "#795548",
            bgColor: "#EFEBE9",
            placeholder: "Ex: The desk chair is broken, the drawer won't close properly..."
        },
        {
            id: "TV / Internet",
            description: "Problems with television, WiFi or connectivity.",
            icon: "wifi-off",
            iconType: "material",
            iconColor: "#9C27B0",
            bgColor: "#F3E5F5",
            placeholder: "Ex: WiFi is not working, TV won't turn on or has no signal..."
        },
        {
            id: "Other Problem",
            description: "Describe any other problem you need to report.",
            icon: "report-problem",
            iconType: "material",
            iconColor: "#F44336",
            bgColor: "#FFEBEE",
            placeholder: "Ex: Describe the problem you're experiencing..."
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

    return (
        <ScrollView>
            <ThemedView style={styles.container}>
                <ScreenHeader 
                    title="Report Problem"
                    subtitle="What problem do you need to report?"
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
                    sendButtonText="Send Report"
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
