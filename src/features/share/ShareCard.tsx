import type { ComponentRef, Ref } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { GradientFill } from '@/components/ui/GradientFill';
import { DayHeaderRow } from '@/features/schedule/DayHeaderRow';
import { EventBands } from '@/features/schedule/EventBands';
import { WorkerRow } from '@/features/schedule/WorkerRow';
import { layoutEventLanes } from '@/features/schedule/eventLanes';
import { computeGridMetrics } from '@/features/schedule/useGridMetrics';
import { type ISODate, type TimeStyle, weekDates, weekTitle } from '@/lib/date';
import type { CalendarEvent, CellValue, Worker } from '@/store/types';
import { colors, fonts, radius, spacing } from '@/theme/tokens';

import { collectLegend } from './legend';

export const SHARE_CARD_WIDTH = 400;
const PADDING = spacing.lg;

export interface ShareCardProps {
  weekStart: ISODate;
  workers: Worker[];
  cells: Record<string, CellValue>;
  events: CalendarEvent[];
  timeStyle: TimeStyle;
  storeName: string;
  generatedAt: string;
  width?: number;
  /** captureRef 대상 */
  ref?: Ref<ComponentRef<typeof View>>;
  onLayoutHeight?: (height: number) => void;
}

/**
 * 카톡으로 보내는 이미지 한 장. 고정 폭(400pt)으로 그리고 3배로 캡처한다.
 * 화면 그리드와 같은 컴포넌트를 쓰되 오늘 표시·터치는 없다.
 */
export function ShareCard({
  weekStart,
  workers,
  cells,
  events,
  timeStyle,
  storeName,
  generatedAt,
  width = SHARE_CARD_WIDTH,
  ref,
  onLayoutHeight,
}: ShareCardProps) {
  const metrics = computeGridMetrics(width - PADDING * 2 - 2, 64);
  const dates = weekDates(weekStart);
  const lanes = layoutEventLanes(events, weekStart);
  const legend = collectLegend(cells, workers, dates);

  return (
    <View
      ref={ref}
      collapsable={false}
      onLayout={(e) => onLayoutHeight?.(e.nativeEvent.layout.height)}
      style={[styles.card, { width }]}>
      <View style={styles.titleRow}>
        <View style={styles.titleText}>
          <AppText style={styles.store} numberOfLines={1}>
            {storeName}
          </AppText>
          <AppText variant="caption" color={colors.text.secondary}>
            {weekTitle(weekStart)}
          </AppText>
        </View>
        <View style={styles.titleBadge}>
          <AppText style={styles.badgeText}>근무표</AppText>
        </View>
      </View>

      <View style={[styles.tableWrap, { width: metrics.tableWidth + 2 }]}>
        <EventBands items={lanes.items} laneCount={lanes.laneCount} metrics={metrics} compact />
        <View style={styles.table}>
          <DayHeaderRow dates={dates} today="" metrics={metrics} />
          {workers.map((worker) => (
            <WorkerRow
              key={worker.id}
              worker={worker}
              dates={dates}
              cells={cells}
              today=""
              timeStyle={timeStyle}
              metrics={metrics}
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.legend}>
          {legend.map((item) => (
            <GradientFill
              key={`${item.label}-${item.bg}`}
              colors={[item.bg, item.bg2]}
              style={styles.legendChip}>
              <AppText style={styles.legendText} color={item.fg}>
                {item.label}
              </AppText>
            </GradientFill>
          ))}
          <AppText variant="caption" color={colors.text.tertiary}>
            숫자 = 출근 시각 (~퇴근)
          </AppText>
        </View>
        <AppText variant="caption" color={colors.text.tertiary}>
          {generatedAt} · 퀵캘린더
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface.card, padding: PADDING, gap: spacing.md },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  titleText: { flex: 1, gap: 2 },
  store: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 26, color: colors.text.primary },
  titleBadge: {
    backgroundColor: colors.brand.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: { fontFamily: fonts.bold, fontSize: 13, lineHeight: 16, color: colors.text.onPrimary },
  tableWrap: { alignSelf: 'center' },
  table: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surface.border,
    overflow: 'hidden',
  },
  footer: { gap: spacing.xs },
  legend: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  legendChip: { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  legendText: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 16 },
});
