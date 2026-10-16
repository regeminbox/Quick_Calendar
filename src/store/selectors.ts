import type { AppStore } from './useAppStore';
import { sortByOrder } from './useAppStore';

export const selectActiveWorkers = (s: AppStore) => sortByOrder(s.workers.filter((w) => w.active));
export const selectAllWorkers = (s: AppStore) => sortByOrder(s.workers);
export const selectTimeCards = (s: AppStore) => sortByOrder(s.cards.filter((c) => c.kind === 'time'));
export const selectStatusCards = (s: AppStore) => sortByOrder(s.cards.filter((c) => c.kind === 'status'));
export const selectSettings = (s: AppStore) => s.settings;
export const selectEvents = (s: AppStore) => s.events;
export const selectCells = (s: AppStore) => s.cells;
