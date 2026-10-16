import { addDays, addMonths, format, getDaysInMonth, startOfMonth } from 'date-fns';
import { router } from 'expo-router';
import { memo, useCallback, useMemo, useRef } from 'react';
import { FlatList, type ListRenderItemInfo, StyleSheet, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  withSpring,
  ZoomIn,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CalendarIcon, CloseIcon } from '@/components/icons';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { PressableScale } from '@/components/ui/PressableScale';
import {
  addDaysISO,
  fromISODate,
  type ISODate,
  parseCellKey,
  startOfWeekISO,
  todayISO,
  toISODate,
  WEEKDAY_KO,
  weekDates,
  weekRangeLabel,
} from '@/lib/date';
import { tapHaptic } from '@/lib/haptics';
import { useActiveWorkers, useCells, useEvents } from '@/store/selectors';
import type { CalendarEvent, CellValue } from '@/store/types';
import { useWeekView } from '@/store/useWeekView';
import { colors, fonts, radius, spacing } from '@/theme/tokens';

/** 앞뒤로 몇 달까지 한 번에 스크롤할 수 있게 둘지 (2년 + 2년) */
const MONTHS_BACK = 24;
const MONTHS_AHEAD = 24;
const ROW_H = 48;
const TITLE_H = 44;
const WEEKDAY_H = 22;
const CARD_PAD = 12;
const CARD_BORDER = 1;
const CARD_GAP = 12;
const MAX_DOTS = 3;
const SPRING = { damping: 18, stiffness: 190, mass: 0.9 };

interface MonthItem {
  /** 그 달 1일 */
  key: ISODate;
  /** 각 주의 일요일 */
  weeks: ISODate[];
  height: number;
  offset: number;
}

function buildMonths(center: Date): MonthItem[] {
  const items: MonthItem[] = [];
  let offset = 0;
  for (let i = -MONTHS_BACK; i <= MONTHS_AHEAD; i++) {
    const first = startOfMonth(addMonths(center, i));
    const rows = Math.ceil((first.getDay() + getDaysInMonth(first)) / 7);
    const gridStart = fromISODate(startOfWeekISO(first));
    const weeks = Array.from({ length: rows }, (_, r) => toISODate(addDays(gridStart, r * 7)));
    const height = CARD_BORDER * 2 + CARD_PAD * 2 + TITLE_H + WEEKDAY_H + rows * ROW_H;
    items.push({ key: toISODate(first), weeks, height, offset });
    offset += height + CARD_GAP;
  }
  return items;
}

/** 날짜별 점 색 — 출근은 초록, 상태 카드는 카드 글자색. 같은 색은 하나로, 최대 3개 */
function buildDots(
  cells: Record<string, CellValue>,
  activeIds: Set<string>,
): Map<ISODate, string[]> {
  const map = new Map<ISODate, string[]>();
  for (const [key, cell] of Object.entries(cells)) {
    const { workerId, date } = parseCellKey(key);
    if (!activeIds.has(workerId)) continue;
    const color = cell.kind === 'time' ? colors.feedback.success : cell.fg;
    const list = map.get(date) ?? [];
    if (!list.includes(color) && list.length < MAX_DOTS) list.push(color);
    map.set(date, list);
  }
  return map;
}

/** 행사 기간에 든 날짜 → 띠 색 */
function buildEventDays(events: CalendarEvent[]): Map<ISODate, string> {
  const map = new Map<ISODate, string>();
  for (const e of events) {
    let d = e.start;
    for (let i = 0; i < 62 && d <= e.end; i++) {
      map.set(d, e.color);
      d = addDaysISO(d, 1);
    }
  }
  return map;
}

/**
 * 캘린더 페이지 — 달 카드를 세로로 쭉 넘기며(2년 전 ~ 2년 후) 원하는 주를 고른다.
 * 날짜 아래 점은 그날 들어간 근무(초록)·상태 카드 색, 행사 기간은 날짜에 띠 색이 깔린다.
 */
