import { useShallow } from 'zustand/react/shallow';

import type { AppStore } from './useAppStore';
import { sortByOrder, useAppStore } from './useAppStore';

export const selectActiveWorkers = (s: AppStore) => sortByOrder(s.workers.filter((w) => w.active));
export const selectAllWorkers = (s: AppStore) => sortByOrder(s.workers);
export const selectTimeCards = (s: AppStore) =>
  sortByOrder(s.cards.filter((c) => c.kind === 'time'));
export const selectStatusCards = (s: AppStore) =>
  sortByOrder(s.cards.filter((c) => c.kind === 'status'));
export const selectSettings = (s: AppStore) => s.settings;
export const selectEvents = (s: AppStore) => s.events;
export const selectCells = (s: AppStore) => s.cells;

/**
 * 새 배열을 만들어 돌려주는 선택자는 useShallow로 감싸야 한다.
 * zustand v5는 참조 비교만 하므로, 그냥 쓰면 렌더마다 새 배열 → 무한 렌더(React #185).
 */
export const useActiveWorkers = () => useAppStore(useShallow(selectActiveWorkers));
export const useAllWorkers = () => useAppStore(useShallow(selectAllWorkers));
export const useTimeCards = () => useAppStore(useShallow(selectTimeCards));
export const useStatusCards = () => useAppStore(useShallow(selectStatusCards));
export const useSettings = () => useAppStore(selectSettings);
export const useEvents = () => useAppStore(selectEvents);
export const useCells = () => useAppStore(selectCells);
