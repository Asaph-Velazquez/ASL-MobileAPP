import { ThemedView } from "@/components/BothComponents/themed-view";
import { ScreenHeader } from "@/components/BothComponents/ScreenHeader";
import { ServiceCard, ServiceOption } from "@/components/TextComponents/ServiceCard";
import { router } from "expo-router";
import { ScrollView, RefreshControl, StyleSheet, View } from "react-native";
import { useState } from "react";

export default function TextHome() {
    const [refreshing, setRefreshing] = useState(false);
    const services: ServiceOption[] = [
        {
            id: "HOTEL SERVICES",
            description: "HOTEL SERVICE AVAILABLE, SEE HERE.",
            icon: "room-service",
            iconType: "material",
            iconColor: "#4A90E2",
            bgColor: "#E3F2FD"
        },
        {
            id: "ROOM SERVICE",
            description: "ROOM SERVICE OPTIONS, SEE HERE.",
            icon: "silverware-fork-knife",
            iconType: "community",
            iconColor: "#9C27B0",
            bgColor: "#F3E5F5"
        },
        {
            id: "PROBLEM",
            description: "YOUR STAY DURING, PROBLEM REPORT.",
            icon: "warning",
            iconType: "material",
            iconColor: "#F44336",
            bgColor: "#FFEBEE"
        },
        {
            id: "MOBILITY",
            description: "VALET, TRANSPORT, SPECIAL TRAVEL HELP REQUEST.",
            icon: "local-taxi",
            iconType: "material",
            iconColor: "#ffe100ff",
            bgColor: "#fffde5ff"
        }
    ];

    const handlePress = (option: ServiceOption) => {
        switch(option.id) {
            case "HOTEL SERVICES":
                router.push('/Text/TextServices');
                break;
            case "ROOM SERVICE":
                router.push('/Text/TextRoomS');
                break;
            case "PROBLEM":
                router.push('/Text/TextReportProblem');
                break;
            case "MOBILITY":
                router.push('/Text/TextMovilidad');
                break;
        }
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
                    title="CANADA CENTRAL HOTEL"
                    subtitle="TODAY, YOU NEED WHAT?"
                />
                
                <View style={styles.cardsContainer}>
                    {services.map((service, index) => (
                        <ServiceCard 
                            key={index} 
                            option={service}
                            onPress={handlePress}
                        />
                    ))}
                </View>
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
