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
          <HeaderButtons currentScreen="ASLHome" colorScheme={colorScheme} />
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
            <HeaderButtons currentScreen="ASLHome" colorScheme={colorScheme} />
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
            <HeaderButtons currentScreen="ASLRoomS" colorScheme={colorScheme} />
          ),
          tabBarButton: () => null,  
        }}
      />
      <Tabs.Screen
        name="ASLServices"
        options={{
          title: 'Hotel Services',
          headerTitle: 'Hotel Services',
          headerRight: () => (
            <HeaderButtons currentScreen="ASLServices" colorScheme={colorScheme} />
          ),
          tabBarButton: () => null,  
        }}
      />
      <Tabs.Screen
        name="ASLReportProblem"
        options={{
          title: 'Report Problem',
          headerTitle: 'Report Problem',
          headerRight: () => (
            <HeaderButtons currentScreen="ASLReportProblem" colorScheme={colorScheme} />
          ),
          tabBarButton: () => null,  
        }}
      />
      <Tabs.Screen
        name="ASLMovilidad"
        options={{
          title: 'Mobility',
          headerTitle: 'Mobility',
          headerRight: () => (
            <HeaderButtons currentScreen="ASLMovilidad" colorScheme={colorScheme} />
          ),
          tabBarButton: () => null,  
        }}
      />
    </Tabs>
  );
}
