import { addDays, addMonths, format, isSameMonth, startOfMonth, startOfWeek } from 'date-fns';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';
import { AppText } from '@/components/ui/AppText';
import { IconButton } from '@/components/ui/IconButton';
import {
  fromISODate,
  type ISODate,
  todayISO,
  toISODate,
  WEEK_STARTS_ON,
  WEEKDAY_KO,
} from '@/lib/date';
import { colors, fonts, radius } from '@/theme/tokens';

export interface DateRange {
  start: ISODate;
  end: ISODate;
}

export interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const CELL = 40;

/** 월 달력에서 시작일 → 종료일 순서로 두 번 눌러 기간을 고른다 */
export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [month, setMonth] = useState(() => toISODate(startOfMonth(fromISODate(value.start))));
  const [anchor, setAnchor] = useState<ISODate | null>(null);
  const today = todayISO();

  const monthDate = fromISODate(month);
  const gridStart = startOfWeek(monthDate, { weekStartsOn: WEEK_STARTS_ON });
  const days = Array.from({ length: 42 }, (_, i) => toISODate(addDays(gridStart, i)));

  const pick = (iso: ISODate) => {
    if (anchor === null) {
      setAnchor(iso);
      onChange({ start: iso, end: iso });
    } else {
      onChange(iso < anchor ? { start: iso, end: anchor } : { start: anchor, end: iso });
      setAnchor(null);
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <IconButton
          size={32}
          accessibilityLabel="이전 달"
          onPress={() => setMonth(toISODate(addMonths(monthDate, -1)))}>
          <ChevronLeftIcon size={18} />
        </IconButton>
        <AppText variant="heading">{format(monthDate, 'yyyy년 M월')}</AppText>
        <IconButton
          size={32}
          accessibilityLabel="다음 달"
          onPress={() => setMonth(toISODate(addMonths(monthDate, 1)))}>
          <ChevronRightIcon size={18} />
        </IconButton>
      </View>
      <View style={styles.row}>
        {WEEKDAY_KO.map((d, i) => (
          <View key={d} style={styles.cell}>
            <AppText
              variant="caption"
              color={
                i === 0 ? colors.weekday.sun : i === 6 ? colors.weekday.sat : colors.text.secondary
              }>
              {d}
            </AppText>
          </View>
        ))}
      </View>
      {Array.from({ length: 6 }, (_, r) => (
        <View key={r} style={styles.row}>
          {days.slice(r * 7, r * 7 + 7).map((iso) => {
            const d = fromISODate(iso);
            const inMonth = isSameMonth(d, monthDate);
            const isStart = iso === value.start;
            const isEnd = iso === value.end;
            const inRange = iso > value.start && iso < value.end;
            const endpoint = isStart || isEnd;
            return (
              <Pressable
                key={iso}
                onPress={() => pick(iso)}
                accessibilityRole="button"
                accessibilityLabel={format(d, 'M월 d일')}
                style={styles.cell}>
                {inRange || (endpoint && value.start !== value.end) ? (
                  <View
                    style={[
                      styles.rangeBand,
                      isStart && styles.rangeBandStart,
                      isEnd && styles.rangeBandEnd,
                    ]}
                  />
                ) : null}
                <View style={[styles.day, endpoint && styles.dayEndpoint]}>
                  <AppText
                    style={[styles.dayText, endpoint && styles.dayTextEndpoint]}
                    color={
                      endpoint
                        ? colors.text.inverse
                        : inMonth
                          ? colors.text.primary
                          : colors.text.tertiary
                    }>
                    {d.getDate()}
                  </AppText>
                </View>
                {iso === today && !endpoint ? <View style={styles.todayDot} /> : null}
              </Pressable>
            );
          })}
        </View>
      ))}
      <AppText variant="caption" color={colors.text.tertiary} style={styles.hint}>
        {anchor
          ? '종료일을 눌러 주세요'
          : '시작일을 누른 뒤 종료일을 누르세요 (하루면 같은 날 두 번)'}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  row: { flexDirection: 'row' },
  cell: { flex: 1, height: CELL, alignItems: 'center', justifyContent: 'center' },
  rangeBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 5,
    bottom: 5,
    backgroundColor: colors.brand.primarySoft,
  },
  rangeBandStart: {
    left: '50%',
    borderTopLeftRadius: radius.pill,
    borderBottomLeftRadius: radius.pill,
  },
  rangeBandEnd: {
    right: '50%',
    borderTopRightRadius: radius.pill,
    borderBottomRightRadius: radius.pill,
  },
  day: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  dayEndpoint: { backgroundColor: colors.brand.primary },
  dayText: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 18 },
  dayTextEndpoint: { fontFamily: fonts.bold },
  todayDot: {
    position: 'absolute',
    bottom: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.brand.primary,
  },
  hint: { textAlign: 'center', marginTop: 4 },
});
