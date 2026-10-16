import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { CalendarIcon, PeopleIcon, SlidersIcon } from '@/components/icons';
import { useAppStore } from '@/store/useAppStore';
import { useHydrated } from '@/store/useHydrated';
import { colors, fonts } from '@/theme/tokens';

export default function TabsLayout() {
  const hydrated = useHydrated();
  const onboarded = useAppStore((s) => s.settings.onboarded);

  // 저장 데이터 복원 전에는 판단하지 않는다 (스켈레톤이 덮고 있음)
  if (!hydrated) return null;
  if (!onboarded) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: 'shift',
        tabBarActiveTintColor: colors.brand.primary,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: colors.surface.card,
          borderTopColor: colors.surface.border,
        },
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 11 },
        sceneStyle: { backgroundColor: colors.surface.bg },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '근무표',
          tabBarIcon: ({ color }) => <CalendarIcon color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="manage"
        options={{
          title: '관리',
          tabBarIcon: ({ color }) => <PeopleIcon color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '설정',
          tabBarIcon: ({ color }) => <SlidersIcon color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
