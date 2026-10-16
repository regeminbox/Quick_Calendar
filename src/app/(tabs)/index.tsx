import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/features/schedule/EmptyState';
import { WeekGrid } from '@/features/schedule/WeekGrid';
import { WeekHeader } from '@/features/schedule/WeekHeader';
import { useGridMetrics } from '@/features/schedule/useGridMetrics';
import { shiftWeek, todayISO } from '@/lib/date';
import { useActiveWorkers, useCells, useEvents, useSettings } from '@/store/selectors';
import { currentWeekStart, useAppStore } from '@/store/useAppStore';
import { colors, spacing } from '@/theme/tokens';

export default function ScheduleScreen() {
  const [weekStart, setWeekStart] = useState(currentWeekStart);
  const today = useMemo(() => todayISO(), []);
  const metrics = useGridMetrics();

  const workers = useActiveWorkers();
  const cells = useCells();
  const events = useEvents();
  const settings = useSettings();
  const seedSample = useAppStore((s) => s.seedSample);

  const goPrev = useCallback(() => setWeekStart((w) => shiftWeek(w, -1)), []);
  const goNext = useCallback(() => setWeekStart((w) => shiftWeek(w, 1)), []);
  const goToday = useCallback(() => setWeekStart(currentWeekStart()), []);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <WeekHeader
        weekStart={weekStart}
        isCurrentWeek={weekStart === currentWeekStart()}
        onPrev={goPrev}
        onNext={goNext}
        onToday={goToday}
      />
      <View style={styles.gridWrap}>
        <WeekGrid
          weekStart={weekStart}
          today={today}
          workers={workers}
          cells={cells}
          events={events}
          timeStyle={settings.timeStyle}
          metrics={metrics}
          emptyContent={<EmptyState onAddWorker={() => router.push('/manage')} onSeedSample={seedSample} />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.bg },
  gridWrap: { flex: 1, paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.md },
});
