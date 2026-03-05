import { ThemedView } from "@/components/BothComponents/themed-view";
import { ServiceCard, ServiceOption } from "@/components/TextComponents/ServiceCard";
import { ScreenHeader } from "@/components/BothComponents/ScreenHeader";
import { InfoModal } from "@/components/TextComponents/InfoModal";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

export default function TextServices(){
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedService, setSelectedService] = useState<ServiceOption | null>(null);
    
    const ServiceOptions: ServiceOption[] = [{
            id: "Breakfast included",
            description: "Enjoy a delicious breakfast at our cafeteria.",
            icon: "food-bank",
            iconType: "material" as const,
            iconColor: "#FF9800",
            bgColor: "#FFF3E0",
            detalles: {
            horario: "6:00 AM - 11:00 AM",
            ubicacion: "Main restaurant, 1st floor",
            incluye: ["Continental buffet", "Fresh fruits", "Coffee and juices", "Freshly baked bread"],
            nota: "Book 1 day in advance for special options"
        }
        },{
            id: "Pool",
            description: "Enjoy a refreshing experience at our pool.",
            icon: "pool",
            iconType: "material" as const,
            iconColor: "#00BCD4",
            bgColor: "#E0F7FA",
            detalles: {
            horario: "7:00 AM - 10:00 PM",
            ubicacion: "Terrace, 5th floor",
            incluye: ["Towels included", "Lounge chairs available", "Pool bar", "Children's area"],
            nota: "Maximum capacity: 50 people. Recommended to reserve lounge chairs during high season"
        }
        },{
            id: "Gym",
            description: "Don't let your routine slip.",
            icon: "fitness-center",
            iconType: "material" as const,
            iconColor: "#F44336",
            bgColor: "#FFEBEE",
            detalles: {
            horario: "24 hours",
            ubicacion: "2nd floor, next to spa",
            incluye: ["Cardio equipment", "Weights and dumbbells", "Towels and water", "Trainer available by appointment"],
            nota: "Access with room key. Recommended to bring athletic shoes"
        }
        },
        {
            id: "Spa",
            description: "Enjoy a relaxing spa day.",
            icon: "spa",
            iconType: "material" as const,
            iconColor: "#9C27B0",
            bgColor: "#F3E5F5",
            detalles: {
            horario: "9:00 AM - 8:00 PM",
            ubicacion: "2nd floor, west wing",
            incluye: ["Therapeutic massages", "Facials", "Sauna and steam", "Aromatherapy"],
            nota: "Book 24 hours in advance. Services with additional cost"
        }
    }];

    const handlePress = (option: ServiceOption) => {
        setSelectedService(option);
        setModalVisible(true);
    };
    
    return(
        <ThemedView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <ScreenHeader 
                    title="Included Services"
                    subtitle="What do you need today?"
                />
                
                <View style={styles.cardsContainer}>
                    {ServiceOptions.map((opcion, index) => (
                        <ServiceCard
                            key={index}
                            option={opcion}
                            onPress={handlePress}
                        />
                    ))}
                </View>
            </ScrollView>

            <InfoModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                selectedOption={selectedService}
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


