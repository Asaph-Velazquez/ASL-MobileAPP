import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View, Image } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedView } from '@/components/BothComponents/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/components/BothComponents/auth-provider';
export default function HomeScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'muted');
  const { guestName, roomNumber } = useAuth();
  const [selectedGif, setSelectedGif] = useState<any>(require('../../assets/gifs/ModASL.gif'));

  // Función helper para manejar tanto URLs como rutas locales
  const getImageSource = (source: any) => {
    if (typeof source === 'string') {
      return { uri: source };
    }
    return source;
  };

  const colors = {
    background: isDark ? '#0E1116' : '#F5F5F5',
    cardShadow: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.15)',
  } as const;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.inner}>
        {/* Header con icono del hotel */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <MaterialIcons name="hotel" size={48} color="#4A90E2" />
          </View>
          <Text style={[styles.title, { color: textColor }]}>Aurora Central Hotel</Text>
          <Text style={[styles.subtitle, { color: mutedColor }]}>
            Welcome, {guestName} - Room {roomNumber}
          </Text>
        </View>

        {/* Botones de selección */}
        <View style={styles.buttons}>
          {/* Botón ASL */}
          <Pressable
            onPress={() => router.push('/ASL/ASLHome')}
            style={({ pressed }) => [
              styles.card,
              styles.aslCard,
              { 
                opacity: pressed ? 0.9 : 1, 
                transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }]
              }
            ]}
            android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
          >
            <View style={styles.cardContentLarge}>
              {/* GIF de ASL */}
              <Image 
                source={getImageSource(require('../../assets/gifs/ModASL.gif'))}
                style={styles.gifImage}
                resizeMode="contain"
              />
              <View style={styles.iconBadge}>
                <MaterialCommunityIcons name="sign-language" size={32} color="#FFFFFF" />
              </View>
            </View>
          </Pressable>

          {/* Botón Text */}
          <Pressable
            onPress={() => router.push('/Text/TextHome')}
            style={({ pressed }) => [
              styles.card,
              styles.textCard,
              { 
                opacity: pressed ? 0.9 : 1,
                transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }]
              }
            ]}
            android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
          >
            <View style={styles.cardContent}>
              <View style={[styles.iconContainer, styles.textIconBg]}>
                <MaterialIcons name="chat-bubble" size={32} color="#FFFFFF" />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>Text Mode</Text>
                <Text style={styles.cardDescription}>
                  Write your requests and messages to communicate with staff
                </Text>
              </View>
              <MaterialIcons name="arrow-forward-ios" size={20} color="rgba(255,255,255,0.8)" />
            </View>
          </Pressable>
        </View>

        {/* Footer informativo */}
        <View style={styles.footer}>
          <MaterialIcons name="info-outline" size={16} color={mutedColor} />
          <Text style={[styles.footerText, { color: mutedColor }]}>
            You can change your preference at any time
          </Text>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  buttons: {
    width: '100%',
    gap: 20,
    flex: 1,
    justifyContent: 'center',
    maxHeight: 400,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aslCard: {
    backgroundColor: '#3B82F6',
    flex: 2,
  },
  textCard: {
    backgroundColor: '#8B5CF6',
    flex: 1,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    width: '100%',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textIconBg: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardTextContainer: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  cardDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 16,
  },
  cardContentLarge: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  gifImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  iconBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    maxWidth: 320,
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});