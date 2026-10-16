import { router } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CardEditorModal, type CardEditorState } from '@/features/cards/CardEditorModal';
import { EventSheet, type EventSheetState } from '@/features/events/EventSheet';
import { CellEditorSheet, type CellTarget } from '@/features/schedule/CellEditorSheet';
import { EmptyState } from '@/features/schedule/EmptyState';
import { WeekActionsSheet } from '@/features/schedule/WeekActionsSheet';
import { WeekGrid } from '@/features/schedule/WeekGrid';
import { WeekHeader } from '@/features/schedule/WeekHeader';
import { useGridMetrics } from '@/features/schedule/useGridMetrics';
import { cellKey, type ISODate, todayISO, weekDates } from '@/lib/date';
import { tapHaptic } from '@/lib/haptics';
import { useActiveWorkers, useCells, useEvents, useSettings } from '@/store/selectors';
import type { CalendarEvent, Card } from '@/store/types';
import { currentWeekStart, useAppStore } from '@/store/useAppStore';
import { useWeekView } from '@/store/useWeekView';
import { colors, spacing } from '@/theme/tokens';

export default function ScheduleScreen() {
  // 보고 있는 주는 캘린더 페이지와 공유하므로 작은 스토어에 둔다
  const weekStart = useWeekView((s) => s.start);
  const weekDir = useWeekView((s) => s.dir);
  const shiftWeekView = useWeekView((s) => s.shift);
  const goTodayWeek = useWeekView((s) => s.today);
  const today = useMemo(() => todayISO(), []);
  const metrics = useGridMetrics();

  const workers = useActiveWorkers();
  const cells = useCells();
  const events = useEvents();
  const settings = useSettings();
  const seedSample = useAppStore((s) => s.seedSample);
  const setCellCard = useAppStore((s) => s.setCellCard);

  const [editing, setEditing] = useState<CellTarget | null>(null);
  const [cardEditor, setCardEditor] = useState<CardEditorState>(null);
  const [eventSheet, setEventSheet] = useState<EventSheetState>(null);
  const [weekActions, setWeekActions] = useState(false);
  /** "새 카드"로 만든 카드를 바로 넣을 칸 */
  const pendingCell = useRef<CellTarget | null>(null);

  const filledCount = useMemo(() => {
    const dates = weekDates(weekStart);
    let n = 0;
    for (const w of workers) for (const d of dates) if (cells[cellKey(w.id, d)]) n++;
    return n;
  }, [cells, workers, weekStart]);

  const goPrev = useCallback(() => {
    tapHaptic();
    shiftWeekView(-1);
  }, [shiftWeekView]);
  const goNext = useCallback(() => {
    tapHaptic();
    shiftWeekView(1);
  }, [shiftWeekView]);
  const goToday = useCallback(() => {
    tapHaptic();
    goTodayWeek();
  }, [goTodayWeek]);
  const openCalendar = useCallback(() => {
    tapHaptic();
    router.push('/calendar');
  }, []);

  const onPressCell = useCallback(
    (workerId: string, date: ISODate) => setEditing({ workerId, date }),
    [],
  );
  const onPressEvent = useCallback(
    (event: CalendarEvent) => setEventSheet({ mode: 'edit', event }),
    [],
  );

  const requestNewCard = useCallback(() => {
    pendingCell.current = editing;
    setEditing(null);
    // 시트가 닫힌 뒤 열어야 iOS에서 모달이 겹치지 않는다
    setTimeout(() => setCardEditor({ mode: 'new', kind: 'status' }), 350);
  }, [editing]);

  const onCardSaved = useCallback(
    (card: Card) => {
      const target = pendingCell.current;
      if (target) setCellCard(target.workerId, target.date, card);
      pendingCell.current = null;
    },
    [setCellCard],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <WeekHeader
        weekStart={weekStart}
        isCurrentWeek={weekStart === currentWeekStart()}
        onPrev={goPrev}
        onNext={goNext}
        onToday={goToday}
        onPressTitle={openCalendar}
        onAddEvent={() => setEventSheet({ mode: 'new', weekStart })}
        onMore={workers.length > 0 ? () => setWeekActions(true) : undefined}
        onShare={
          workers.length > 0
            ? () => router.push({ pathname: '/share', params: { week: weekStart } })
            : undefined
        }
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
          transition={weekDir}
          onPressCell={onPressCell}
          onPressEvent={onPressEvent}
          emptyContent={
            <EmptyState
              onAddWorker={() => router.push({ pathname: '/manage', params: { add: '1' } })}
              onSeedSample={seedSample}
            />
          }
        />
      </View>
      <WeekActionsSheet
        visible={weekActions}
        weekStart={weekStart}
        filledCount={filledCount}
        onClose={() => setWeekActions(false)}
      />
      <EventSheet state={eventSheet} onClose={() => setEventSheet(null)} />
      <CellEditorSheet
        target={editing}
        onClose={() => setEditing(null)}
        onRequestNewCard={requestNewCard}
      />
      <CardEditorModal
        state={cardEditor}
        onClose={() => {
          setCardEditor(null);
          pendingCell.current = null;
        }}
        onSaved={onCardSaved}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.bg },
  gridWrap: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
});
