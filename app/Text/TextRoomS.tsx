import { ThemedView } from "@/components/BothComponents/themed-view";
import { ServiceCard, ServiceOption } from "@/components/TextComponents/ServiceCard";
import { ScreenHeader } from "@/components/BothComponents/ScreenHeader";
import { PetitionModal } from "@/components/TextComponents/PetitionModal";
import { usePetitionSender } from "@/hooks/usePetitionSender";
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from "react-native";

export default function TextRoomS(){
    const [selectedService, setSelectedService] = useState<ServiceOption | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const { sendPetition, isLoading } = usePetitionSender();

    const opciones: ServiceOption[] = [
        {
            id: "Food",
            description: "Enjoy a delicious meal in your room.",
            icon: "flatware",
            iconType: "material" as const,
            iconColor: "#FF6B6B",
            bgColor: "#FFE5E5",
            placeholder: "Ex: I want to order dinner for 2 people at 8:00 PM..."
        },
        {
            id: "Amenities",
            description: "If you need towels, soap or any other item, just ask!",
            icon: "sanitizer",
            iconType: "material" as const,
            iconColor: "#4ECDC4",
            bgColor: "#E0F7F5",
            placeholder: "Ex: I request extra towels and soap, please."
        },
        {
            id: "Linens",
            description: "Request replacement of sheets, towels or pillowcases.",
            icon: "bed",
            iconType: "material" as const,
            iconColor: "#95E1D3",
            bgColor: "#E8F8F5",
            placeholder: "Ex: I need fresh sheets and towels, please."
        },
        {
            id: "Comfort Items",
            description: "Request extra pillows, blankets or items to improve your rest.",
            icon: "self-improvement",
            iconType: "material" as const,
            iconColor: "#A29BFE",
            bgColor: "#F0EFFF",
            placeholder: "Ex: I request an extra pillow and an additional blanket."
        },
        {
            id: "Extra",
            description: "For additional services, we'll connect you with reception (additional charges may apply, availability not guaranteed).",
            icon: "question-mark",
            iconType: "material" as const,
            iconColor: "#FDCB6E",
            bgColor: "#FFF6E0",
            placeholder: "Ex: I would like to request an additional service, please describe..."
        }       
    ];

    const handlePress = (option: ServiceOption) => {
        setSelectedService(option);
        setModalVisible(true);
    };

    const handleSend = async (description: string) => {
        if (!selectedService) return;

        const success = await sendPetition({
            type: 'room-service',
            serviceName: selectedService.id,
            description,
            priority: 'high',
        });

        if (success) {
            setModalVisible(false);
            setSelectedService(null);
        }
    };

    return(
        <ThemedView style={styles.container}>
            <ScrollView>
                <ScreenHeader 
                    title="Room Service"
                    subtitle="How can we help you today?"
                />
                
                <View style={styles.cardsContainer}>
                    {opciones.map((opcion, index) => (
                        <ServiceCard
                            key={index}
                            option={opcion}
                            onPress={handlePress}
                            isSelected={selectedService?.id === opcion.id}
                        />
                    ))}
                </View>
            </ScrollView>

            <PetitionModal
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                    setSelectedService(null);
                }}
                selectedOption={selectedService}
                onSend={handleSend}
                sendButtonText="Send Request"
                isLoading={isLoading}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    cardsContainer: {
        paddingHorizontal: 20,
        gap: 16,
        paddingBottom: 20,
    },
});