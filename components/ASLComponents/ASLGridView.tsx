import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export interface ASLOption {
    id: string;
    gifSource: any;
    icon: string;
    iconType: 'material' | 'community';
    iconColor: string;
    bgColor: string; // Se mantiene para compatibilidad pero se usa como borderColor
    cameraText?: string;
}

interface ASLGridViewProps {
    options: ASLOption[];
    onOptionPress: (option: ASLOption) => void;
    onPreviewChange: (gifSource: any) => void;
    defaultGif: any;
}

/**
 * Cuadrícula de opciones para modo ASL
 * Muestra preview del GIF al mantener presionado
 */
export function ASLGridView({ 
    options, 
    onOptionPress, 
    onPreviewChange,
    defaultGif 
}: ASLGridViewProps) {
    const cardBg = useThemeColor({}, 'card');
    const backgroundColor = useThemeColor({}, 'background');

    return (
        <View style={styles.gridContainer}>
            {options.map((option, index) => (
                <TouchableOpacity 
                    key={index}
                    style={[styles.gridItem, { backgroundColor: cardBg }]}
                    onPressIn={() => onPreviewChange(option.gifSource)}
                    onPressOut={() => onPreviewChange(defaultGif)}
                    onPress={() => onOptionPress(option)}
                    activeOpacity={0.7}
                >
                    <View style={[
                        styles.iconContainer, 
                        { 
                            backgroundColor,
                            borderColor: option.iconColor,
                            borderWidth: 2
                        }
                    ]}>
                        {option.iconType === "material" ? (
                            <MaterialIcons 
                                name={option.icon as any} 
                                size={40} 
                                color={option.iconColor} 
                            />
                        ) : (
                            <MaterialCommunityIcons 
                                name={option.icon as any} 
                                size={40} 
                                color={option.iconColor} 
                            />
                        )}
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
        gap: 16,
        justifyContent: 'space-between',
    },
    gridItem: {
        width: '47%',
        aspectRatio: 1,
        borderRadius: 16,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
