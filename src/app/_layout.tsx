import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { MascotLoader } from '@/components/mascot/MascotLoader';
import { useHydrated } from '@/store/useHydrated';
import { colors, fonts } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync().catch(() => {});

/** 젤리 고래 로더가 한 번은 통통 튀도록 최소 표시 시간 */
const MIN_LOADER_MS = 1100;

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    [fonts.regular]: require('@/assets/fonts/Pretendard-Regular.otf'),
    [fonts.medium]: require('@/assets/fonts/Pretendard-Medium.otf'),
    [fonts.semibold]: require('@/assets/fonts/Pretendard-SemiBold.otf'),
    [fonts.bold]: require('@/assets/fonts/Pretendard-Bold.otf'),
  });
  const hydrated = useHydrated();
  const [minElapsed, setMinElapsed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), MIN_LOADER_MS);
    return () => clearTimeout(t);
  }, []);

  const resourcesReady = (fontsLoaded || !!fontError) && hydrated;
  const ready = resourcesReady && minElapsed;

  useEffect(() => {
    // 네이티브 스플래시는 바로 걷어내고, 그 자리를 애니메이션 로더가 이어받는다
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <BottomSheetModalProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.surface.bg } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="share" options={{ presentation: 'modal' }} />
        </Stack>
        {!ready ? <MascotLoader fullscreen /> : null}
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.bg },
});
