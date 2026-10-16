import { type ReactNode, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { type ISODate, type TimeStyle, weekDates } from '@/lib/date';
import type { CalendarEvent, CellValue, Worker } from '@/store/types';
import { colors, radius } from '@/theme/tokens';

import { DayHeaderRow } from './DayHeaderRow';
import { EventBands } from './EventBands';
import { layoutEventLanes } from './eventLanes';
import { WorkerRow } from './WorkerRow';
import type { GridMetrics } from './useGridMetrics';

export interface WeekGridProps {
  weekStart: ISODate;
  today: ISODate;
  workers: Worker[];
  cells: Record<string, CellValue>;
  events: CalendarEvent[];
  timeStyle: TimeStyle;
  metrics: GridMetrics;
  onPressCell?: (workerId: string, date: ISODate) => void;
  onPressEvent?: (event: CalendarEvent) => void;
  /** 근무자가 없을 때 표 자리에 보여줄 내용 */
  emptyContent?: ReactNode;
}

/** 행사 띠 → 노란 날짜 헤더 → 근무자 행. 엑셀 근무표와 같은 구조 */
export function WeekGrid({
  weekStart,
  today,
  workers,
  cells,
  events,
  timeStyle,
  metrics,
  onPressCell,
  onPressEvent,
  emptyContent,
}: WeekGridProps) {
  const dates = useMemo(() => weekDates(weekStart), [weekStart]);
  const lanes = useMemo(() => layoutEventLanes(events, weekStart), [events, weekStart]);

  return (
    <View style={[styles.card, { width: metrics.tableWidth + 2 }]}>
      <EventBands items={lanes.items} laneCount={lanes.laneCount} metrics={metrics} onPressEvent={onPressEvent} />
      <DayHeaderRow dates={dates} today={today} metrics={metrics} />
      <ScrollView bounces={false} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {workers.length === 0
          ? emptyContent
          : workers.map((worker) => (
              <WorkerRow
                key={worker.id}
                worker={worker}
                dates={dates}
                cells={cells}
                today={today}
                timeStyle={timeStyle}
                metrics={metrics}
                onPressCell={onPressCell}
              />
            ))}
      </ScrollView>
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
    flexShrink: 1,
  },
  body: { paddingBottom: 2 },
});
