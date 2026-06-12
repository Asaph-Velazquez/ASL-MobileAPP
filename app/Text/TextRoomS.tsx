import { ThemedView } from "@/components/BothComponents/themed-view";
import { ServiceCard, ServiceOption } from "@/components/TextComponents/ServiceCard";
import { ScreenHeader } from "@/components/BothComponents/ScreenHeader";
import { PetitionModal } from "@/components/TextComponents/PetitionModal";
import { usePetitionSender } from "@/hooks/usePetitionSender";
import { useState } from 'react';
import { ScrollView, RefreshControl, StyleSheet, View } from "react-native";

export default function TextRoomS(){
    const [selectedService, setSelectedService] = useState<ServiceOption | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const { sendPetition, isLoading } = usePetitionSender();

    const opciones: ServiceOption[] = [
        {
            id: "FOOD",
            description: "FOOD ORDER, BRING ROOM.",
            icon: "flatware",
            iconType: "material" as const,
            iconColor: "#FF6B6B",
            bgColor: "#FFE5E5",
            placeholder: "EX: WANT DINNER 2 PEOPLE 8:00 PM."
        },
        {
            id: "AMENITIES",
            description: "TOWEL, SOAP, OTHER ITEM.",
            icon: "sanitizer",
            iconType: "material" as const,
            iconColor: "#4ECDC4",
            bgColor: "#E0F7F5",
            placeholder: "EX: NEED EXTRA TOWELS AND SOAP."
        },
        {
            id: "LINENS",
            description: "CLEAN SHEET, TOWEL, PILLOWCASE.",
            icon: "bed",
            iconType: "material" as const,
            iconColor: "#95E1D3",
            bgColor: "#E8F8F5",
            placeholder: "EX: NEED CLEAN SHEETS AND TOWELS."
        },
        {
            id: "COMFORT ITEMS",
            description: "EXTRA PILLOW, BLANKET.",
            icon: "self-improvement",
            iconType: "material" as const,
            iconColor: "#A29BFE",
            bgColor: "#F0EFFF",
            placeholder: "EX: NEED EXTRA PILLOW AND BLANKET."
        },
        {
            id: "EXTRA",
            description: "OTHER SERVICE. RECEPTION HELP. POSSIBLE EXTRA COST.",
            icon: "question-mark",
            iconType: "material" as const,
            iconColor: "#FDCB6E",
            bgColor: "#FFF6E0",
            placeholder: "EX: NEED OTHER SERVICE. PLEASE DESCRIBE."
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

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            // Recargar servicios de habitación
            await new Promise(resolve => setTimeout(resolve, 1000));
        } finally {
            setRefreshing(false);
        }
    };

    return(
        <ThemedView style={styles.container}>
            <ScrollView
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#4A90E2"
                    />
                }
            >
                <ScreenHeader 
                    title="ROOM SERVICE"
                    subtitle="TODAY, YOU NEED WHAT?"
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
                sendButtonText="SEND REQUEST"
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
