import { memo, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { AppText } from '@/components/ui/AppText';
import { GradientFill } from '@/components/ui/GradientFill';
import { formatEndTime, formatTimeLabel, formatTimeRange, type TimeStyle } from '@/lib/date';
import type { CellValue } from '@/store/types';
import { colors, fonts } from '@/theme/tokens';

export interface ScheduleCellProps {
  value: CellValue | undefined;
  width: number;
  height: number;
  timeStyle: TimeStyle;
  isToday?: boolean;
  /** 끌어서 복사 중인 원본 칸 — 인디고 테두리 */
  highlighted?: boolean;
  onPress?: () => void;
}

export function cellLabel(value: CellValue, timeStyle: TimeStyle): string {
  if (value.kind === 'time' && value.time)
    return formatTimeRange(value.time, value.endTime, timeStyle);
  return value.label;
}

function ScheduleCellBase({
  value,
  width,
  height,
  timeStyle,
  isToday = false,
  highlighted = false,
  onPress,
}: ScheduleCellProps) {
  const bg = value?.bg ?? (isToday ? colors.brand.primaryPale : colors.surface.card);
  const fg = value?.fg ?? colors.text.primary;
  const label = value ? cellLabel(value, timeStyle) : '';
  const isStatus = value?.kind === 'status';
  const start = value?.kind === 'time' ? value.time : undefined;
  const end = value?.kind === 'time' ? value.endTime : undefined;

  // 값이 바뀌면 살짝 튀는 팝 (첫 렌더는 제외)
  const scale = useSharedValue(1);
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    scale.value = withSequence(
      withTiming(1.16, { duration: 90 }),
      withSpring(1, { damping: 12, stiffness: 260 }),
    );
  }, [label, scale]);
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const inner = (
    <GradientFill colors={[bg, value?.bg2]} style={[styles.cell, { width, height }]}>
      {highlighted ? <View pointerEvents="none" style={styles.highlight} /> : null}
      {label ? (
        <Animated.View style={[styles.content, popStyle]}>
          {start && end ? (
            <>
              <AppText
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
                style={[styles.label, { color: fg, fontFamily: fonts.semibold }]}>
                {formatTimeLabel(start, timeStyle)}
              </AppText>
              <AppText
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
                style={[styles.sub, { color: fg }]}>
                ~{formatEndTime(end, timeStyle)}
              </AppText>
            </>
          ) : (
            <AppText
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              style={[
                styles.label,
                { color: fg, fontFamily: isStatus ? fonts.bold : fonts.semibold },
              ]}>
              {label}
            </AppText>
          )}
        </Animated.View>
      ) : null}
    </GradientFill>
  );
  if (!onPress) return inner;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label || '비어 있음'}
      accessibilityHint="한 번 누르면 고른 카드, 두 번 누르면 직접 입력, 꾹 누른 채 끌면 복사">
      {({ pressed }) => <View style={{ opacity: pressed ? 0.6 : 1 }}>{inner}</View>}
    </Pressable>
  );
}

export const ScheduleCell = memo(ScheduleCellBase);

const styles = StyleSheet.create({
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surface.border,
    paddingHorizontal: 2,
  },
  content: { alignItems: 'center', justifyContent: 'center' },
  highlight: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: 1,
    bottom: 1,
    borderWidth: 2,
    borderColor: colors.brand.primary,
    borderRadius: 6,
  },
  label: { fontSize: 12, lineHeight: 14, textAlign: 'center' },
  sub: {
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 12,
    textAlign: 'center',
    opacity: 0.85,
  },
});
