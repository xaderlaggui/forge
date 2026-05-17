import { Tabs, useRouter } from 'expo-router';
import { Dumbbell, Home, PieChart, Plus, Settings, TrendingUp } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ForgeTheme as T } from '../../constants/ForgeTheme';

function ForgeFAB() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  return (
    <TouchableOpacity
      style={[styles.fab, { bottom: 85 + insets.bottom }]} // Floating above tab bar
      onPress={() => router.push('/activeWorkout')}
      activeOpacity={0.85}
      accessibilityLabel="Start active workout"
      accessibilityRole="button"
    >
      <Plus size={26} color="#fff" strokeWidth={2.5} />
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: T.colors.bg0 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: T.colors.forge,
          tabBarInactiveTintColor: T.colors.t3,
          tabBarStyle: {
            backgroundColor: 'rgba(10,10,12,0.95)', // bg0 with slight transparency for blur effect
            borderTopWidth: 0.5,
            borderTopColor: T.colors.b1,
            height: 85,
            paddingBottom: 24,
            paddingTop: 12,
            position: 'absolute', // Allows content to flow underneath if needed
            bottom: 0,
            left: 0,
            right: 0,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            marginTop: 4,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <Home size={22} color={color} strokeWidth={2.5} />,
          }}
        />
        <Tabs.Screen
          name="workout"
          options={{
            title: 'Workout',
            tabBarIcon: ({ color }) => <Dumbbell size={22} color={color} strokeWidth={2.5} />,
          }}
        />
        <Tabs.Screen
          name="nutrition"
          options={{
            title: 'Nutrition',
            tabBarIcon: ({ color }) => <PieChart size={22} color={color} strokeWidth={2.5} />,
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            title: 'Progress',
            tabBarIcon: ({ color }) => <TrendingUp size={22} color={color} strokeWidth={2.5} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <Settings size={22} color={color} strokeWidth={2.5} />,
          }}
        />
      </Tabs>
      
      {/* Floating Action Button (Global) */}
      <ForgeFAB />
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: T.spacing.page,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: T.colors.forge,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: T.colors.forge,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
});
