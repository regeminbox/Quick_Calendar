import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors, radius } from '@/theme/tokens';

import type { GridMetrics } from './useGridMetrics';

export interface WeekGridSkeletonProps {
  metrics: GridMetrics;
  rows?: number;
}

/**
 * 실제 WeekGrid와 같은 치수의 스켈레톤.
 * 로딩이 끝나면 같은 자리에 실제 표가 들어와 레이아웃이 흔들리지 않는다.
 */
export function WeekGridSkeleton({ metrics, rows = 5 }: WeekGridSkeletonProps) {
  const pulse = useSharedValue(0.45);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 750, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));
  const days = Array.from({ length: 7 }, (_, i) => i);

  return (
    <View style={[styles.card, { width: metrics.tableWidth + 2 }]}>
      <View style={[styles.header, { height: metrics.headerHeight }]}>
        <View style={{ width: metrics.nameColWidth }} />
        {days.map((i) => (
          <View key={i} style={[styles.headerCell, { width: metrics.dayColWidth }]}>
            <View style={styles.headerDot} />
            <View style={styles.headerBar} />
          </View>
        ))}
      </View>
      <Animated.View style={pulseStyle}>
        {Array.from({ length: rows }, (_, r) => (
          <View key={r} style={styles.row}>
            <View
              style={[styles.nameCell, { width: metrics.nameColWidth, height: metrics.rowHeight }]}>
              <View style={styles.nameBar} />
            </View>
            {days.map((c) => (
              <View
                key={c}
                style={[styles.cell, { width: metrics.dayColWidth, height: metrics.rowHeight }]}>
                <View style={styles.cellBar} />
              </View>
            ))}
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'center',
    backgroundColor: colors.surface.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surface.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: colors.brand.primarySoft,
    borderRadius: radius.md,
  },
  headerCell: { alignItems: 'center', justifyContent: 'center', gap: 4 },
  headerDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(20, 20, 20, 0.12)' },
  headerBar: { width: 14, height: 6, borderRadius: 3, backgroundColor: 'rgba(20, 20, 20, 0.12)' },
  row: { flexDirection: 'row' },
  nameCell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surface.border,
  },
  nameBar: { width: 36, height: 12, borderRadius: 6, backgroundColor: colors.surface.muted },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surface.border,
  },
  cellBar: { width: 26, height: 12, borderRadius: 6, backgroundColor: colors.surface.muted },
});
