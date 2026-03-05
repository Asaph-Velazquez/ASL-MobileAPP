import { ThemedView } from "@/components/BothComponents/themed-view";
import { ScreenHeader } from "@/components/BothComponents/ScreenHeader";
import { ServiceCard, ServiceOption } from "@/components/TextComponents/ServiceCard";
import { router } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

export default function TextHome() {
    const services: ServiceOption[] = [
        {
            id: "Services",
            description: "Explore the services we offer at our hotel.",
            icon: "room-service",
            iconType: "material",
            iconColor: "#4A90E2",
            bgColor: "#E3F2FD"
        },
        {
            id: "Room Service",
            description: "Check our available room service options.",
            icon: "silverware-fork-knife",
            iconType: "community",
            iconColor: "#9C27B0",
            bgColor: "#F3E5F5"
        },
        {
            id: "Problem",
            description: "Report any issues you may have during your stay.",
            icon: "warning",
            iconType: "material",
            iconColor: "#F44336",
            bgColor: "#FFEBEE"
        },
        {
            id: "Mobility",
            description: "Request valet parking, private transport or special services.",
            icon: "local-taxi",
            iconType: "material",
            iconColor: "#ffe100ff",
            bgColor: "#fffde5ff"
        }
    ];

    const handlePress = (option: ServiceOption) => {
        switch(option.id) {
            case "Services":
                router.push('/Text/TextServices');
                break;
            case "Room Service":
                router.push('/Text/TextRoomS');
                break;
            case "Problem":
                router.push('/Text/TextReportProblem');
                break;
            case "Mobility":
                router.push('/Text/TextMovilidad');
                break;
        }
    };

    return (
        <ScrollView>
            <ThemedView style={styles.container}>
                <ScreenHeader 
                    title="Aurora Central Hotel"
                    subtitle="What do you need today?"
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