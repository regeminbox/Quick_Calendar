import { Pressable, StyleSheet, View } from 'react-native';

import { SparkleIcon } from '@/components/icons';
import { AppText } from '@/components/ui/AppText';
import type { CalendarEvent } from '@/store/types';
import { colors, fonts, grid, radius } from '@/theme/tokens';

import type { EventLaneItem } from './eventLanes';
import type { GridMetrics } from './useGridMetrics';

export interface EventBandsProps {
  items: EventLaneItem[];
  laneCount: number;
  metrics: GridMetrics;
  onPressEvent?: (event: CalendarEvent) => void;
  /** 공유 이미지처럼 상호작용 없이 그릴 때 */
  compact?: boolean;
}

/** 날짜 헤더 위, 행사 기간에 해당하는 열만 노란 띠로 덮는다 (예: 고래잇 행사 3일~6일) */
export function EventBands({ items, laneCount, metrics, onPressEvent, compact = false }: EventBandsProps) {
  if (laneCount === 0) return null;
  const laneHeight = metrics.bandHeight + grid.gap;
  return (
    <View style={[styles.wrap, { height: laneCount * laneHeight + grid.gap, width: metrics.tableWidth }]}>
      {items.map(({ event, from, to, lane }) => {
        const left = metrics.nameColWidth + from * metrics.dayColWidth + grid.gap;
        const width = (to - from + 1) * metrics.dayColWidth - grid.gap * 2;
        const top = grid.gap + lane * laneHeight;
        const band = (
          <View style={[styles.band, { backgroundColor: event.color, height: metrics.bandHeight }]}>
            {event.icon === 'star' ? <SparkleIcon size={13} /> : null}
            <AppText numberOfLines={1} style={styles.title}>
              {event.title}
            </AppText>
          </View>
        );
        return (
          <View key={event.id} style={{ position: 'absolute', left, top, width }}>
            {compact || !onPressEvent ? (
              band
            ) : (
              <Pressable onPress={() => onPressEvent(event)} accessibilityRole="button" accessibilityLabel={`${event.title} 수정`}>
                {({ pressed }) => <View style={{ opacity: pressed ? 0.7 : 1 }}>{band}</View>}
              </Pressable>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.surface.card },
  band: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
  },
  title: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 14, color: colors.text.onYellow },
});
