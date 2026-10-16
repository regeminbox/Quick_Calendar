import { Tabs } from 'expo-router/js-tabs';

import { CalendarIcon, PeopleIcon, SlidersIcon } from '@/components/icons';
import { colors, fonts } from '@/theme/tokens';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text.primary,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarStyle: { backgroundColor: colors.surface.card, borderTopColor: colors.surface.border },
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 11 },
        sceneStyle: { backgroundColor: colors.surface.bg },
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: '근무표', tabBarIcon: ({ color }) => <CalendarIcon color={color} size={24} /> }}
      />
      <Tabs.Screen
        name="manage"
        options={{ title: '관리', tabBarIcon: ({ color }) => <PeopleIcon color={color} size={24} /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: '설정', tabBarIcon: ({ color }) => <SlidersIcon color={color} size={24} /> }}
      />
    </Tabs>
  );
}
