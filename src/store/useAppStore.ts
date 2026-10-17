import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { buildDefaultCards, GORAEIT_EVENT_TITLE } from '@/features/cards/defaultCards';
import { cellKey, type ISODate, shiftWeek, startOfWeekISO, todayISO, weekDates } from '@/lib/date';
import { newId } from '@/lib/id';
import { colors, gradients } from '@/theme/tokens';

import {
  SCHEMA_VERSION,
  type CalendarEvent,
  type Card,
  type CellValue,
  type PersistedState,
  type Settings,
  type Worker,
} from './types';

export interface AppActions {
  addWorker: (name: string) => string;
  renameWorker: (id: string, name: string) => void;
  moveWorker: (id: string, direction: -1 | 1) => void;
  setWorkerActive: (id: string, active: boolean) => void;
  removeWorker: (id: string) => void;
  setCellCard: (workerId: string, date: ISODate, card: Card) => void;
  setCellTime: (workerId: string, date: ISODate, time: string, endTime?: string) => void;
  clearCell: (workerId: string, date: ISODate) => void;
  upsertCard: (
    card: Omit<Card, 'order' | 'builtIn'> & Partial<Pick<Card, 'order' | 'builtIn'>>,
  ) => void;
  deleteCard: (id: string) => void;
  upsertEvent: (event: Omit<CalendarEvent, 'id'> & { id?: string }) => string;
  deleteEvent: (id: string) => void;
  copyPreviousWeek: (weekStart: ISODate) => void;
  /** from 주의 칸을 to 주에 그대로 복사 (to 주의 기존 칸은 덮어쓰고, from이 빈 칸은 지운다) */
  copyWeek: (fromWeekStart: ISODate, toWeekStart: ISODate) => void;
  clearWeek: (weekStart: ISODate) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  importBackup: (data: PersistedState) => void;
  seedSample: () => void;
  resetAll: () => void;
}

export type AppStore = PersistedState & AppActions;

export const DEFAULT_SETTINGS: Settings = {
  storeName: '이마트 퀵커머스',
  timeStyle: 'compact',
  onboarded: false,
};

export function initialState(): PersistedState {
  return {
    version: SCHEMA_VERSION,
    workers: [],
    cards: buildDefaultCards(),
    events: [],
    cells: {},
    settings: DEFAULT_SETTINGS,
  };
}

export function sortByOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

export function cellFromCard(card: Card): CellValue {
  return {
    cardId: card.id,
    kind: card.kind,
    label: card.label,
    time: card.time,
    endTime: card.endTime,
    bg: card.bg,
    bg2: card.bg2,
    fg: card.fg,
  };
}

export function customTimeCell(time: string, endTime?: string): CellValue {
  return {
    cardId: null,
    kind: 'time',
    label: time,
    time,
    endTime,
    bg: colors.surface.card,
    fg: colors.text.primary,
  };
}

/** 가져온 백업을 현재 스키마에 맞춰 정리 (알 수 없는 필드는 버림) */
export function normalizeImported(data: PersistedState): PersistedState {
  const base = initialState();
  return {
    version: SCHEMA_VERSION,
    workers: Array.isArray(data.workers) ? data.workers : base.workers,
    cards: Array.isArray(data.cards) && data.cards.length > 0 ? data.cards : base.cards,
    events: Array.isArray(data.events) ? data.events : base.events,
    cells: data.cells && typeof data.cells === 'object' ? data.cells : base.cells,
    settings: { ...base.settings, ...(data.settings ?? {}), onboarded: true },
  };
}

/** 처음 써보는 사람을 위한 예시 데이터 (이번 주 기준) */
export function buildSample(now: Date = new Date()): PersistedState {
  const base = initialState();
  const cards = base.cards;
  const byId = (id: string) => cards.find((c) => c.id === id)!;
  const names = ['김민준', '이서연', '박지후', '최수아', '정하준'];
  const workers: Worker[] = names.map((name, i) => ({
    id: `w_sample_${i + 1}`,
    name,
    order: i,
    active: true,
  }));
  const weekStart = startOfWeekISO(now);
  const dates = weekDates(weekStart);
  // 열: 일 월 화 수 목 금 토
  const pattern: string[][] = [
    [
      'time_1000',
      'time_1000',
      'status_yeoncha',
      'status_jeongil',
      'time_1300',
      'time_1000',
      'status_jeongil',
    ],
    [
      'time_1400',
      'status_jeongil',
      'time_1000',
      'time_1000',
      'status_jeongil',
      'time_1400',
      'time_1000',
    ],
    [
      'status_jeongil',
      'time_1530',
      'time_1530',
      'time_1530',
      'status_jeongil',
      'time_1530',
      'time_1530',
    ],
    [
      'status_jeongil',
      'time_1900',
      'time_1900',
      'time_1900',
      'time_1900',
      'status_jeongil',
      'status_jeongil',
    ],
    [
      'time_1300',
      'status_jeongil',
      'status_jeongil',
      'status_jeongil',
      'status_jeongil',
      'status_jeongil',
      'time_1300',
    ],
  ];
  const cells: Record<string, CellValue> = {};
  workers.forEach((w, row) => {
    dates.forEach((date, col) => {
      cells[cellKey(w.id, date)] = cellFromCard(byId(pattern[row][col]));
    });
  });
  // 범위 입력 예시: 1400~22
  cells[cellKey(workers[1].id, dates[0])] = customTimeCell('1400', '2200');
  const events: CalendarEvent[] = [
    {
      id: 'ev_sample_goraeit',
      title: GORAEIT_EVENT_TITLE,
      start: dates[2],
      end: dates[5],
      color: gradients.event[0],
      color2: gradients.event[1],
      icon: 'star',
    },
  ];
  return { ...base, workers, cells, events, settings: { ...base.settings, onboarded: true } };
}

