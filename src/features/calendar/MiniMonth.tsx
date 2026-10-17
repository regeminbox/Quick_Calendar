import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { GradientFill } from '@/components/ui/GradientFill';
import { PressableScale } from '@/components/ui/PressableScale';
import { type ISODate, WEEKDAY_KO, weekDates } from '@/lib/date';
import { colors, fonts, gradients, radius } from '@/theme/tokens';

import type { MonthInfo } from './months';

const ROWS = 6;
const ROW_H = 17;
const TITLE_H = 22;
const WEEKDAY_H = 12;
const PAD = 8;
/** 테두리 포함 카드 높이 — 달마다 같아야 3열 격자가 맞는다 */
export const MINI_MONTH_HEIGHT = PAD * 2 + TITLE_H + WEEKDAY_H + ROWS * ROW_H + 2;

export interface MiniMonthProps {
  info: MonthInfo;
  width: number;
  today: ISODate;
  /** 알약으로 표시할 주 */
  selectedWeek: ISODate | null;
  /** 근무가 하나라도 들어간 날짜 */
  filledDays: Set<ISODate>;
  eventDays: Map<ISODate, string>;
  /** 검색으로 찾았을 때 잠깐 테두리 강조 */
  highlighted?: boolean;
  onPress: (info: MonthInfo) => void;
}

/** 3열 연간 개요용 작은 달 카드. 누르면 큰 달 카드가 시트로 열린다 */
export const MiniMonth = memo(function MiniMonth({
  info,
  width,
  today,
  selectedWeek,
  filledDays,
  eventDays,
  highlighted = false,
  onPress,
}: MiniMonthProps) {
  const monthPrefix = info.key.slice(0, 7);
  const rows: string[] = [...info.weeks];
  while (rows.length < ROWS) rows.push('');
  return (
    <PressableScale
      scaleTo={0.96}
      onPress={() => onPress(info)}
      accessibilityRole="button"
      accessibilityLabel={`${info.year}년 ${info.month}월 열기`}
      containerStyle={{ width }}
      style={[styles.card, { height: MINI_MONTH_HEIGHT }, highlighted && styles.cardHighlighted]}>
      <AppText style={styles.title}>{info.month}월</AppText>
      <View style={styles.weekdays}>
        {WEEKDAY_KO.map((d, i) => (
          <AppText
            key={d}
            style={styles.weekday}
            color={
              i === 0 ? colors.weekday.sun : i === 6 ? colors.weekday.sat : colors.text.tertiary
            }>
            {d}
          </AppText>
        ))}
      </View>
      {rows.map((weekStart, r) => (
        <View key={weekStart || `blank-${r}`} style={styles.row}>
          {weekStart && weekStart === selectedWeek ? (
            <GradientFill colors={gradients.selection} horizontal style={styles.rowPill} />
          ) : null}
          {weekStart
            ? weekDates(weekStart).map((iso) => {
                if (!iso.startsWith(monthPrefix)) return <View key={iso} style={styles.cell} />;
                const isToday = iso === today;
                const eventColor = eventDays.get(iso);
                return (
                  <View key={iso} style={styles.cell}>
                    <View
                      style={[
                        styles.num,
                        isToday && styles.numToday,
                        !isToday && !!eventColor && { backgroundColor: eventColor },
                      ]}>
                      <AppText
                        style={[styles.numText, isToday && styles.numTextToday]}
                        color={isToday ? colors.text.inverse : colors.text.primary}>
                        {Number(iso.slice(8, 10))}
                      </AppText>
                    </View>
                    <View style={[styles.dot, filledDays.has(iso) && styles.dotOn]} />
                  </View>
                );
              })
            : null}
        </View>
      ))}
    </PressableScale>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surface.border,
    padding: PAD,
  },
  cardHighlighted: { borderColor: colors.brand.primary, borderWidth: 2, padding: PAD - 1 },
  title: {
    fontFamily: fonts.bold,
    fontSize: 13,
    lineHeight: TITLE_H,
    color: colors.text.primary,
    textAlign: 'center',
  },
  weekdays: { flexDirection: 'row', height: WEEKDAY_H },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.medium,
    fontSize: 8,
    lineHeight: WEEKDAY_H,
  },
  row: { flexDirection: 'row', height: ROW_H },
  rowPill: { position: 'absolute', left: -3, right: -3, top: 0, bottom: 0, borderRadius: 6 },
  cell: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  num: { width: 14, height: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  numToday: { backgroundColor: colors.brand.primary },
  numText: { fontFamily: fonts.medium, fontSize: 9, lineHeight: 11 },
  numTextToday: { fontFamily: fonts.bold },
  dot: { width: 3, height: 3, borderRadius: 1.5, marginTop: 1, backgroundColor: 'transparent' },
  dotOn: { backgroundColor: colors.brand.primary },
});
