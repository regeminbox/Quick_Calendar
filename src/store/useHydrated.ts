import { useSyncExternalStore } from 'react';

import { useAppStore } from './useAppStore';

const subscribe = (onChange: () => void) => useAppStore.persist.onFinishHydration(onChange);
const getSnapshot = () => useAppStore.persist.hasHydrated();

/** AsyncStorage에서 저장된 근무표가 복원됐는지 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
