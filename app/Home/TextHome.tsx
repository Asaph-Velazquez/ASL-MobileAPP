import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function TextHome(){
    const opciones = [
        {
            id: "Servicios",
            desciption : "Servicios disponibles en el hotel",
            icon: "room-service" 
        },
        {
            id: "Room Services",
            desciption : "Servicios de habitacion disponibles",
            icon: "fork-spoon"   
        },
        {
            id: "Problema",
            desciption : "Reportar un problema",
            icon: "report"
        },
        {
            id: "servicios extra",
            desciption : "Solicitar servicios extra",
            icon: "add-circle"
        }
    ]

    return(
        <ThemedView>
            <ThemedText>
                {
                    opciones.map((opcion, index) => (
                        <ThemedText key={index}>{opcion.id}: {opcion.desciption} {"\n"}</ThemedText>
                    ))
                };
            </ThemedText>
        </ThemedView>
    )
}