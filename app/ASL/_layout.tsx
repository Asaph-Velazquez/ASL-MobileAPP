import { Tabs, router } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { ModeToggleButton } from '@/components/mode-toggle-button';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        headerLeft: () => (
          <TouchableOpacity 
            onPress={() => router.back()}
            style={{ marginLeft: 15 }}
          >
            <MaterialIcons 
              name="arrow-back" 
              size={24} 
              color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'} 
            />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <ModeToggleButton currentScreen="ASLHome" colorScheme={colorScheme} />
        ),
        tabBarShowLabel: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}>
      <Tabs.Screen
        name="ASLHome"
        options={{
          title: 'Home',
          headerTitle: 'Home',
          headerRight: () => (
            <ModeToggleButton currentScreen="ASLHome" colorScheme={colorScheme} />
          ),
          tabBarIcon: ({ color, size }) => (
            <IconSymbol size={size ?? 28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ASLRoomS"
        options={{
          title: 'Room Service',
          headerTitle: 'Room Service',
          headerRight: () => (
            <ModeToggleButton currentScreen="ASLRoomS" colorScheme={colorScheme} />
          ),
          tabBarButton: () => null,  
        }}
      />
      <Tabs.Screen
        name="ASLServices"
        options={{
          title: 'Servicios del Hotel',
          headerTitle: 'Servicios del Hotel',
          headerRight: () => (
            <ModeToggleButton currentScreen="ASLServices" colorScheme={colorScheme} />
          ),
          tabBarButton: () => null,  
        }}
      />
      <Tabs.Screen
        name="ASLReportProblem"
        options={{
          title: 'Reportar Problema',
          headerTitle: 'Reportar Problema',
          headerRight: () => (
            <ModeToggleButton currentScreen="ASLReportProblem" colorScheme={colorScheme} />
          ),
          tabBarButton: () => null,  
        }}
      />
      <Tabs.Screen
        name="ASLMovilidad"
        options={{
          title: 'Movilidad',
          headerTitle: 'Movilidad',
          headerRight: () => (
            <ModeToggleButton currentScreen="ASLMovilidad" colorScheme={colorScheme} />
          ),
          tabBarButton: () => null,  
        }}
      />
    </Tabs>
  );
}
