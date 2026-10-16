import { create } from 'zustand';

import { type ISODate, shiftWeek, startOfWeekISO, todayISO } from '@/lib/date';

type Dir = 0 | 1 | -1;

interface WeekViewState {
  /** 지금 보고 있는 주의 일요일 */
  start: ISODate;
  /** 마지막 이동 방향 — 그리드 슬라이드 애니메이션용 */
  dir: Dir;
  go: (start: ISODate) => void;
  shift: (delta: 1 | -1) => void;
  today: () => void;
}

function direction(from: ISODate, to: ISODate): Dir {
  if (from === to) return 0;
  return to > from ? 1 : -1;
}

/** 근무표 화면·캘린더 페이지가 함께 쓰는 "보고 있는 주". 저장하지 않는다 */
export const useWeekView = create<WeekViewState>((set) => ({
  start: startOfWeekISO(todayISO()),
  dir: 0,
  go: (start) => set((s) => ({ start, dir: direction(s.start, start) })),
  shift: (delta) => set((s) => ({ start: shiftWeek(s.start, delta), dir: delta })),
  today: () =>
    set((s) => {
      const start = startOfWeekISO(todayISO());
      return { start, dir: direction(s.start, start) };
    }),
}));
