import { Tabs, router } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/BothComponents/haptic-tab';
import { IconSymbol } from '@/components/BothComponents/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { HeaderButtons } from '@/components/BothComponents/header-buttons';

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
          <HeaderButtons currentScreen="TextHome" colorScheme={colorScheme} />
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
        name="TextHome"
        options={{
          title: 'HOME',
          headerTitle: '',
          headerRight: () => (
            <HeaderButtons currentScreen="TextHome" colorScheme={colorScheme} />
          ),
          tabBarIcon: ({ color, size }) => {
            // Home icon: blanco en modo oscuro, negro en modo claro
            const homeColor = colorScheme === 'dark' ? '#FFFFFF' : '#000000';
            return <IconSymbol size={size ?? 28} name="house.fill" color={homeColor} />;
          },
        }}
      />
      <Tabs.Screen
        name="TextRoomS"
        options={{
          title: 'ROOM SERVICE',
          headerTitle: '',
          headerRight: () => (
            <HeaderButtons currentScreen="TextRoomS" colorScheme={colorScheme} />
          ),
          tabBarButton: () => null,  
        }}
      />
      <Tabs.Screen
        name="TextServices"
        options={{
          title: 'HOTEL SERVICES',
          headerTitle: '',
          headerRight: () => (
            <HeaderButtons currentScreen="TextServices" colorScheme={colorScheme} />
          ),
          tabBarButton: () => null,  
        }}
      />
      <Tabs.Screen
        name="TextReportProblem"
        options={{
          title: 'REPORT PROBLEM',
          headerTitle: '',
          headerRight: () => (
            <HeaderButtons currentScreen="TextReportProblem" colorScheme={colorScheme} />
          ),
          tabBarButton: () => null,  
        }}
      />
      <Tabs.Screen
        name="TextMovilidad"
        options={{
          title: 'MOBILITY',
          headerTitle: '',
          headerRight: () => (
            <HeaderButtons currentScreen="TextMovilidad" colorScheme={colorScheme} />
          ),
          tabBarButton: () => null,  
        }}
      />
    </Tabs>
  );
}
