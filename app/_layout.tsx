import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Toaster } from 'sonner-native';

import { ThemeProviderWrapper } from '@/components/theme-provider';
import { WebSocketProvider } from '@/components/websocket-provider';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProviderWrapper>
      <WebSocketProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="Text" options={{ headerShown: false }} />
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
      </WebSocketProvider>
    </ThemeProviderWrapper>
  );
}
