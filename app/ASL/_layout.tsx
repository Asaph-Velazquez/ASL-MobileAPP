import { Tabs, router } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { HapticTab } from '@/components/BothComponents/haptic-tab';
import { HeaderButtons } from '@/components/BothComponents/header-buttons';
import { IconSymbol } from '@/components/BothComponents/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 15 }}>
            <MaterialIcons name="arrow-back" size={24} color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
        ),
        headerRight: () => <HeaderButtons currentScreen="ASLHome" colorScheme={colorScheme} />,
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
      }}
    >
      <Tabs.Screen
        name="ASLHome"
        options={{
          title: 'HOME',
          headerTitle: '',
          headerRight: () => <HeaderButtons currentScreen="ASLHome" colorScheme={colorScheme} />,
          tabBarIcon: ({ size }) => {
            const homeColor = colorScheme === 'dark' ? '#FFFFFF' : '#000000';
            return <IconSymbol size={size ?? 28} name="house.fill" color={homeColor} />;
          },
        }}
      />
      <Tabs.Screen name="ASLRoomS" options={{ title: 'ROOM SERVICE', headerTitle: '', headerRight: () => <HeaderButtons currentScreen="ASLRoomS" colorScheme={colorScheme} />, tabBarButton: () => null }} />
      <Tabs.Screen name="ASLServices" options={{ title: 'HOTEL SERVICES', headerTitle: '', headerRight: () => <HeaderButtons currentScreen="ASLServices" colorScheme={colorScheme} />, tabBarButton: () => null }} />
      <Tabs.Screen name="ASLReportProblem" options={{ title: 'REPORT PROBLEM', headerTitle: '', headerRight: () => <HeaderButtons currentScreen="ASLReportProblem" colorScheme={colorScheme} />, tabBarButton: () => null }} />
      <Tabs.Screen name="ASLMovilidad" options={{ title: 'MOBILITY', headerTitle: '', headerRight: () => <HeaderButtons currentScreen="ASLMovilidad" colorScheme={colorScheme} />, tabBarButton: () => null }} />
      <Tabs.Screen name="CallScreen" options={{ title: 'CALL', headerTitle: '', headerRight: () => <HeaderButtons currentScreen="ASLHome" colorScheme={colorScheme} />, tabBarButton: () => null }} />
    </Tabs>
  );
}
