import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function TextHome(){
    const opciones = [
        {
            id: "Servicios",
            desciption : "Explora los servicios que ofrecemos en nuestro hotel.",
            icon: "room-service",
            iconType: "material" as const,
            iconColor: "#4A90E2",
            bgColor: "#E3F2FD"
        },
        {
            id: "Room Service",
            desciption : "Revisa que opciones de room service tenemos disponibles.",
            icon: "silverware-fork-knife",
            iconType: "community" as const,
            iconColor: "#9C27B0",
            bgColor: "#F3E5F5"
        },
        {
            id: "Problema",
            desciption : "Informa sobre cualquier problema que puedas tener durante tu estancia.",
            icon: "warning",
            iconType: "material" as const,
            iconColor: "#F44336",
            bgColor: "#FFEBEE"
        },
        {
            id: "Servicios Extra",
            desciption : "Solicita servicios adicionales para mejorar tu estancia.",
            icon: "add-circle",
            iconType: "material" as const,
            iconColor: "#00BFA5",
            bgColor: "#E0F2F1"
        }
    ]

    const handlePress = (opcionId: string) => {
        console.log(`Opción seleccionada: ${opcionId}`);
        // Aquí puedes agregar la navegación o lógica que necesites
    };

    return(
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Hotel Aurora Central</Text>
                <Text style={styles.subtitle}>¿Qué necesitas hoy?</Text>
            </View>
            
            <View style={styles.cardsContainer}>
                {opciones.map((opcion, index) => (
                    <TouchableOpacity 
                        key={index}
                        style={styles.card}
                        onPress={() => handlePress(opcion.id)}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: opcion.bgColor }]}>
                            {opcion.iconType === "material" ? (
                                <MaterialIcons 
                                    name={opcion.icon as any} 
                                    size={32} 
                                    color={opcion.iconColor} 
                                />
                            ) : (
                                <MaterialCommunityIcons 
                                    name={opcion.icon as any} 
                                    size={32} 
                                    color={opcion.iconColor} 
                                />
                            )}
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.cardTitle}>{opcion.id}</Text>
                            <Text style={styles.cardDescription}>{opcion.desciption}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E1E1E',
    },
    header: {
        paddingTop: 40,
        paddingHorizontal: 24,
        paddingBottom: 30,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: '#B0B0B0',
        textAlign: 'center',
    },
    cardsContainer: {
        paddingHorizontal: 20,
        gap: 16,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1E1E1E',
        marginBottom: 4,
    },
    cardDescription: {
        fontSize: 14,
        color: '#757575',
        lineHeight: 20,
    },
});