import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'guest_onboarding_v1';
export type GuestEntryRoute = '/onboarding' | '/(tabs)';

export async function getGuestEntryRoute(): Promise<GuestEntryRoute> {
  try {
    return await AsyncStorage.getItem(ONBOARDING_KEY) === 'completed' ? '/(tabs)' : '/onboarding';
  } catch {
    // Si no se puede leer la preferencia, las instrucciones siguen disponibles.
    return '/onboarding';
  }
}

export async function completeGuestOnboarding(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, 'completed');
}
