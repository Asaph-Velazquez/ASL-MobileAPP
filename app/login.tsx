import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Pressable, AppState, Linking } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/components/BothComponents/auth-provider';
import { validateToken } from '@/services/auth';
import { TermsConsentModal } from '@/components/BothComponents/TermsConsentModal';
import { API_BASE_URL } from '@/constants/network';
import { hasPrivacyConsent, recordPrivacyConsent } from '@/services/consent';

type FlowState = 'camera' | 'validating' | 'error';

export default function LoginScreen() {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [consentLoading, setConsentLoading] = useState(true);
  const [policyVisible, setPolicyVisible] = useState(false);
  const [policyChecked, setPolicyChecked] = useState(false);
  const [consentError, setConsentError] = useState('');
  const [savingConsent, setSavingConsent] = useState(false);
  const consentBusy = useRef(false);
  const [permission, requestPermission, getPermission] = useCameraPermissions();
  const [flowState, setFlowState] = useState<FlowState>('camera');
  const [scanned, setScanned] = useState(false);
  const [roomNumber, setRoomNumber] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  useEffect(() => {
    let active = true;
    hasPrivacyConsent().then(accepted => { if (active) setTermsAccepted(accepted); })
      .catch(() => { if (active) setConsentError('CONSENT CHECK FAILED. TRY AGAIN.'); })
      .finally(() => { if (active) setConsentLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!termsAccepted) return;
    const subscription = AppState.addEventListener('change', state => {
      if (state !== 'active') return;
      getPermission().then(result => recordPrivacyConsent(result.granted ? 'granted' : 'denied'))
        .catch(() => setConsentError('CAMERA PERMISSION CHECK FAILED. CHECK CONNECTION AND TRY AGAIN.'));
    });
    return () => subscription.remove();
  }, [termsAccepted, getPermission]);

  const handleAllow = async () => {
    if (!policyChecked || consentBusy.current) return;
    consentBusy.current = true;
    setSavingConsent(true);
    setConsentError('');
    try {
      // El permiso nativo y el registro empiezan con la misma acción explícita.
      const [camera] = await Promise.all([requestPermission(), recordPrivacyConsent('requested')]);
      await recordPrivacyConsent(camera.granted ? 'granted' : 'denied');
      setTermsAccepted(true);
    } catch {
      setConsentError('CONSENT SAVE FAILED. CHECK CONNECTION AND TRY AGAIN.');
    } finally {
      consentBusy.current = false;
      setSavingConsent(false);
    }
  };

  // Manejador para escaneo de código de barras
  const handleBarcodeScan = async ({ data }: { data: string }) => {
    if (!termsAccepted || scanned) return;
    
    setScanned(true);
    setFlowState('validating');
    
    try {
      const result = await validateToken(data);
      
      if (result.valid) {
        // Iniciar sesión con expiresAt del servidor
        await login(
          data, 
          'Guest', 
          result.roomNumber || '',
          result.expiresAt
        );
        
        // Pequeño delay para asegurar que el estado de autenticación se estabilice
        setTimeout(() => {
          // Redirigir al onboarding
          router.replace('/onboarding');
        }, 100);
      } else {
        setError(result.isNetworkError
          ? 'SERVER CONNECTION FAILED. CHECK WI-FI.'
          : result.status && result.status >= 500
            ? 'SERVER UNAVAILABLE. TRY AGAIN.'
            : 'INVALID ROOM QR CODE. SCAN AGAIN.');
        setFlowState('error');
      }
    } catch (err) {
      setError('QR CODE VALIDATION FAILED.');
      setFlowState('error');
    }
  };

  // Reiniciar para escanear de nuevo
  const handleScanAgain = () => {
    setScanned(false);
    setFlowState('camera');
    setError('');
    setToken('');
    setRoomNumber('');
  };

  if (consentLoading) return <View style={styles.container}><ActivityIndicator size="large" /></View>;

  // El escáner se habilita solo después del consentimiento confirmado por el servidor.
  if (!termsAccepted) {
    return <View style={styles.container} testID="privacy-gate">
      <MaterialIcons name="policy" size={64} color="#93C5FD" />
      <Text style={styles.title}>CAMERA ACCESS AND PRIVACY</Text>
      <Text style={styles.subtitle}>ALLOW PRESS: PRIVACY POLICY ACCEPT, CAMERA USE ACCEPT. ROOM QR SCAN CAMERA NEED.</Text>
      <Pressable accessibilityRole="link" onPress={() => setPolicyVisible(true)} testID="privacy-policy">
        <Text style={styles.policyLink}>Privacy Policy</Text>
      </Pressable>
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: policyChecked }}
        onPress={() => setPolicyChecked(value => !value)} testID="privacy-checkbox" disabled={savingConsent}>
        <Text style={styles.policyLink}>{policyChecked ? '☑' : '☐'} I accept the terms, Privacy Policy and camera use.</Text>
      </Pressable>
      {consentError ? <Text style={styles.subtitle} accessibilityRole="alert">{consentError}</Text> : null}
      <TouchableOpacity style={[styles.button, { opacity: policyChecked && !savingConsent ? 1 : 0.45 }]}
        disabled={!policyChecked || savingConsent} onPress={handleAllow} testID="privacy-allow">
        <Text style={styles.buttonText}>{savingConsent ? 'SAVING...' : 'ALLOW'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} disabled={savingConsent} testID="privacy-reject" onPress={() => {
        if (consentBusy.current) return;
        setPolicyChecked(false);
        setConsentError('APP USE: PRIVACY POLICY ACCEPT AND CAMERA USE ACCEPT NEED. REJECT: ACCESS BLOCKED.');
      }}>
        <Text style={styles.buttonText}>REJECT</Text>
      </TouchableOpacity>
      {policyVisible ? <TermsConsentModal onContinue={() => {}} onClose={() => setPolicyVisible(false)} /> : null}
    </View>;
  }

  // Solicitar permisos de cámara
  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <MaterialIcons name="camera-alt" size={64} color="#666" />
        <Text style={styles.title}>CAMERA ACCESS NEED</Text>
        <Text style={styles.subtitle}>ROOM QR CODE SCAN, CAMERA ACCESS NEED</Text>
        <Text style={styles.subtitle}>CAMERA DENIED. SETTINGS OPEN, CAMERA ALLOW, RETURN HERE. SCAN QR THEN CAN.</Text>
        {consentError ? <Text style={styles.subtitle} accessibilityRole="alert">{consentError}</Text> : null}
        {permission.canAskAgain ? <TouchableOpacity style={styles.button} onPress={async () => {
          try {
            const result = await requestPermission();
            await recordPrivacyConsent(result.granted ? 'granted' : 'denied');
          } catch { setConsentError('CAMERA PERMISSION CHECK FAILED. TRY AGAIN.'); }
        }}>
          <Text style={styles.buttonText}>ALLOW CAMERA</Text>
        </TouchableOpacity> : null}
        <TouchableOpacity style={styles.button} testID="camera-settings" accessibilityLabel="Abrir configuración"
          onPress={() => Linking.openSettings().catch(() => setConsentError('SETTINGS OPEN FAILED. OPEN APP SETTINGS.'))}>
          <Text style={styles.buttonText}>OPEN SETTINGS</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Loading state
  if (flowState === 'validating') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.title}>QR CODE CHECK...</Text>
      </View>
    );
  }

  // Estado de error
  if (flowState === 'error') {
    return (
      <View style={styles.container}>
        <MaterialIcons name="error-outline" size={64} color="#dc2626" />
        <Text style={styles.title}>{error}</Text>
        <Text style={styles.subtitle}>SERVER: {API_BASE_URL}</Text>
        <TouchableOpacity style={styles.button} onPress={handleScanAgain}>
          <Text style={styles.buttonText}>SCAN AGAIN</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Estado de escaneo de cámara/QR
  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarcodeScan}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>SCAN YOUR ROOM QR CODE</Text>
          </View>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <View style={styles.footer}>
            <MaterialIcons name="qr-code-scanner" size={24} color="white" />
            <Text style={styles.footerText}>QR CODE PUT INSIDE FRAME</Text>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  policyLink: { color: '#93C5FD', textDecorationLine: 'underline', textAlign: 'center', margin: 16, fontSize: 16 },
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#2563eb',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  footer: {
    paddingBottom: 60,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  footerText: {
    color: 'white',
    fontSize: 14,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginHorizontal: 20,
  },
  subtitle: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 20,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
