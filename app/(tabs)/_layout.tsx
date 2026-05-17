import React from 'react';
import { Tabs } from 'expo-router';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, Dumbbell, PieChart, TrendingUp, Settings, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ForgeTheme } from '../../constants/ForgeTheme';

function TabIcon({ icon, color }: { icon: React.ReactNode; color: string }) {
  return <View style={{ alignItems: 'center', justifyContent: 'center' }}>{icon}</View>;
}

function ForgeFAB() {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={() => router.push('/activeWorkout')}
      activeOpacity={0.85}
    >
      <Plus size={26} color="#fff" strokeWidth={2.5} />
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ForgeTheme.colors.forge,
        tabBarInactiveTintColor: ForgeTheme.colors.t3,
        tabBarStyle: {
          backgroundColor: 'rgba(10,10,11,0.95)',
          borderTopWidth: 0.5,
          borderTopColor: ForgeTheme.colors.b1,
          height: 80,
          paddingBottom: 20,
          paddingTop: 12,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Workout',
          tabBarIcon: ({ color }) => <Dumbbell size={22} color={color} />,
        }}
      />

      {/* Center FAB placeholder tab */}
      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'Nutrition',
          tabBarIcon: ({ color }) => <PieChart size={22} color={color} />,
          tabBarButton: (props) => (
            <View style={{ flex: 1, alignItems: 'center' }}>
              {/* FAB floats above */}
              <ForgeFAB />
              {/* invisible touch area keeps tab layout balanced */}
              <View style={{ height: 80 }} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color }) => <TrendingUp size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    top: -26,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: ForgeTheme.colors.forge,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: ForgeTheme.colors.bg0,
    shadowColor: ForgeTheme.colors.forge,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
    zIndex: 100,
  },
});
