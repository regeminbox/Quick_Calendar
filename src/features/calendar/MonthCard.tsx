import { format } from 'date-fns';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, withSpring, ZoomIn } from 'react-native-reanimated';

import { CalendarIcon } from '@/components/icons';
import { AppText } from '@/components/ui/AppText';
import { GradientFill } from '@/components/ui/GradientFill';
import { PressableScale } from '@/components/ui/PressableScale';
import { fromISODate, type ISODate, WEEKDAY_KO, weekDates, weekRangeLabel } from '@/lib/date';
import { colors, fonts, gradients, radius } from '@/theme/tokens';

import type { MonthInfo } from './months';

export const MONTH_ROW_H = 48;
const SPRING = { damping: 18, stiffness: 190, mass: 0.9 };

export interface MonthCardProps {
  info: MonthInfo;
  today: ISODate;
  /** 알약으로 강조할 주 — 보고 있는 주, 또는 복사 모드에서 고른 주 */
  highlightWeek: ISODate | null;
  /** 점선 테두리로 표시할 주 — 복사 받을 주 */
  outlineWeek?: ISODate | null;
  /** 날짜 → 점 색(근무·상태 카드) */
  dots: Map<ISODate, string[]>;
  /** 행사 기간에 든 날짜 → 띠 색 */
  eventDays: Map<ISODate, string>;
  onPickWeek: (weekStart: ISODate) => void;
}

/** 큰 달 카드 — 주 행을 누르면 고른다. 레퍼런스처럼 날짜 아래 색 점 */
export const MonthCard = memo(function MonthCard({
  info,
  today,
  highlightWeek,
  outlineWeek = null,
  dots,
  eventDays,
  onPickWeek,
}: MonthCardProps) {
  const first = fromISODate(info.key);
  const monthPrefix = info.key.slice(0, 7);
  const highlightRow = highlightWeek ? info.weeks.indexOf(highlightWeek) : -1;
  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.card}>
      <View style={styles.cardTitle}>
        <CalendarIcon size={18} color={colors.text.secondary} />
        <AppText variant="heading">{format(first, 'yyyy년 M월')}</AppText>
      </View>
      <View style={styles.weekdays}>
        {WEEKDAY_KO.map((d, i) => (
          <View key={d} style={styles.weekdayCell}>
            <AppText
              variant="caption"
              color={
                i === 0 ? colors.weekday.sun : i === 6 ? colors.weekday.sat : colors.text.tertiary
              }>
              {d}
            </AppText>
          </View>
        ))}
      </View>
      <View>
        {highlightRow >= 0 ? <SelectionPill row={highlightRow} /> : null}
        {info.weeks.map((weekStart) => (
          <PressableScale
            key={weekStart}
            scaleTo={0.97}
            onPress={() => onPickWeek(weekStart)}
            accessibilityRole="button"
            accessibilityLabel={`${weekRangeLabel(weekStart)} 주`}
            accessibilityState={{ selected: weekStart === highlightWeek }}
            style={[styles.weekRow, weekStart === outlineWeek && styles.weekRowOutline]}>
            {weekDates(weekStart).map((iso) => {
              if (!iso.startsWith(monthPrefix)) return <View key={iso} style={styles.dayCell} />;
              const isToday = iso === today;
              const eventColor = eventDays.get(iso);
              return (
                <View key={iso} style={styles.dayCell}>
                  <View
                    style={[
                      styles.dayBadge,
                      isToday && styles.todayBadge,
                      !isToday && !!eventColor && { backgroundColor: eventColor },
                    ]}>
                    <AppText
                      style={[styles.dayText, isToday && styles.dayTextToday]}
                      color={isToday ? colors.text.inverse : colors.text.primary}>
                      {Number(iso.slice(8, 10))}
                    </AppText>
                  </View>
                  <View style={styles.dots}>
                    {(dots.get(iso) ?? []).map((c) => (
                      <View key={c} style={[styles.dot, { backgroundColor: c }]} />
                    ))}
                  </View>
                </View>
              );
            })}
          </PressableScale>
        ))}
      </View>
    </Animated.View>
  );
});

/** 강조한 주 뒤에 깔리는 알약 — 행이 바뀌면 스프링으로 미끄러진다 */
function SelectionPill({ row }: { row: number }) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withSpring(row * MONTH_ROW_H, SPRING) }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      entering={ZoomIn.springify().damping(16).stiffness(220)}
      style={[styles.pill, animatedStyle]}>
      <GradientFill colors={gradients.selection} horizontal style={styles.pillFill} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.surface.border,
    padding: 12,
  },
  cardTitle: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  weekdays: { height: 22, flexDirection: 'row' },
  weekdayCell: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pill: { position: 'absolute', left: 0, right: 0, top: 0, height: MONTH_ROW_H },
  pillFill: { flex: 1, borderRadius: radius.md },
  weekRow: { flexDirection: 'row', height: MONTH_ROW_H, borderRadius: radius.md },
  weekRowOutline: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.brand.primary },
  dayCell: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  dayBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  todayBadge: { backgroundColor: colors.brand.primary },
  dayText: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 18 },
  dayTextToday: { fontFamily: fonts.bold },
  dots: { flexDirection: 'row', gap: 3, height: 5 },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
});
