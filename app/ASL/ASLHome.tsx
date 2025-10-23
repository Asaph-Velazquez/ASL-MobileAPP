import { ThemedView } from "@/components/themed-view";
import { StyleSheet } from "react-native";

export default function ASLHome(){
    const opciones = [{
        id: "ASL Services",
        desciption : "Explore the services we offer at our hotel.",
        icon: "room-service",
        iconType: "material" as const,
        iconColor: "#E3F2FD",
        bgColor: "white"   
    },
    {
        id: "Room Service",
        desciption : "Explore the room services we offer at our hotel.",
        icon: "silverware-fork-knife",
        iconType: "material" as const,
        iconColor: "#4A90E2",
        bgColor: "#E3F2FD"   
    }    
]
    return(
        <ThemedView style={styles.container}>
            View
        </ThemedView>
    )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  buttons: {
    width: '100%',
    gap: 16,
  },
  button: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  shadow: {
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emoji: {
    fontSize: 18,
  },
});
