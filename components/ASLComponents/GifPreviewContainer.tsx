import { Image, StyleSheet, View } from "react-native";
import { useThemeColor } from '@/hooks/use-theme-color';
import { ASLVideoPreview } from './ASLVideoPreview';

interface GifPreviewContainerProps {
    gifSource: any;
    mediaType?: 'gif' | 'video';
    height?: number;
}

/**
 * Contenedor para mostrar GIF grande en modo ASL
 * Usado en todas las pantallas ASL para preview
 */
export function GifPreviewContainer({ gifSource, mediaType = 'gif', height }: GifPreviewContainerProps) {
    const backgroundColor = useThemeColor({}, 'background');
    const containerSize = height === undefined ? undefined : { height, minHeight: height };
    const mediaSize = height === undefined ? undefined : { height: Math.max(height - 40, 0) };
    // Función helper para manejar tanto URLs como rutas locales
    const getImageSource = (source: any) => {
        if (typeof source === 'string') {
            return { uri: source };
        }
        return source;
    };

    return (
        <View style={[styles.container, { backgroundColor }, containerSize]}>
            {mediaType === 'video' ? (
                <ASLVideoPreview source={gifSource} style={[styles.gif, mediaSize]} />
            ) : (
                <Image
                    source={getImageSource(gifSource)}
                    style={[styles.gif, mediaSize]}
                    resizeMode="contain"
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        marginHorizontal: 20,
        borderRadius: 20,
        padding: 20,
        minHeight: 300,
        justifyContent: 'center',
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
    gif: {
        width: '100%',
        height: 280,
    },
});
