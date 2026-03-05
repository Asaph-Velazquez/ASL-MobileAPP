import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Toaster } from 'sonner-native';
import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ThemeProviderWrapper } from '@/components/BothComponents/theme-provider';
import { WebSocketProvider } from '@/components/BothComponents/websocket-provider';
import { AuthProvider, useAuth } from '@/components/BothComponents/auth-provider';
import { CommunicationModeProvider } from '@/components/BothComponents/communication-mode-provider';
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
    if (isLoading) return; // Esperar a que se complete la verificación de autenticación

    const inAuthGroup = segments[0] === 'login';
    const inOnboarding = segments[0] === 'onboarding';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirigir a login si no está autenticado
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup && !inOnboarding) {
      router.replace('/onboarding');
    }
  }, [isAuthenticated, isLoading, segments]);

  // Mostrar pantalla de carga mientras se verifica la autenticación
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
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProviderWrapper>
        <CommunicationModeProvider>
          <AuthProvider>
            <WebSocketProvider>
              <RootLayoutNav />
            </WebSocketProvider>
          </AuthProvider>
        </CommunicationModeProvider>
      </ThemeProviderWrapper>
    </GestureHandlerRootView>
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