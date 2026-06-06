import { ThemedView } from "@/components/BothComponents/themed-view";
import { ServiceCard, ServiceOption } from "@/components/TextComponents/ServiceCard";
import { ScreenHeader } from "@/components/BothComponents/ScreenHeader";
import { InfoModal } from "@/components/TextComponents/InfoModal";
import { useState } from "react";
import { ScrollView, RefreshControl, StyleSheet, View } from "react-native";

export default function TextServices(){
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedService, setSelectedService] = useState<ServiceOption | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    
    const ServiceOptions: ServiceOption[] = [{
            id: "BREAKFAST INCLUDED",
            description: "BREAKFAST CAFETERIA AVAILABLE.",
            icon: "food-bank",
            iconType: "material" as const,
            iconColor: "#FF9800",
            bgColor: "#FFF3E0",
            detalles: {
            horario: "6:00 AM - 11:00 AM",
            ubicacion: "MAIN RESTAURANT, 1ST FLOOR",
            incluye: ["CONTINENTAL BUFFET", "FRESH FRUIT", "COFFEE AND JUICE", "FRESH BREAD"],
            nota: "BOOK 1 DAY BEFORE FOR SPECIAL OPTIONS"
        }
        },{
            id: "POOL",
            description: "POOL OPEN. RELAX, SWIM.",
            icon: "pool",
            iconType: "material" as const,
            iconColor: "#00BCD4",
            bgColor: "#E0F7FA",
            detalles: {
            horario: "7:00 AM - 10:00 PM",
            ubicacion: "TERRACE, 5TH FLOOR",
            incluye: ["TOWELS INCLUDED", "LOUNGE CHAIRS AVAILABLE", "POOL BAR", "CHILDREN AREA"],
            nota: "MAX CAPACITY 50 PEOPLE. RESERVE LOUNGE CHAIRS IN HIGH SEASON"
        }
        },{
            id: "GYM",
            description: "GYM OPEN. YOUR ROUTINE CONTINUE.",
            icon: "fitness-center",
            iconType: "material" as const,
            iconColor: "#F44336",
            bgColor: "#FFEBEE",
            detalles: {
            horario: "24 hours",
            ubicacion: "2ND FLOOR, NEXT TO SPA",
            incluye: ["CARDIO EQUIPMENT", "WEIGHTS AND DUMBBELLS", "TOWELS AND WATER", "TRAINER BY APPOINTMENT"],
            nota: "USE ROOM KEY. BRING ATHLETIC SHOES"
        }
        },
        {
            id: "SPA",
            description: "SPA OPEN. RELAX DAY ENJOY.",
            icon: "spa",
            iconType: "material" as const,
            iconColor: "#9C27B0",
            bgColor: "#F3E5F5",
            detalles: {
            horario: "9:00 AM - 8:00 PM",
            ubicacion: "2ND FLOOR, WEST WING",
            incluye: ["THERAPY MASSAGE", "FACIAL", "SAUNA AND STEAM", "AROMATHERAPY"],
            nota: "BOOK 24 HOURS BEFORE. EXTRA COST SERVICE"
        }
    }];

    const handlePress = (option: ServiceOption) => {
        setSelectedService(option);
        setModalVisible(true);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            // Recargar servicios disponibles
            await new Promise(resolve => setTimeout(resolve, 1000));
        } finally {
            setRefreshing(false);
        }
    };
    
    return(
        <ThemedView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#4A90E2"
                    />
                }
            >
                <ScreenHeader 
                    title="INCLUDED SERVICES"
                    subtitle="TODAY, WHAT YOU WANT SEE?"
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


