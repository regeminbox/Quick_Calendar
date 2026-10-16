import { eventColumnRange, type ISODate } from '@/lib/date';
import type { CalendarEvent } from '@/store/types';

export interface EventLaneItem {
  event: CalendarEvent;
  /** 주 안에서의 열 범위 (0=일 … 6=토) */
  from: number;
  to: number;
  lane: number;
}

/**
 * 이번 주에 걸치는 행사들을 겹치지 않게 줄(lane)에 배치한다.
 * 보통 행사는 하나라 lane 0 한 줄이지만, 겹치면 줄이 늘어난다.
 */
export function layoutEventLanes(
  events: CalendarEvent[],
  weekStart: ISODate,
): { items: EventLaneItem[]; laneCount: number } {
  const ranged = events
    .map((event) => ({ event, range: eventColumnRange(event, weekStart) }))
    .filter((x): x is { event: CalendarEvent; range: { from: number; to: number } } => x.range !== null)
    .sort((a, b) => a.range.from - b.range.from || a.range.to - b.range.to || a.event.title.localeCompare(b.event.title));

  const laneEnds: number[] = [];
  const items: EventLaneItem[] = [];
  for (const { event, range } of ranged) {
    let lane = laneEnds.findIndex((end) => end < range.from);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(range.to);
    } else {
      laneEnds[lane] = range.to;
    }
    items.push({ event, from: range.from, to: range.to, lane });
  }
  return { items, laneCount: laneEnds.length };
}
