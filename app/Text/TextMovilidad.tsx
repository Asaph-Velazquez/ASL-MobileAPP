import { ThemedView } from "@/components/BothComponents/themed-view";
import { ScreenHeader } from "@/components/BothComponents/ScreenHeader";
import { ServiceCard, ServiceOption } from "@/components/TextComponents/ServiceCard";
import { PetitionModal } from "@/components/TextComponents/PetitionModal";
import { usePetitionSender } from "@/hooks/usePetitionSender";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

export default function TextMovilidad() {
    const [selectedOption, setSelectedOption] = useState<ServiceOption | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const { sendPetition, isLoading } = usePetitionSender();

    const mobilityOptions: ServiceOption[] = [
        {
            id: "Valet Parking",
            description: "Hotel staff parks your vehicle.",
            icon: "local-parking",
            iconType: "material",
            iconColor: "#3F51B5",
            bgColor: "#E8EAF6",
            placeholder: "Ex: I need valet parking at 3:00 PM for an event..."
        },
        {
            id: "Taxi or Ride-hailing",
            description: "Request taxi or apps like Uber/Lyft.",
            icon: "local-taxi",
            iconType: "material",
            iconColor: "#FFEB3B",
            bgColor: "#FFFDE7",
            placeholder: "Ex: I need a taxi to the airport tomorrow at 7:00 AM..."
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

    return (
        <ScrollView>
            <ThemedView style={styles.container}>
                <ScreenHeader 
                    title="Mobility Services"
                    subtitle="What service do you need?"
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
