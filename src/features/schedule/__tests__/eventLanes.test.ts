import { describe, expect, it } from '@jest/globals';

import type { CalendarEvent } from '@/store/types';

import { layoutEventLanes } from '../eventLanes';

const ev = (id: string, start: string, end: string): CalendarEvent => ({
  id,
  title: id,
  start,
  end,
  color: '#FFD200',
  icon: 'star',
});

describe('layoutEventLanes', () => {
  it('고래잇 행사 11/3~11/6 → 한 줄, 2~5열', () => {
    const { items, laneCount } = layoutEventLanes([ev('a', '2026-11-03', '2026-11-06')], '2026-11-01');
    expect(laneCount).toBe(1);
    expect(items).toEqual([expect.objectContaining({ from: 2, to: 5, lane: 0 })]);
  });

  it('겹치는 행사는 다음 줄로', () => {
    const { items, laneCount } = layoutEventLanes(
      [ev('a', '2026-11-03', '2026-11-06'), ev('b', '2026-11-05', '2026-11-07'), ev('c', '2026-11-01', '2026-11-02')],
      '2026-11-01',
    );
    expect(laneCount).toBe(2);
    const lanes = Object.fromEntries(items.map((i) => [i.event.id, i.lane]));
    expect(lanes.c).toBe(0);
    expect(lanes.a).toBe(0);
    expect(lanes.b).toBe(1);
  });

  it('이번 주에 없는 행사는 제외', () => {
    const { items, laneCount } = layoutEventLanes([ev('a', '2026-11-10', '2026-11-12')], '2026-11-01');
    expect(items).toHaveLength(0);
    expect(laneCount).toBe(0);
  });
});
