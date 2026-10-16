import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeOut,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { AppText } from '@/components/ui/AppText';
import { colors, spacing } from '@/theme/tokens';

import { JellyWhale } from './JellyWhale';

export interface MascotLoaderProps {
  label?: string;
  size?: number;
  /** 화면 전체를 노란 배경으로 덮는 로딩 오버레이 */
  fullscreen?: boolean;
}

/** 젤리 고래가 통통 튀는 로더 — squash & stretch + 그림자 연동 (UI 스레드 애니메이션) */
export function MascotLoader({ label = '근무표 불러오는 중…', size = 150, fullscreen = false }: MascotLoaderProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 650, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [progress]);

  const bodyStyle = useAnimatedStyle(() => {
    const p = progress.value; // 0 = 바닥에 눌림, 1 = 공중에서 늘어남
    return {
      transform: [
        { translateY: interpolate(p, [0, 1], [0, -size * 0.18]) },
        { scaleX: interpolate(p, [0, 0.2, 1], [1.12, 1, 0.95]) },
        { scaleY: interpolate(p, [0, 0.2, 1], [0.86, 1, 1.06]) },
      ],
    };
  });

  const shadowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0.55, 0.2]),
    transform: [{ scaleX: interpolate(progress.value, [0, 1], [1, 0.65]) }],
  }));

  const content = (
    <View style={styles.center}>
      <View style={{ width: size, height: size * 0.8 + size * 0.2, alignItems: 'center', justifyContent: 'flex-end' }}>
        <Animated.View style={[styles.shadow, { width: size * 0.62, height: size * 0.09, borderRadius: size }, shadowStyle]} />
        <Animated.View style={[{ transformOrigin: '50% 100%' }, bodyStyle]}>
          <JellyWhale size={size} />
        </Animated.View>
      </View>
      {label ? (
        <AppText variant="heading" style={styles.label}>
          {label}
        </AppText>
      ) : null}
    </View>
  );

  if (!fullscreen) return content;

  return (
    <Animated.View exiting={FadeOut.duration(350)} style={styles.overlay} pointerEvents="none">
      {content}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.brand.yellow, zIndex: 1000 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  shadow: { position: 'absolute', bottom: 0, backgroundColor: colors.mascot.bodyBottom },
  label: { marginTop: spacing.sm },
});
