import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { CheckIcon } from '@/components/icons';
import { colors, fonts, radius } from '@/theme/tokens';

import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

export interface ChipProps {
  label: string;
  bg?: string;
  fg?: string;
  selected?: boolean;
  dashed?: boolean;
  icon?: ReactNode;
  size?: 'sm' | 'md';
  onPress?: () => void;
  onLongPress?: () => void;
}

/** 카드/선택지 칩. 선택되면 인디고 테두리 + 체크(줌 인), 누르면 살짝 눌림 */
export function Chip({
  label,
  bg = colors.surface.card,
  fg = colors.text.primary,
  selected = false,
  dashed = false,
  icon,
  size = 'md',
  onPress,
  onLongPress,
}: ChipProps) {
  const interactive = !!onPress || !!onLongPress;
  return (
    <PressableScale
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={!interactive}
      scaleTo={0.93}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' && styles.sm,
        {
          backgroundColor: bg,
          borderColor: selected ? colors.brand.primary : colors.surface.border,
          borderStyle: dashed ? 'dashed' : 'solid',
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      {icon}
      <AppText style={[styles.label, size === 'sm' && styles.labelSm]} color={fg}>
        {label}
      </AppText>
      {selected ? (
        <Animated.View entering={ZoomIn.duration(180)} style={styles.check}>
          <CheckIcon size={11} color={colors.text.inverse} />
        </Animated.View>
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 2,
  },
  sm: { height: 32, paddingHorizontal: 12 },
  label: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 18 },
  labelSm: { fontSize: 13, lineHeight: 16 },
  check: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
