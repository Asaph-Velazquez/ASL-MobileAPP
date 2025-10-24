import { Tabs, router } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

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
          title: 'Home',
          headerTitle: 'Home',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol size={size ?? 28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="TextRoomS"
        options={{
          title: 'Room Service',
          headerTitle: 'Room Service',
          tabBarButton: () => null,  
        }}
      />
      <Tabs.Screen
        name="TextServices"
        options={{
          title: 'Servicios del Hotel',
          headerTitle: 'Servicios del Hotel',
          tabBarButton: () => null,  
        }}
      />
      <Tabs.Screen
        name="TextReportProblem"
        options={{
          title: 'Reportar Problema',
          headerTitle: 'Reportar Problema',
          tabBarButton: () => null,  
        }}
      />
      <Tabs.Screen
        name="TextMovilidad"
        options={{
          title: 'Movilidad',
          headerTitle: 'Movilidad',
          tabBarButton: () => null,  
        }}
      />
    </Tabs>
  );
}
