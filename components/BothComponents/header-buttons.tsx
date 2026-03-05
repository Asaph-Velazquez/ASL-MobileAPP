import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, Alert } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useCommunicationMode } from './communication-mode-provider';
import { useAuth } from './auth-provider';
import { CallModal } from './call-modal';
import { LogoutModal } from './logout-modal';

interface HeaderButtonsProps {
  currentScreen: string;
  colorScheme: 'light' | 'dark' | null | undefined;
}

export function HeaderButtons({ currentScreen, colorScheme }: HeaderButtonsProps) {
  const { mode, setMode } = useCommunicationMode();
  const { logout } = useAuth();
  const [callModalVisible, setCallModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // Función de toggle entre modos
  const handleToggle = () => {
    const screenMapping: { [key: string]: string } = {
      // De Texto a ASL
      'TextHome': '/ASL/ASLHome',
      'TextRoomS': '/ASL/ASLRoomS',
      'TextServices': '/ASL/ASLServices',
      'TextReportProblem': '/ASL/ASLReportProblem',
      'TextMovilidad': '/ASL/ASLMovilidad',
      
      // De ASL a Texto
      'ASLHome': '/Text/TextHome',
      'ASLRoomS': '/Text/TextRoomS',
      'ASLServices': '/Text/TextServices',
      'ASLReportProblem': '/Text/TextReportProblem',
      'ASLMovilidad': '/Text/TextMovilidad',
    };

    const targetScreen = screenMapping[currentScreen];
    if (targetScreen) {
      const newMode = mode === 'ASL' ? 'Text' : 'ASL';
      setMode(newMode);
      router.replace(targetScreen as any);
    }
  };

  // Función para abrir modal de llamada
  const handleCallPress = () => {
    setCallModalVisible(true);
  };

  // Función para realizar llamada (lógica por implementar)
  const handleMakeCall = () => {
    setCallModalVisible(false);
    // TODO: Implementar lógica de llamada
    Alert.alert('Call', 'Implemetar llamada mas adelante');
  };

  // Función de logout
  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const handleConfirmLogout = async () => {
    setLogoutModalVisible(false);
    await logout();
    router.replace('/login');
  };

  const isASLMode = mode === 'ASL' || currentScreen.startsWith('ASL');
  const iconColor = colorScheme === 'dark' ? '#FFFFFF' : '#000000';
  const toggleBgColor = isASLMode ? '#4A90E2' : '#9C27B0';
  
  return (
    <View style={styles.container}>
      {/* Botón de toggle entre modos */}
      <TouchableOpacity 
        onPress={handleToggle}
        style={[styles.button, { backgroundColor: toggleBgColor }]}
      >
        <View style={styles.buttonContent}>
          {isASLMode ? (
            <MaterialCommunityIcons name="sign-language" size={20} color="#FFFFFF" />
          ) : (
            <MaterialIcons name="chat-bubble" size={20} color="#FFFFFF" />
          )}
          <Text style={styles.buttonText}>{isASLMode ? 'ASL' : 'Text'}</Text>
          <MaterialIcons name="swap-horiz" size={18} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      {/* Botón de llamada - Solo disponible en modo ASL */}
      {isASLMode && (
        <TouchableOpacity 
          onPress={handleCallPress}
          style={[styles.iconButton, { backgroundColor: '#4CAF50' }]}
        >
          <MaterialIcons name="phone" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Botón de logout */}
      <TouchableOpacity 
        onPress={handleLogout}
        style={[styles.iconButton, { backgroundColor: '#F44336' }]}
      >
        <MaterialIcons name="logout" size={22} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modal de llamada */}
      <CallModal
        visible={callModalVisible}
        onClose={() => setCallModalVisible(false)}
        onMakeCall={handleMakeCall}
      />

      {/* Modal de logout */}
      <LogoutModal
        visible={logoutModalVisible}
        onConfirm={handleConfirmLogout}
        onCancel={() => setLogoutModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 15,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
