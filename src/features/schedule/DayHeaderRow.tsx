import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { dayInfo, type ISODate } from '@/lib/date';
import { colors, fonts } from '@/theme/tokens';

import type { GridMetrics } from './useGridMetrics';

export interface DayHeaderRowProps {
  dates: ISODate[];
  today: ISODate;
  metrics: GridMetrics;
}

/** 엑셀처럼 노란 헤더: 날짜(큰 글자) + 요일(작은 글자). 일=빨강, 토=파랑, 오늘=검은 동그라미 */
export function DayHeaderRow({ dates, today, metrics }: DayHeaderRowProps) {
  return (
    <View style={[styles.row, { height: metrics.headerHeight }]}>
      <View style={[styles.nameCell, { width: metrics.nameColWidth }]}>
        <AppText variant="caption" color={colors.text.secondary}>
          근무자
        </AppText>
      </View>
      {dates.map((iso) => {
        const info = dayInfo(iso);
        const weekdayColor = info.isSunday ? colors.weekday.sun : info.isSaturday ? colors.weekday.sat : colors.text.secondary;
        const isToday = iso === today;
        return (
          <View key={iso} style={[styles.dayCell, { width: metrics.dayColWidth }]}>
            <View style={[styles.dayBadge, isToday && styles.todayBadge]}>
              <AppText style={[styles.dayNumber, isToday && { color: colors.text.inverse }]}>{info.day}</AppText>
            </View>
            <AppText variant="caption" color={weekdayColor} style={styles.weekday}>
              {info.weekday}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', backgroundColor: colors.brand.yellow },
  nameCell: { alignItems: 'center', justifyContent: 'center' },
  dayCell: { alignItems: 'center', justifyContent: 'center' },
  dayBadge: { minWidth: 26, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  todayBadge: { backgroundColor: colors.text.primary },
  dayNumber: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 20, color: colors.text.onYellow },
  weekday: { marginTop: 1 },
});
