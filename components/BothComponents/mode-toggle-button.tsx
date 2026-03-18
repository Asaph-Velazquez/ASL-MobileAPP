import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useCommunicationMode } from './communication-mode-provider';

interface ModeToggleButtonProps {
  currentScreen: string;
  colorScheme: 'light' | 'dark' | null | undefined;
}

export function ModeToggleButton({ currentScreen, colorScheme }: ModeToggleButtonProps) {
  const { mode, setMode } = useCommunicationMode();

  const handleToggle = () => {
    // Mapeo de pantallas entre modos
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

  const isASLMode = mode === 'ASL' || currentScreen.startsWith('ASL');
  const iconColor = colorScheme === 'dark' ? '#FFFFFF' : '#000000';
  const bgColor = isASLMode ? '#4A90E2' : '#9C27B0';
  
  return (
    <TouchableOpacity 
      onPress={handleToggle}
      style={[styles.container, { backgroundColor: bgColor }]}
    >
      <View style={styles.content}>
        {isASLMode ? (
          <MaterialCommunityIcons name="sign-language" size={20} color="#FFFFFF" />
        ) : (
          <MaterialIcons name="chat-bubble" size={20} color="#FFFFFF" />
        )}
        <Text style={styles.text}>{isASLMode ? 'ASL' : 'Text'}</Text>
        <MaterialIcons name="swap-horiz" size={18} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