/** localStorage가 막힌 환경(샌드박스 iframe, 프라이빗 모드)에서도 앱이 멈추지 않도록 실패를 삼킨다 */
const safeStorage = {
  getItem: async (name: string) => {
    try {
      return await AsyncStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string) => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch {
      /* 저장 불가 환경: 메모리로만 동작 */
    }
  },
  removeItem: async (name: string) => {
    try {
      await AsyncStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState(),

      addWorker: (name) => {
        const id = newId('w');
        set((s) => ({
          workers: [...s.workers, { id, name: name.trim(), order: s.workers.length, active: true }],
        }));
        return id;
      },
      renameWorker: (id, name) =>
        set((s) => ({
          workers: s.workers.map((w) => (w.id === id ? { ...w, name: name.trim() } : w)),
        })),
      moveWorker: (id, direction) =>
        set((s) => {
          const sorted = sortByOrder(s.workers);
          const i = sorted.findIndex((w) => w.id === id);
          const j = i + direction;
          if (i < 0 || j < 0 || j >= sorted.length) return {};
          [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
          return { workers: sorted.map((w, idx) => ({ ...w, order: idx })) };
        }),
      setWorkerActive: (id, active) =>
        set((s) => ({ workers: s.workers.map((w) => (w.id === id ? { ...w, active } : w)) })),
      removeWorker: (id) =>
        set((s) => {
          const cells = { ...s.cells };
          for (const key of Object.keys(cells)) if (key.startsWith(`${id}|`)) delete cells[key];
          return {
            workers: sortByOrder(s.workers.filter((w) => w.id !== id)).map((w, idx) => ({
              ...w,
              order: idx,
            })),
            cells,
          };
        }),

      setCellCard: (workerId, date, card) =>
        set((s) => ({ cells: { ...s.cells, [cellKey(workerId, date)]: cellFromCard(card) } })),
      setCellTime: (workerId, date, time, endTime) =>
        set((s) => ({
          cells: { ...s.cells, [cellKey(workerId, date)]: customTimeCell(time, endTime) },
        })),
      clearCell: (workerId, date) =>
        set((s) => {
          const key = cellKey(workerId, date);
          if (!(key in s.cells)) return {};
          const cells = { ...s.cells };
          delete cells[key];
          return { cells };
        }),

      upsertCard: (card) =>
        set((s) => {
          const existing = s.cards.find((c) => c.id === card.id);
          if (existing)
            return { cards: s.cards.map((c) => (c.id === card.id ? { ...existing, ...card } : c)) };
          const order = card.order ?? Math.max(-1, ...s.cards.map((c) => c.order)) + 1;
          return { cards: [...s.cards, { builtIn: false, ...card, order }] };
        }),
      deleteCard: (id) => set((s) => ({ cards: s.cards.filter((c) => c.id !== id) })),

      upsertEvent: (event) => {
        const id = event.id ?? newId('ev');
        set((s) => {
          const next: CalendarEvent = {
            id,
            title: event.title.trim() || GORAEIT_EVENT_TITLE,
            start: event.start <= event.end ? event.start : event.end,
            end: event.start <= event.end ? event.end : event.start,
            color: event.color,
            color2: event.color2,
            icon: event.icon,
          };
          const exists = s.events.some((e) => e.id === id);
          return {
            events: exists ? s.events.map((e) => (e.id === id ? next : e)) : [...s.events, next],
          };
        });
        return id;
      },
      deleteEvent: (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),

      copyPreviousWeek: (weekStart) => get().copyWeek(shiftWeek(weekStart, -1), weekStart),
      copyWeek: (fromWeekStart, toWeekStart) =>
        set((s) => {
          if (fromWeekStart === toWeekStart) return {};
          const cells = { ...s.cells };
          const srcDates = weekDates(fromWeekStart);
          const dstDates = weekDates(toWeekStart);
          for (const w of s.workers) {
            for (let i = 0; i < 7; i++) {
              const src = s.cells[cellKey(w.id, srcDates[i])];
              const key = cellKey(w.id, dstDates[i]);
              if (src) cells[key] = { ...src };
              else delete cells[key];
            }
          }
          return { cells };
        }),
      clearWeek: (weekStart) =>
        set((s) => {
          const cells = { ...s.cells };
          for (const w of s.workers)
            for (const date of weekDates(weekStart)) delete cells[cellKey(w.id, date)];
          return { cells };
        }),

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      importBackup: (data) => set(() => normalizeImported(data)),
      seedSample: () => set(() => buildSample()),
      resetAll: () => set(() => initialState()),
    }),
    {
      name: 'quickcalendar/v1',
      version: SCHEMA_VERSION,
      storage: createJSONStorage(() => safeStorage),
      partialize: (s): PersistedState => ({
        version: s.version,
        workers: s.workers,
        cards: s.cards,
        events: s.events,
        cells: s.cells,
        settings: s.settings,
      }),
    },
  ),
);

/** 오늘이 속한 주의 시작일 — 화면 초기값 */
export function currentWeekStart(): ISODate {
  return startOfWeekISO(todayISO());
}