export default function CalendarScreen() {
  const selected = useWeekView((s) => s.start);
  const go = useWeekView((s) => s.go);
  const workers = useActiveWorkers();
  const cells = useCells();
  const events = useEvents();
  const today = useMemo(() => todayISO(), []);
  const listRef = useRef<FlatList<MonthItem>>(null);
  const closing = useRef(false);

  const months = useMemo(() => buildMonths(fromISODate(today)), [today]);
  const activeIds = useMemo(() => new Set(workers.map((w) => w.id)), [workers]);
  const dots = useMemo(() => buildDots(cells, activeIds), [cells, activeIds]);
  const eventDays = useMemo(() => buildEventDays(events), [events]);

  const monthIndexOf = useCallback(
    (iso: ISODate) => {
      const key = toISODate(startOfMonth(fromISODate(iso)));
      return Math.max(
        0,
        months.findIndex((m) => m.key === key),
      );
    },
    [months],
  );
  // 주 가운데(수요일)가 속한 달부터 보여준다
  const initialIndex = useMemo(
    () => monthIndexOf(addDaysISO(selected, 3)),
    [monthIndexOf, selected],
  );

  const pickWeek = useCallback(
    (weekStart: ISODate) => {
      if (closing.current) return;
      tapHaptic();
      go(weekStart);
      closing.current = true;
      // 선택 표시가 스프링으로 옮겨가는 걸 잠깐 보여준 뒤 닫는다
      setTimeout(() => router.back(), 260);
    },
    [go],
  );

  const scrollToToday = useCallback(() => {
    tapHaptic();
    listRef.current?.scrollToIndex({ index: monthIndexOf(today), animated: true });
  }, [monthIndexOf, today]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<MonthItem>) => (
      <MonthCard
        item={item}
        selected={selected}
        today={today}
        dots={dots}
        eventDays={eventDays}
        onPickWeek={pickWeek}
      />
    ),
    [selected, today, dots, eventDays, pickWeek],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Button title="오늘" size="sm" variant="secondary" onPress={scrollToToday} />
        <View style={styles.headerCenter}>
          <AppText variant="title">캘린더</AppText>
          <AppText variant="caption" color={colors.text.secondary}>
            주를 누르면 그 주 근무표로 가요
          </AppText>
        </View>
        <IconButton onPress={() => router.back()} accessibilityLabel="닫기">
          <CloseIcon />
        </IconButton>
      </View>
      <FlatList
        ref={listRef}
        data={months}
        keyExtractor={(m) => m.key}
        renderItem={renderItem}
        getItemLayout={(_, index) => ({
          length: months[index].height + CARD_GAP,
          offset: months[index].offset,
          index,
        })}
        initialScrollIndex={initialIndex}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        initialNumToRender={3}
        windowSize={5}
      />
    </SafeAreaView>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

interface MonthCardProps {
  item: MonthItem;
  selected: ISODate;
  today: ISODate;
  dots: Map<ISODate, string[]>;
  eventDays: Map<ISODate, string>;
  onPickWeek: (weekStart: ISODate) => void;
}

const MonthCard = memo(function MonthCard({
  item,
  selected,
  today,
  dots,
  eventDays,
  onPickWeek,
}: MonthCardProps) {
  const first = fromISODate(item.key);
  const monthPrefix = item.key.slice(0, 7);
  const selectedRow = item.weeks.indexOf(selected);
  return (
    <Animated.View
      entering={FadeInDown.springify().damping(18).stiffness(160).mass(0.9)}
      style={[styles.card, { height: item.height }]}>
      <View style={styles.cardTitle}>
        <CalendarIcon size={18} color={colors.text.secondary} />
        <AppText variant="heading">{format(first, 'yyyy년 M월')}</AppText>
      </View>
      <View style={styles.weekdays}>
        {WEEKDAY_KO.map((d, i) => (
          <View key={d} style={styles.weekdayCell}>
            <AppText
              variant="caption"
              color={
                i === 0 ? colors.weekday.sun : i === 6 ? colors.weekday.sat : colors.text.tertiary
              }>
              {d}
            </AppText>
          </View>
        ))}
      </View>
      <View>
        {selectedRow >= 0 ? <SelectionPill row={selectedRow} /> : null}
        {item.weeks.map((weekStart) => (
          <PressableScale
            key={weekStart}
            scaleTo={0.97}
            onPress={() => onPickWeek(weekStart)}
            accessibilityRole="button"
            accessibilityLabel={`${weekRangeLabel(weekStart)} 주로 이동`}
            accessibilityState={{ selected: weekStart === selected }}
            style={styles.weekRow}>
            {weekDates(weekStart).map((iso) => {
              if (!iso.startsWith(monthPrefix)) return <View key={iso} style={styles.dayCell} />;
              const isToday = iso === today;
              const eventColor = eventDays.get(iso);
              return (
                <View key={iso} style={styles.dayCell}>
                  <View
                    style={[
                      styles.dayBadge,
                      isToday && styles.todayBadge,
                      !isToday && !!eventColor && { backgroundColor: eventColor },
                    ]}>
                    <AppText
                      style={[styles.dayText, isToday && styles.dayTextToday]}
                      color={isToday ? colors.text.inverse : colors.text.primary}>
                      {Number(iso.slice(8, 10))}
                    </AppText>
                  </View>
                  <View style={styles.dots}>
                    {(dots.get(iso) ?? []).map((c) => (
                      <View key={c} style={[styles.dot, { backgroundColor: c }]} />
                    ))}
                  </View>
                </View>
              );
            })}
          </PressableScale>
        ))}
      </View>
    </Animated.View>
  );
});

/** 선택한 주 뒤에 깔리는 라벤더 알약 — 행이 바뀌면 스프링으로 미끄러진다 */
function SelectionPill({ row }: { row: number }) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withSpring(row * ROW_H, SPRING) }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      entering={ZoomIn.springify().damping(16).stiffness(220)}
      style={[styles.pill, animatedStyle]}
    />
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  headerCenter: { alignItems: 'center', gap: 2 },
  list: { paddingHorizontal: spacing.lg, paddingTop: spacing.xs, paddingBottom: spacing.xxl },
  separator: { height: CARD_GAP },
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.lg,
    borderWidth: CARD_BORDER,
    borderColor: colors.surface.border,
    padding: CARD_PAD,
    overflow: 'hidden',
  },
  cardTitle: {
    height: TITLE_H,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  weekdays: { height: WEEKDAY_H, flexDirection: 'row' },
  weekdayCell: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pill: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: ROW_H,
    borderRadius: radius.md,
    backgroundColor: colors.brand.primarySoft,
  },
  weekRow: { flexDirection: 'row', height: ROW_H },
  dayCell: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  dayBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  todayBadge: { backgroundColor: colors.brand.primary },
  dayText: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 18 },
  dayTextToday: { fontFamily: fonts.bold },
  dots: { flexDirection: 'row', gap: 3, height: 5 },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
});
