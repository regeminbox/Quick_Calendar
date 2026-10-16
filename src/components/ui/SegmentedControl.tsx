import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { tapHaptic } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme/tokens';

import { AppText } from './AppText';

export interface SegmentOption<T extends string> {
  key: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

const PAD = 3;
const SPRING = { damping: 20, stiffness: 260, mass: 0.8 };

/** 선택 인디케이터가 스프링으로 미끄러지는 세그먼트 컨트롤 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const [width, setWidth] = useState(0);
  const index = Math.max(
    0,
    options.findIndex((o) => o.key === value),
  );
  const segmentWidth = width > 0 ? (width - PAD * 2) / options.length : 0;
  const x = useSharedValue(index * segmentWidth);

  useEffect(() => {
    x.value = withSpring(index * segmentWidth, SPRING);
  }, [index, segmentWidth, x]);

  const indicatorStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View style={styles.wrap} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {segmentWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.indicator, { width: segmentWidth }, indicatorStyle]}
        />
      ) : null}
      {options.map((option) => {
        const active = option.key === value;
        return (
          <Pressable
            key={option.key}
            onPress={() => {
              if (active) return;
              tapHaptic();
              onChange(option.key);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={styles.item}>
            <AppText
              style={styles.label}
              color={active ? colors.text.primary : colors.text.secondary}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.surface.muted,
    borderRadius: radius.pill,
    padding: PAD,
  },
  indicator: {
    position: 'absolute',
    top: PAD,
    bottom: PAD,
    left: PAD,
    borderRadius: radius.pill,
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  item: {
    flex: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  label: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 18 },
});
