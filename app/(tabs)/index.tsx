import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function HomeScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'muted');

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
          <Text style={[styles.title, { color: textColor }]}>Hotel Aurora Central</Text>
          <Text style={[styles.subtitle, { color: mutedColor }]}>
            Selecciona tu método de comunicación preferido
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
            <View style={styles.cardContent}>
              <View style={[styles.iconContainer, styles.aslIconBg]}>
                <MaterialCommunityIcons name="sign-language" size={40} color="#FFFFFF" />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>Lenguaje de Señas</Text>
                <Text style={styles.cardDescription}>
                  Usa ASL para comunicarte con el personal
                </Text>
              </View>
              <MaterialIcons name="arrow-forward-ios" size={24} color="rgba(255,255,255,0.8)" />
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
                <MaterialIcons name="chat-bubble" size={40} color="#FFFFFF" />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>Texto</Text>
                <Text style={styles.cardDescription}>
                  Escribe tus solicitudes y mensajes
                </Text>
              </View>
              <MaterialIcons name="arrow-forward-ios" size={24} color="rgba(255,255,255,0.8)" />
            </View>
          </Pressable>
        </View>

        {/* Footer informativo */}
        <View style={styles.footer}>
          <MaterialIcons name="info-outline" size={16} color={mutedColor} />
          <Text style={[styles.footerText, { color: mutedColor }]}>
            Podrás cambiar tu preferencia en cualquier momento
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
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  header: {
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  buttons: {
    width: '100%',
    gap: 20,
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    padding: 20,
    minHeight: 120,
    justifyContent: 'center',
  },
  aslCard: {
    backgroundColor: '#3B82F6',
  },
  textCard: {
    backgroundColor: '#8B5CF6',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aslIconBg: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  textIconBg: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardTextContainer: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 20,
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
