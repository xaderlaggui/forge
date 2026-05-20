import { useForgeTheme } from "@/hooks/useForgeTheme";
import { useUIStore } from '@/stores/uiStore';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
import { Tabs, useRouter } from 'expo-router';
import { Dumbbell, Home, PieChart, Settings, Sparkles, TrendingUp } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function ForgeFAB() {
  const { T } = useForgeTheme();
  const styles = useStyles(T);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const aiColor = '#BF5AF2'; // Distinct purple for AI Coach

  const isTabBarVisible = useUIStore(s => s.isTabBarVisible);
  const translateY = useDerivedValue(() => {
    // FAB starts at bottom 85 + insets. We need a larger translation to push it fully offscreen
    return withTiming(isTabBarVisible ? 0 : 250, { duration: 300, easing: Easing.out(Easing.exp) });
  }, [isTabBarVisible]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }]
  }));

  return (
    <Animated.View style={[styles.fabWrapper, animatedStyle, { bottom: 85 + insets.bottom }]}>
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: aiColor, shadowColor: aiColor }]}
        onPress={() => router.push('/chat')}
        activeOpacity={0.85}
        accessibilityLabel="AI Coach"
        accessibilityRole="button"
      >
        <Sparkles size={24} color="#fff" strokeWidth={2.5} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const TabIcon = ({ Icon, color, focused, T }: { Icon: any, color: string, focused: boolean, T: any }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center', width: 48 }}>
    <Icon size={22} color={color} strokeWidth={2.5} />
  </View>
);

function AnimatedTabBar({ props, animatedStyle, T, tabWidth }: any) {
  const indicatorPosition = useDerivedValue(() => {
    // calculate center of active tab and subtract half of indicator width
    const targetX = (props.state.index * tabWidth) + (tabWidth / 2) - 24;
    return withTiming(targetX, { duration: 300, easing: Easing.out(Easing.cubic) });
  }, [props.state.index, tabWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorPosition.value }]
  }));

  return (
    <Animated.View style={[{ position: 'absolute', bottom: 0, left: 0, right: 0 }, animatedStyle]}>
      <BottomTabBar {...props} />
      <Animated.View style={[{
        position: 'absolute',
        top: -79.2,
        left: -10,
        width: 70,
        height: 3,
        backgroundColor: T.colors.forge,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        zIndex: 100,
      }, indicatorStyle]} />
    </Animated.View>
  );
}

export default function TabLayout() {
  const { T } = useForgeTheme();
  const styles = useStyles(T);
  const isTabBarVisible = useUIStore(s => s.isTabBarVisible);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const tabWidth = width / 5; // 5 tabs

  const translateY = useDerivedValue(() => {
    return withTiming(isTabBarVisible ? 0 : 150, { duration: 300, easing: Easing.out(Easing.exp) });
  }, [isTabBarVisible]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }]
  }));

  return (
    <View style={{ flex: 1, backgroundColor: T.colors.bg0 }}>
      <Tabs
        tabBar={(props) => <AnimatedTabBar props={props} animatedStyle={animatedStyle} T={T} tabWidth={tabWidth} />}
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: T.colors.forge,
          tabBarInactiveTintColor: T.colors.t3,
          tabBarStyle: {
            backgroundColor: T.colors.bg0, // bg0 with slight transparency for blur effect
            borderTopWidth: 0.5,
            borderTopColor: T.colors.b1,
            height: 80,
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
            tabBarIcon: ({ color, focused }) => <TabIcon Icon={Home} color={color} focused={focused} T={T} />,
          }}
        />
        <Tabs.Screen
          name="workout"
          options={{
            title: 'Workout',
            tabBarIcon: ({ color, focused }) => <TabIcon Icon={Dumbbell} color={color} focused={focused} T={T} />,
          }}
        />
        <Tabs.Screen
          name="nutrition"
          options={{
            title: 'Nutrition',
            tabBarIcon: ({ color, focused }) => <TabIcon Icon={PieChart} color={color} focused={focused} T={T} />,
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            title: 'Progress',
            tabBarIcon: ({ color, focused }) => <TabIcon Icon={TrendingUp} color={color} focused={focused} T={T} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, focused }) => <TabIcon Icon={Settings} color={color} focused={focused} T={T} />,
          }}
        />
      </Tabs>

      {/* Floating Action Button (Global) */}
      <ForgeFAB />
    </View>
  );
}

const useStyles = (T: any) => StyleSheet.create({
  fabWrapper: {
    position: 'absolute',
    right: T.spacing.page,
    zIndex: 100,
  },
  fab: {
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
