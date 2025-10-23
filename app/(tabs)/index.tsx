import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';

export default function HomeScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const colors = {
    background: isDark ? '#0E1116' : '#FFFFFF',
    title: isDark ? '#E6E6E6' : '#1A1A1A',
    cardShadow: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.15)',
  } as const;

  return (
      <View style={styles.inner}>
        <Text style={[styles.title, { color: colors.title }]}>Hotel Aurora Central</Text>

        <View style={styles.buttons}>
          <Pressable
            onPress={() => router.push('/ASL/ASLHome')}
            style={({ pressed }) => [
              styles.button,
              styles.shadow,
              { backgroundColor: '#1E66F5', opacity: pressed ? 0.9 : 1, shadowColor: colors.cardShadow },
            ]}
            android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
          >
            <Text style={styles.emoji} accessibilityLabel="Mano">🖐️</Text>
          </Pressable>

          <Pressable
            onPress={() =>
              router.push('/Text/TextHome')
            }
            style={({ pressed }) => [
              styles.button,
              styles.shadow,
              { backgroundColor: '#8B46FF', opacity: pressed ? 0.92 : 1, shadowColor: colors.cardShadow },
            ]}
            android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
          >
            <Text style={styles.buttonText}>Text</Text>
          </Pressable>
        </View>
      </View>
  );
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
