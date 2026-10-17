import { type ReactNode, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeInLeft, FadeInRight } from 'react-native-reanimated';

import { type ISODate, type TimeStyle, weekDates } from '@/lib/date';
import type { CalendarEvent, CellValue, Worker } from '@/store/types';
import { colors, radius } from '@/theme/tokens';

import { cellAtPoint } from './cellAtPoint';
import { DayHeaderRow } from './DayHeaderRow';
import { EventBands } from './EventBands';
import { layoutEventLanes } from './eventLanes';
import { WorkerRow } from './WorkerRow';
import type { GridMetrics } from './useGridMetrics';

/** 이만큼 꾹 누르면 "끌어서 복사"가 시작된다 */
export const PAINT_LONG_PRESS_MS = 280;

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
  /** 꾹 누른 칸에서 끌어서 복사 시작/이동/끝 */
  onPaintStart?: (workerId: string, date: ISODate) => void;
  onPaintMove?: (workerId: string, date: ISODate) => void;
  onPaintEnd?: () => void;
  /** 복사 중이면 표 스크롤을 잠근다 */
  painting?: boolean;
  /** 복사 원본 칸 키 (테두리 강조) */
  paintSourceKey?: string | null;
  /** 근무자가 없을 때 표 자리에 보여줄 내용 */
  emptyContent?: ReactNode;
  /** 주 이동 방향 (1 다음, -1 이전, 0 없음) — 행 영역 슬라이드 */
  transition?: 0 | 1 | -1;
}

/** 행사 띠(카드 위) → 날짜 헤더 → 근무자 행이 한 카드. 엑셀 근무표와 같은 구조 */
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
  onPaintStart,
  onPaintMove,
  onPaintEnd,
  painting = false,
  paintSourceKey = null,
  emptyContent,
  transition = 0,
}: WeekGridProps) {
  const dates = useMemo(() => weekDates(weekStart), [weekStart]);
  const lanes = useMemo(() => layoutEventLanes(events, weekStart), [events, weekStart]);

  // 꾹 누른 뒤 끌면 좌표로 칸을 찾아 복사 콜백을 부른다
  const pan = useMemo(() => {
    const resolve = (x: number, y: number) => {
      const p = cellAtPoint(x, y, metrics, workers.length);
      return p ? { workerId: workers[p.row].id, date: dates[p.col] } : null;
    };
    return Gesture.Pan()
      .enabled(!!onPaintStart)
      .runOnJS(true)
      .maxPointers(1)
      .activateAfterLongPress(PAINT_LONG_PRESS_MS)
      .shouldCancelWhenOutside(false)
      .onStart((e) => {
        const c = resolve(e.x, e.y);
        if (c) onPaintStart?.(c.workerId, c.date);
      })
      .onUpdate((e) => {
        const c = resolve(e.x, e.y);
        if (c) onPaintMove?.(c.workerId, c.date);
      })
      .onFinalize(() => onPaintEnd?.());
  }, [metrics, workers, dates, onPaintStart, onPaintMove, onPaintEnd]);

  return (
    <View style={[styles.wrap, { width: metrics.tableWidth + 2 }]}>
      <EventBands
        items={lanes.items}
        laneCount={lanes.laneCount}
        metrics={metrics}
        onPressEvent={onPressEvent}
      />
      <View style={styles.card}>
        <DayHeaderRow dates={dates} today={today} metrics={metrics} />
        <ScrollView
          bounces={false}
          scrollEnabled={!painting}
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}>
          <GestureDetector gesture={pan}>
            <Animated.View
              key={weekStart}
              entering={
                transition === 0
                  ? undefined
                  : transition > 0
                    ? FadeInRight.duration(220)
                    : FadeInLeft.duration(220)
              }>
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
                      paintSourceKey={paintSourceKey}
                    />
                  ))}
            </Animated.View>
          </GestureDetector>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'center', flexShrink: 1 },
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surface.border,
    overflow: 'hidden',
    flexShrink: 1,
  },
  body: { paddingBottom: 2 },
});
