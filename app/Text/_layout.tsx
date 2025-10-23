import { Tabs, router } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        headerTitle: 'Home',
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
      }}>
      <Tabs.Screen
        name="TextHome"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <IconSymbol size={size ?? 28} name="house.fill" color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="TextRoomS"
        options={{
          title: 'Room Services',
          tabBarButton: () => null,  
        }}
      />
      <Tabs.Screen
        name="TextServices"
        options={{
          title: 'Hotel Services',
          tabBarButton: () => null,  
        }}
      />
    </Tabs>
  );
}
