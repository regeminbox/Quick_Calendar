import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { cellKey, type ISODate, type TimeStyle } from '@/lib/date';
import type { CellValue, Worker } from '@/store/types';
import { colors, fonts } from '@/theme/tokens';

import { ScheduleCell } from './ScheduleCell';
import type { GridMetrics } from './useGridMetrics';

export interface WorkerRowProps {
  worker: Worker;
  dates: ISODate[];
  cells: Record<string, CellValue>;
  today: ISODate;
  timeStyle: TimeStyle;
  metrics: GridMetrics;
  onPressCell?: (workerId: string, date: ISODate) => void;
  /** 끌어서 복사 중인 원본 칸 키 (테두리 강조) */
  paintSourceKey?: string | null;
}

export function WorkerRow({
  worker,
  dates,
  cells,
  today,
  timeStyle,
  metrics,
  onPressCell,
  paintSourceKey = null,
}: WorkerRowProps) {
  return (
    <View style={styles.row}>
      <View style={[styles.nameCell, { width: metrics.nameColWidth, height: metrics.rowHeight }]}>
        <AppText numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} style={styles.name}>
          {worker.name}
        </AppText>
      </View>
      {dates.map((date) => {
        const key = cellKey(worker.id, date);
        return (
          <ScheduleCell
            key={date}
            value={cells[key]}
            width={metrics.dayColWidth}
            height={metrics.rowHeight}
            timeStyle={timeStyle}
            isToday={date === today}
            highlighted={paintSourceKey === key}
            onPress={onPressCell ? () => onPressCell(worker.id, date) : undefined}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  nameCell: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    backgroundColor: colors.surface.card,
    borderRightWidth: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surface.border,
  },
  name: { fontFamily: fonts.bold, fontSize: 13, lineHeight: 16, textAlign: 'center' },
});
