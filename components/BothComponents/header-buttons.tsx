import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useCommunicationMode } from './communication-mode-provider';
import { useAuth } from './auth-provider';
import { CallModal } from './call-modal';
import { LogoutModal } from './logout-modal';
import { HistoryModal } from './history-modal';
import { useWebSocket } from './websocket-provider';

interface HeaderButtonsProps {
  currentScreen: string;
  colorScheme: 'light' | 'dark' | null | undefined;
}

export function HeaderButtons({ currentScreen, colorScheme }: HeaderButtonsProps) {
  const { mode, setMode } = useCommunicationMode();
  const { logout } = useAuth();
  const { misPeticiones, cancelarPeticion, ratePeticion } = useWebSocket();
  const [callModalVisible, setCallModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);

  const handleToggle = () => {
    const screenMapping: { [key: string]: string } = {
      TextHome: '/ASL/ASLHome',
      TextRoomS: '/ASL/ASLRoomS',
      TextServices: '/ASL/ASLServices',
      TextReportProblem: '/ASL/ASLReportProblem',
      TextMovilidad: '/ASL/ASLMovilidad',
      ASLHome: '/Text/TextHome',
      ASLRoomS: '/Text/TextRoomS',
      ASLServices: '/Text/TextServices',
      ASLReportProblem: '/Text/TextReportProblem',
      ASLMovilidad: '/Text/TextMovilidad',
    };

    const targetScreen = screenMapping[currentScreen];
    if (targetScreen) {
      const newMode = mode === 'ASL' ? 'Text' : 'ASL';
      setMode(newMode);
      router.replace(targetScreen as any);
    }
  };

  const handleCallPress = () => {
    setCallModalVisible(true);
  };

  const handleMakeCall = () => {
    setCallModalVisible(false);
    router.push('/ASL/CallScreen' as any);
  };

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const handleConfirmLogout = async () => {
    setLogoutModalVisible(false);
    await logout();
    router.replace('/login');
  };

  const isASLMode = currentScreen.startsWith('ASL');
  const toggleBgColor = isASLMode ? '#4A90E2' : '#9C27B0';

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleToggle} style={[styles.button, { backgroundColor: toggleBgColor }]}>
        <View style={styles.buttonContent}>
          {isASLMode ? (
            <MaterialCommunityIcons name="sign-language" size={20} color="#FFFFFF" />
          ) : (
            <MaterialIcons name="chat-bubble" size={20} color="#FFFFFF" />
          )}
          <Text style={styles.buttonText}>{isASLMode ? 'ASL' : 'TEXT'}</Text>
          <MaterialIcons name="swap-horiz" size={18} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      {isASLMode && (
        <TouchableOpacity onPress={handleCallPress} style={[styles.iconButton, { backgroundColor: '#4CAF50' }]}>
          <MaterialIcons name="phone" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => setHistoryModalVisible(true)} style={[styles.iconButton, { backgroundColor: '#FF9800' }]}>
        <View>
          <MaterialIcons name="notifications" size={22} color="#FFFFFF" />
          {(() => {
            const peticionesActivas = misPeticiones.filter(
              (pet) => pet.status === 'pending' || pet.status === 'in-progress'
            ).length;
            return peticionesActivas > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{peticionesActivas > 9 ? '9+' : peticionesActivas}</Text>
              </View>
            );
          })()}
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogout} style={[styles.iconButton, { backgroundColor: '#F44336' }]}>
        <MaterialIcons name="logout" size={22} color="#FFFFFF" />
      </TouchableOpacity>

      <CallModal visible={callModalVisible} onClose={() => setCallModalVisible(false)} onMakeCall={handleMakeCall} />
      <LogoutModal visible={logoutModalVisible} onConfirm={handleConfirmLogout} onCancel={() => setLogoutModalVisible(false)} />
      <HistoryModal
        visible={historyModalVisible}
        onClose={() => setHistoryModalVisible(false)}
        peticiones={misPeticiones}
        mode={isASLMode ? 'ASL' : 'Text'}
        onCancelarPeticion={cancelarPeticion}
        onRatePeticion={ratePeticion}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
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
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#F44336',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});

