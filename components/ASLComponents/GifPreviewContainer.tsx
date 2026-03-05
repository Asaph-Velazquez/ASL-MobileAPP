import { Image, StyleSheet, View } from "react-native";

interface GifPreviewContainerProps {
    gifSource: any;
}

/**
 * Contenedor para mostrar GIF grande en modo ASL
 * Usado en todas las pantallas ASL para preview
 */
export function GifPreviewContainer({ gifSource }: GifPreviewContainerProps) {
    // Función helper para manejar tanto URLs como rutas locales
    const getImageSource = (source: any) => {
        if (typeof source === 'string') {
            return { uri: source };
        }
        return source;
    };

    return (
        <View style={styles.container}>
            <Image 
                source={getImageSource(gifSource)}
                style={styles.gif}
                resizeMode="contain"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        marginHorizontal: 20,
        backgroundColor: '#f5f5f5',
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
