import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Toaster } from 'sonner-native';
import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

import { ThemeProviderWrapper } from '@/components/theme-provider';
import { WebSocketProvider } from '@/components/websocket-provider';
import { AuthProvider, useAuth } from '@/components/auth-provider';
import { CommunicationModeProvider } from '@/components/communication-mode-provider';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Wait for auth check to complete

    const inAuthGroup = segments[0] === 'login';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to home if already authenticated
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="Text" options={{ headerShown: false }} />
        <Stack.Screen name="ASL" options={{ headerShown: false }} />
        <Stack.Screen name="TextHome" options={{ title: 'Text Home' , headerShown: true }} />
        <Stack.Screen name="TextRoomS" options={{ title: 'Text Room Services' , headerShown: true }} />
        <Stack.Screen name="TextServices" options={{ title: 'Text Hotel Services' , headerShown: true }} />
      </Stack>
      <StatusBar style="auto" />
      <Toaster
        position="top-center"
        duration={4000}
        visibleToasts={3}
        theme={colorScheme === 'dark' ? 'dark' : 'light'}
        richColors
      />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProviderWrapper>
      <CommunicationModeProvider>
        <AuthProvider>
          <WebSocketProvider>
            <RootLayoutNav />
          </WebSocketProvider>
        </AuthProvider>
      </CommunicationModeProvider>
    </ThemeProviderWrapper>
  );
}


const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    gap: 16,
  },
  loadingText: {
    fontSize: 18,
    color: '#333333',
    fontWeight: '600',
  },
});