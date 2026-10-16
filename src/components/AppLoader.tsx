import { StyleSheet, View } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WeekGridSkeleton } from '@/features/schedule/WeekGridSkeleton';
import { useGridMetrics } from '@/features/schedule/useGridMetrics';
import { colors, radius, spacing } from '@/theme/tokens';

/** 폰트·저장 데이터가 준비될 때까지 근무표 화면 모양 그대로 보여주는 스켈레톤 오버레이 */
export function AppLoader() {
  const metrics = useGridMetrics();
  return (
    <Animated.View exiting={FadeOut.duration(260)} style={styles.overlay} pointerEvents="none">
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
        <View style={styles.header}>
          <View style={styles.circle} />
          <View style={styles.titleBlock}>
            <View style={styles.smallBar} />
            <View style={styles.bigBar} />
          </View>
          <View style={styles.circle} />
        </View>
        <View style={styles.actionsRow} />
        <View style={styles.gridWrap}>
          <WeekGridSkeleton metrics={metrics} />
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface.bg,
    zIndex: 1000,
  },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  titleBlock: { alignItems: 'center', gap: 6 },
  smallBar: { width: 72, height: 10, borderRadius: 5, backgroundColor: colors.surface.muted },
  bigBar: { width: 150, height: 20, borderRadius: 8, backgroundColor: colors.surface.muted },
  actionsRow: { height: 32 + spacing.sm },
  gridWrap: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
});
