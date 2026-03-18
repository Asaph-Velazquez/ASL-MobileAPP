import { ThemedView } from "@/components/BothComponents/themed-view";
import { commonStyles } from '@/styles/common';
import { router } from "expo-router";
import { ScrollView } from "react-native";
import { useState } from "react";
import { GifPreviewContainer } from "@/components/ASLComponents/GifPreviewContainer";
import { ASLGridView, ASLOption } from "@/components/ASLComponents/ASLGridView";

export default function ASLHome(){
    const [selectedGif, setSelectedGif] = useState<any>(require('../../assets/gifs/ComidaGif.gif'));
    
    const defaultGif = require('../../assets/gifs/ComidaGif.gif');
    
    const opciones: ASLOption[] = [
        {
            id: "Servicios",
            gifSource: require('../../assets/gifs/ComidaGif.gif'),
            icon: "room-service",
            iconType: "material",
            iconColor: "#4A90E2",
            bgColor: "#E3F2FD"
        },
        {
            id: "Room Service",
            gifSource: require('../../assets/gifs/ComidaGif.gif'),
            icon: "silverware-fork-knife",
            iconType: "community",
            iconColor: "#9C27B0",
            bgColor: "#F3E5F5"
        },
        {
            id: "Problema",
            gifSource: require('../../assets/gifs/ComidaGif.gif'),
            icon: "warning",
            iconType: "material",
            iconColor: "#F44336",
            bgColor: "#FFEBEE"
        },
        {
            id: "Movilidad",
            gifSource: require('../../assets/gifs/ComidaGif.gif'),
            icon: "local-taxi",
            iconType: "material",
            iconColor: "#ffe100ff",
            bgColor: "#fffde5ff"
        }
    ]

    const handlePress = (opcion: ASLOption) => {
        switch(opcion.id) {
            case "Servicios":
                router.push('/ASL/ASLServices');
                break;
            case "Room Service":
                router.push('/ASL/ASLRoomS');
                break;
            case "Problema":
                router.push('/ASL/ASLReportProblem');
                break;
            case "Movilidad":
                router.push('/ASL/ASLMovilidad');
                break;
        }
    };

    return(
        <ScrollView>
        <ThemedView style={commonStyles.container}>
            <GifPreviewContainer gifSource={selectedGif} />
            
            <ASLGridView 
                options={opciones}
                onOptionPress={handlePress}
                onPreviewChange={setSelectedGif}
                defaultGif={defaultGif}
            />
        </ThemedView>
        </ScrollView>
    )
}
