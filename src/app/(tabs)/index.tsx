import { router } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { CardEditorModal, type CardEditorState } from '@/features/cards/CardEditorModal';
import { EventSheet, type EventSheetState } from '@/features/events/EventSheet';
import { CardPalette } from '@/features/schedule/CardPalette';
import { CellEditorSheet, type CellTarget } from '@/features/schedule/CellEditorSheet';
import { EmptyState } from '@/features/schedule/EmptyState';
import { cellLabel } from '@/features/schedule/ScheduleCell';
import { WeekActionsSheet } from '@/features/schedule/WeekActionsSheet';
import { WeekGrid } from '@/features/schedule/WeekGrid';
import { WeekHeader } from '@/features/schedule/WeekHeader';
import { useGridMetrics } from '@/features/schedule/useGridMetrics';
import { cellKey, type ISODate, todayISO, weekDates } from '@/lib/date';
import { impactHaptic, successHaptic, tapHaptic } from '@/lib/haptics';
import {
  useActiveWorkers,
  useCells,
  useEvents,
  useSettings,
  useTimeCards,
} from '@/store/selectors';
import type { CalendarEvent, Card, CellValue } from '@/store/types';
import { cellFromCard, currentWeekStart, useAppStore } from '@/store/useAppStore';
import { useBrush } from '@/store/useBrush';
import { useWeekView } from '@/store/useWeekView';
import { colors, fonts, radius, spacing } from '@/theme/tokens';

/** 이 안에 같은 칸을 다시 누르면 "두 번 누름" */
const DOUBLE_TAP_MS = 320;

interface PaintState {
  sourceKey: string;
  label: string;
}

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
  const timeCards = useTimeCards();
  const seedSample = useAppStore((s) => s.seedSample);
  const setCellCard = useAppStore((s) => s.setCellCard);
  const setCellValue = useAppStore((s) => s.setCellValue);
  const clearCell = useAppStore((s) => s.clearCell);
  const brushTool = useBrush((s) => s.tool);
  const brushCardId = useBrush((s) => s.cardId);

  const [editing, setEditing] = useState<CellTarget | null>(null);
  const [cardEditor, setCardEditor] = useState<CardEditorState>(null);
  const [eventSheet, setEventSheet] = useState<EventSheetState>(null);
  const [weekActions, setWeekActions] = useState(false);
  const [paint, setPaint] = useState<PaintState | null>(null);
  /** "새 카드"로 만든 카드를 바로 넣을 칸 */
  const pendingCell = useRef<CellTarget | null>(null);
  /** 두 번 누름 판정 + 첫 탭이 넣은 값 되돌리기 */
  const lastTap = useRef<{ key: string; time: number; prev: CellValue | undefined } | null>(null);
  /** 끌어서 복사 진행 상태 */
  const painting = useRef<{ value: CellValue | undefined; visited: Set<string> } | null>(null);
  /** 복사가 끝난 직후 따라오는 탭(웹에서 손을 뗀 칸의 click)은 무시 */
  const paintEndedAt = useRef(0);

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

  /** 카드 줄에서 고른 카드 (지워졌으면 첫 시간 카드) */
  const resolveBrushCard = useCallback((): Card | null => {
    const all = useAppStore.getState().cards;
    return all.find((c) => c.id === brushCardId) ?? timeCards[0] ?? null;
  }, [brushCardId, timeCards]);

  // 한 번: 고른 카드 넣기 / 두 번: 첫 탭 되돌리고 편집 시트 / "직접 입력" 도구: 바로 편집 시트
  const onPressCell = useCallback(
    (workerId: string, date: ISODate) => {
      const now = Date.now();
      if (painting.current || now - paintEndedAt.current < 500) return;
      const key = cellKey(workerId, date);
      const last = lastTap.current;
      if (last && last.key === key && now - last.time < DOUBLE_TAP_MS) {
        lastTap.current = null;
        setCellValue(workerId, date, last.prev);
        setEditing({ workerId, date });
        return;
      }
      lastTap.current = { key, time: now, prev: useAppStore.getState().cells[key] };
      if (brushTool === 'edit') {
        setEditing({ workerId, date });
        return;
      }
      tapHaptic();
      if (brushTool === 'erase') {
        clearCell(workerId, date);
        return;
      }
      const card = resolveBrushCard();
      if (card) setCellCard(workerId, date, card);
    },
    [brushTool, clearCell, resolveBrushCard, setCellCard, setCellValue],
  );

  // 꾹 누른 칸의 카드를 들고(비었으면 고른 카드), 끌면서 지나는 칸에 복사
  const onPaintStart = useCallback(
    (workerId: string, date: ISODate) => {
      const key = cellKey(workerId, date);
      const source = useAppStore.getState().cells[key];
      let value: CellValue | undefined = source;
      if (!source && brushTool !== 'erase') {
        const card = resolveBrushCard();
        if (!card) return;
        value = cellFromCard(card);
        setCellValue(workerId, date, value);
      }
      painting.current = { value, visited: new Set([key]) };
      lastTap.current = null;
      setPaint({ sourceKey: key, label: value ? cellLabel(value, settings.timeStyle) : '' });
      impactHaptic();
    },
    [brushTool, resolveBrushCard, setCellValue, settings.timeStyle],
  );
  const onPaintMove = useCallback(
    (workerId: string, date: ISODate) => {
      const p = painting.current;
      if (!p) return;
      const key = cellKey(workerId, date);
      if (p.visited.has(key)) return;
      p.visited.add(key);
      setCellValue(workerId, date, p.value ? { ...p.value } : undefined);
      tapHaptic();
    },
    [setCellValue],
  );
  const onPaintEnd = useCallback(() => {
    const p = painting.current;
    if (!p) return;
    painting.current = null;
    paintEndedAt.current = Date.now();
    setPaint(null);
    if (p.visited.size > 1) successHaptic();
  }, []);

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

  const hasWorkers = workers.length > 0;

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
        onMore={hasWorkers ? () => setWeekActions(true) : undefined}
        onShare={
          hasWorkers
            ? () => router.push({ pathname: '/share', params: { week: weekStart } })
            : undefined
        }
      />
      {hasWorkers ? (
        <CardPalette
          onManageCards={() => router.push({ pathname: '/manage', params: { tab: 'cards' } })}
        />
      ) : null}
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
          onPaintStart={hasWorkers ? onPaintStart : undefined}
          onPaintMove={onPaintMove}
          onPaintEnd={onPaintEnd}
          painting={!!paint}
          paintSourceKey={paint?.sourceKey ?? null}
          emptyContent={
            <EmptyState
              onAddWorker={() => router.push({ pathname: '/manage', params: { add: '1' } })}
              onSeedSample={seedSample}
            />
          }
        />
        {paint ? (
          <Animated.View
            pointerEvents="none"
            entering={FadeInDown.duration(160)}
            exiting={FadeOut.duration(120)}
            style={styles.paintBadge}>
            <AppText style={styles.paintText}>
              {paint.label
                ? `'${paint.label}' 복사 중 · 끌어서 칸을 채우세요`
                : '지우는 중 · 끌어서 칸을 비우세요'}
            </AppText>
          </Animated.View>
        ) : null}
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
  paintBadge: {
    position: 'absolute',
    bottom: spacing.lg,
    alignSelf: 'center',
    backgroundColor: colors.text.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  paintText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    lineHeight: 16,
    color: colors.text.inverse,
  },
});
