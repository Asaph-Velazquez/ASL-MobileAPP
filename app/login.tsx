import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/components/BothComponents/auth-provider';
import { validateToken } from '@/services/auth';

type FlowState = 'camera' | 'validating' | 'error';

export default function LoginScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [flowState, setFlowState] = useState<FlowState>('camera');
  const [scanned, setScanned] = useState(false);
  const [roomNumber, setRoomNumber] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  // Manejador para escaneo de código de barras
  const handleBarcodeScan = async ({ data }: { data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    setFlowState('validating');
    
    try {
      const result = await validateToken(data);
      
      if (result.valid) {
        // Iniciar sesión automáticamente con el token
        await login(data, 'Guest', result.roomNumber || '');
        
        // Pequeño delay para asegurar que el estado de autenticación se estabilice
        setTimeout(() => {
          // Redirigir al onboarding
          router.replace('/onboarding');
        }, 100);
      } else {
        setError(result.reason || 'Código QR inválido');
        setFlowState('error');
      }
    } catch (err) {
      setError('Error al validar el código QR');
      setFlowState('error');
      console.error('Error validating token:', err);
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
        <Text style={styles.title}>Camera access needed</Text>
        <Text style={styles.subtitle}>To scan your room QR code</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Loading state
  if (flowState === 'validating') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.title}>Validating code...</Text>
      </View>
    );
  }

  // Estado de error
  if (flowState === 'error') {
    return (
      <View style={styles.container}>
        <MaterialIcons name="error-outline" size={64} color="#dc2626" />
        <Text style={styles.title}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={handleScanAgain}>
          <Text style={styles.buttonText}>Scan again</Text>
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
            <Text style={styles.headerTitle}>Scan your room QR code</Text>
          </View>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <View style={styles.footer}>
            <MaterialIcons name="qr-code-scanner" size={24} color="white" />
            <Text style={styles.footerText}>Position the QR code inside the frame</Text>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
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
