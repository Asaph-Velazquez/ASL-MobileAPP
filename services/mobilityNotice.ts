import AsyncStorage from '@react-native-async-storage/async-storage';

const MOBILITY_NOTICE_SEEN_KEY = 'mobility_notice_seen';

export async function hasSeenMobilityNotice() {
  const value = await AsyncStorage.getItem(MOBILITY_NOTICE_SEEN_KEY);
  return value === 'true';
}

export async function markMobilityNoticeSeen() {
  await AsyncStorage.setItem(MOBILITY_NOTICE_SEEN_KEY, 'true');
}

export async function resetMobilityNotice() {
  await AsyncStorage.removeItem(MOBILITY_NOTICE_SEEN_KEY);
}
