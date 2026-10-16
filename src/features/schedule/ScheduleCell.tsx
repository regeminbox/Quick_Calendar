import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { formatTimeLabel, type TimeStyle } from '@/lib/date';
import type { CellValue } from '@/store/types';
import { colors, fonts } from '@/theme/tokens';

export interface ScheduleCellProps {
  value: CellValue | undefined;
  width: number;
  height: number;
  timeStyle: TimeStyle;
  isToday?: boolean;
  onPress?: () => void;
}

export function cellLabel(value: CellValue, timeStyle: TimeStyle): string {
  if (value.kind === 'time' && value.time) return formatTimeLabel(value.time, timeStyle);
  return value.label;
}

function ScheduleCellBase({ value, width, height, timeStyle, isToday = false, onPress }: ScheduleCellProps) {
  const bg = value?.bg ?? (isToday ? colors.brand.yellowPale : colors.surface.card);
  const fg = value?.fg ?? colors.text.primary;
  const label = value ? cellLabel(value, timeStyle) : '';
  const isStatus = value?.kind === 'status';
  const inner = (
    <View style={[styles.cell, { width, height, backgroundColor: bg }]}>
      {label ? (
        <AppText
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
          style={[styles.label, { color: fg, fontFamily: isStatus ? fonts.bold : fonts.semibold }]}>
          {label}
        </AppText>
      ) : null}
    </View>
  );
  if (!onPress) return inner;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label || '비어 있음'}>
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
  label: { fontSize: 12, lineHeight: 14, textAlign: 'center' },
});
