import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/network';

export const POLICY_VERSION = '2026-10-26';
const INSTALLATION_KEY = 'privacy_installation_id';
const ACCEPTANCE_KEY = 'privacy_acceptance';
export type CameraConsentStatus = 'requested' | 'granted' | 'denied';

export async function hasPrivacyConsent(): Promise<boolean> {
  const saved = await AsyncStorage.getItem(ACCEPTANCE_KEY);
  if (!saved) return false;
  try {
    const acceptance = JSON.parse(saved);
    return acceptance.policyVersion === POLICY_VERSION && acceptance.accepted === true;
  } catch { return false; }
}

export async function recordPrivacyConsent(cameraPermission: CameraConsentStatus): Promise<void> {
  let installationId = await AsyncStorage.getItem(INSTALLATION_KEY);
  if (!installationId) {
    // Identificador seudónimo de instalación; no identifica el hardware ni autoriza sesiones.
    installationId = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    await AsyncStorage.setItem(INSTALLATION_KEY, installationId);
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`${API_BASE_URL}/api/consents`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
      body: JSON.stringify({ installationId, policyVersion: POLICY_VERSION,
        privacyAccepted: true, cameraAccepted: true, cameraPermission }),
    });
    if (response.status === 404 || response.status === 405) {
      throw new Error('CONSENT SERVICE NOT AVAILABLE. HOTEL SERVER UPDATE REQUIRED. CONTACT RECEPTION.');
    }
    if (!response.ok) throw new Error('CONSENT SAVE FAILED. CHECK CONNECTION AND TRY AGAIN.');
    const receipt = await response.json();
    if (receipt.accepted !== true || receipt.policyVersion !== POLICY_VERSION) {
      throw new Error('CONSENT SAVE FAILED. TRY AGAIN.');
    }
    await AsyncStorage.setItem(ACCEPTANCE_KEY, JSON.stringify({ accepted: true, policyVersion: POLICY_VERSION }));
  } finally { clearTimeout(timeout); }
}
