const test = require('node:test');
const assert = require('node:assert/strict');
const { load, hooks, jsx, native, find, nodes, flush } = require('./helpers/render.cjs');

function onboardingStorage(storage = new Map(), fail = () => false) {
  return load('services/onboarding.ts', {
    '@react-native-async-storage/async-storage': { default: {
      getItem: async key => storage.get(key) ?? null,
      setItem: async (key, value) => { if (fail()) throw Error('storage unavailable'); storage.set(key, value); },
    } },
  });
}

function onboardingScreen(service) {
  const h = hooks(), routes = [];
  const { default: Screen } = load('app/onboarding.tsx', {
    react: h.react, 'react/jsx-runtime': jsx,
    'react-native': { ...native, useWindowDimensions: () => ({ width: 390, height: 780 }) },
    'react-native-safe-area-context': { useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) },
    '@expo/vector-icons': { MaterialIcons: 'MaterialIcons' },
    'expo-router': { router: { replace: route => routes.push(route) } },
    '@/components/BothComponents/auth-provider': { useAuth: () => ({ roomNumber: '10', isOffline: false }) },
    '@/hooks/use-theme-color': { useThemeColor: () => '#111' },
    '@/components/BothComponents/themed-view': { ThemedView: 'ThemedView' },
    '@/components/ASLComponents/ASLVideoPreview': { ASLVideoPreview: 'ASLVideoPreview' },
    '@/services/onboarding': service,
  });
  return { routes, render() { h.reset(); return Screen(); } };
}

function loginScreen(service) {
  const h = hooks(), routes = [], sessions = [];
  const { default: Screen } = load('app/login.tsx', {
    react: h.react, 'react/jsx-runtime': jsx,
    'react-native': { ...native, AppState: { addEventListener: () => ({ remove() {} }) }, Linking: {} },
    'expo-camera': { CameraView: 'CameraView', useCameraPermissions: () => [{ granted: true }, async () => ({ granted: true }), async () => ({ granted: true })] },
    '@expo/vector-icons': { MaterialIcons: 'MaterialIcons' },
    'expo-router': { router: { replace: route => routes.push(route) } },
    '@/components/BothComponents/auth-provider': { useAuth: () => ({ login: async (...args) => sessions.push(args) }) },
    '@/services/auth': { validateToken: async () => ({ valid: true, roomNumber: '10', expiresAt: '2099-01-01' }) },
    '@/services/consent': { hasPrivacyConsent: async () => true, recordPrivacyConsent: async () => {} },
    '@/services/onboarding': service,
    '@/constants/network': { API_BASE_URL: 'http://localhost:8080' },
    '@/components/BothComponents/TermsConsentModal': { TermsConsentModal: 'PolicyDocument' },
  });
  return { routes, sessions, render() { h.reset(); const tree = Screen(); h.effects(); return tree; } };
}

test('CPM_MOV_058: first QR login shows onboarding; SKIP persists before navigation and re-entry skips it', async () => {
  const storage = new Map(), service = onboardingStorage(storage);
  const first = loginScreen(service); first.render(); await flush();
  await nodes(first.render(), n => n.type === 'CameraView')[0].props.onBarcodeScanned({ data: 'same-qr' });
  assert.deepEqual(first.routes, ['/onboarding']);
  assert.equal(first.sessions[0][2], '10');
  const welcome = onboardingScreen(service);
  assert.match(JSON.stringify(welcome.render()), /ROOM .*10/);
  await find(welcome.render(), 'onboarding-skip').props.onPress();
  assert.deepEqual(welcome.routes, ['/(tabs)']);
  assert.equal(await onboardingStorage(storage).getGuestEntryRoute(), '/(tabs)');
  const second = loginScreen(onboardingStorage(storage)); second.render(); await flush();
  await nodes(second.render(), n => n.type === 'CameraView')[0].props.onBarcodeScanned({ data: 'same-qr' });
  assert.deepEqual(second.routes, ['/(tabs)']);
  assert.equal(second.sessions[0][2], '10');
});

test('CPM_MOV_058: START NOW also persists completion after all instructions', async () => {
  const service = onboardingStorage(), welcome = onboardingScreen(service);
  for (let i = 0; i < 3; i++) await find(welcome.render(), 'onboarding-next').props.onPress();
  assert.equal(find(welcome.render(), 'onboarding-skip'), undefined);
  assert.equal(await service.getGuestEntryRoute(), '/onboarding');
  await find(welcome.render(), 'onboarding-next').props.onPress();
  assert.equal(await service.getGuestEntryRoute(), '/(tabs)');
  assert.deepEqual(welcome.routes, ['/(tabs)']);
});

test('CPM_MOV_058: failed persistence stays on the instructions and allows retry', async () => {
  let fail = true;
  const service = onboardingStorage(new Map(), () => fail), welcome = onboardingScreen(service);
  await find(welcome.render(), 'onboarding-skip').props.onPress();
  assert.deepEqual(welcome.routes, []);
  assert.match(JSON.stringify(welcome.render()), /WELCOME SAVE FAILED/);
  assert.equal(await service.getGuestEntryRoute(), '/onboarding');
  fail = false;
  await find(welcome.render(), 'onboarding-skip').props.onPress();
  assert.deepEqual(welcome.routes, ['/(tabs)']);
});

test('CPM_MOV_058: the authenticated layout uses persisted completion instead of forcing onboarding', async () => {
  const h = hooks(), routes = [], service = onboardingStorage();
  await service.completeGuestOnboarding();
  const { default: Layout } = load('app/_layout.tsx', {
    react: h.react, 'react/jsx-runtime': jsx,
    '@react-navigation/native': { DarkTheme: {}, DefaultTheme: {}, ThemeProvider: 'NavigationTheme' },
    'expo-router': { Stack: 'Stack', useRouter: () => ({ replace: route => routes.push(route) }), useSegments: () => ['login'] },
    'expo-status-bar': { StatusBar: 'StatusBar' }, 'react-native-reanimated': {},
    'sonner-native': { Toaster: 'Toaster' }, 'react-native': native,
    'react-native-gesture-handler': { GestureHandlerRootView: 'GestureRoot' },
    '@/hooks/use-theme-color': { useThemeColor: () => '#111' },
    '@/components/BothComponents/theme-provider': { ThemeProviderWrapper: 'ThemeProvider', useTheme: () => ({ scheme: 'light' }) },
    '@/components/BothComponents/websocket-provider': { WebSocketProvider: 'WebSocketProvider' },
    '@/components/BothComponents/auth-provider': { AuthProvider: 'AuthProvider', useAuth: () => ({ isAuthenticated: true, isLoading: false }) },
    '@/components/BothComponents/communication-mode-provider': { CommunicationModeProvider: 'CommunicationProvider' },
    '@/hooks/use-color-scheme': { useColorScheme: () => 'light' },
    '@/services/onboarding': service,
  });
  const nav = nodes(Layout(), n => typeof n.type === 'function' && n.type.name === 'RootLayoutNav')[0];
  nav.type(); h.effects(); await flush();
  assert.deepEqual(routes, ['/(tabs)']);
});
