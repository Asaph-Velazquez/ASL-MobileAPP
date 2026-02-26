import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/components/auth-provider';
import { validateToken, registerGuest } from '@/services/auth';

type FlowState = 'camera' | 'validating' | 'name-entry' | 'registering' | 'error';

export default function LoginScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [flowState, setFlowState] = useState<FlowState>('camera');
  const [scanned, setScanned] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  // Handler for barcode scan
  const handleBarcodeScan = async ({ data }: { data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    setFlowState('validating');
    
    try {
      const result = await validateToken(data);
      
      if (result.valid) {
        setToken(data);
        setRoomNumber(result.roomNumber || '');
        setFlowState('name-entry');
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

  // Handler for name submission
  const handleNameSubmit = async () => {
    if (!guestName.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu nombre');
      return;
    }

    setFlowState('registering');

    try {
      const result = await registerGuest(token, guestName.trim());
      
      // Login with session token
      await login(result.sessionToken, result.guestName, result.roomNumber);
      
      // Navigate to home
      router.replace('/(tabs)');
    } catch (err) {
      setError('Error al registrar el huésped');
      setFlowState('error');
      console.error('Error registering guest:', err);
    }
  };

  // Reset to scan again
  const handleScanAgain = () => {
    setScanned(false);
    setFlowState('camera');
    setError('');
    setGuestName('');
    setToken('');
    setRoomNumber('');
  };

  // Request camera permissions
  const handleRequestPermission = async () => {
    const { granted } = await requestPermission();
    if (!granted) {
      Alert.alert(
        'Permisos de Cámara',
        'Se necesitan permisos de cámara para escanear códigos QR'
      );
    }
  };

  // Permission not granted UI
  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <MaterialIcons name="camera-alt" size={64} color="#4A90E2" />
          <Text style={styles.permissionTitle}>Permisos de Cámara</Text>
          <Text style={styles.permissionText}>
            Necesitamos acceso a la cámara para escanear el código QR de tu habitación
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={handleRequestPermission}
          >
            <Text style={styles.permissionButtonText}>Conceder Permisos</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Camera scanning UI
  if (flowState === 'camera') {
    return (
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarcodeScan}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        >
          <View style={styles.cameraOverlay}>
            <View style={styles.scannerHeader}>
              <MaterialIcons name="qr-code-scanner" size={48} color="#FFFFFF" />
              <Text style={styles.scannerTitle}>Escanea el código QR</Text>
              <Text style={styles.scannerSubtitle}>
                de tu habitación
              </Text>
            </View>
            
            <View style={styles.scanFrame} />
            
            <View style={styles.scannerFooter}>
              <Text style={styles.scannerHint}>
                Apunta la cámara al código QR
              </Text>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  // Validating UI
  if (flowState === 'validating') {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Validando código...</Text>
        </View>
      </View>
    );
  }

  // Name entry UI
  if (flowState === 'name-entry') {
    return (
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <View style={styles.formHeader}>
            <MaterialIcons name="person" size={64} color="#4A90E2" />
            <Text style={styles.formTitle}>Bienvenido</Text>
            <Text style={styles.formSubtitle}>Habitación {roomNumber}</Text>
          </View>

          <View style={styles.formBody}>
            <Text style={styles.label}>Ingresa tu nombre</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre completo"
              value={guestName}
              onChangeText={setGuestName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleNameSubmit}
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleNameSubmit}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>Continuar</Text>
              <MaterialIcons name="arrow-forward" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={handleScanAgain}
            >
              <Text style={styles.backButtonText}>Escanear otro código</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Registering UI
  if (flowState === 'registering') {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Registrando...</Text>
        </View>
      </View>
    );
  }

  // Error UI
  if (flowState === 'error') {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color="#F44336" />
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleScanAgain}
            activeOpacity={0.8}
          >
            <MaterialIcons name="qr-code-scanner" size={24} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Escanear de Nuevo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'space-between',
    padding: 20,
  },
  scannerHeader: {
    alignItems: 'center',
    marginTop: 60,
    gap: 8,
  },
  scannerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  scannerSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    alignSelf: 'center',
    borderWidth: 3,
    borderColor: '#4A90E2',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  scannerFooter: {
    alignItems: 'center',
    marginBottom: 40,
  },
  scannerHint: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
    borderRadius: 8,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 18,
    color: '#333333',
    fontWeight: '600',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 40,
    gap: 8,
  },
  formTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#333333',
  },
  formSubtitle: {
    fontSize: 18,
    color: '#666666',
  },
  formBody: {
    gap: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  backButton: {
    padding: 16,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  errorTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F44336',
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    flexDirection: 'row',
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minWidth: 220,
  },
  retryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
  },
  permissionText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  permissionButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 16,
    minWidth: 200,
    alignItems: 'center',
    marginTop: 16,
  },
  permissionButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
