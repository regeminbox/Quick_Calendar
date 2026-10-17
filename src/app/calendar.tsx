import { router, useLocalSearchParams } from 'expo-router';
import { type ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  type ListRenderItemInfo,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  type SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CloseIcon } from '@/components/icons';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { GradientFill } from '@/components/ui/GradientFill';
import { IconButton } from '@/components/ui/IconButton';
import { Sheet } from '@/components/ui/Sheet';
import { TextField } from '@/components/ui/TextField';
import { MINI_MONTH_HEIGHT, MiniMonth } from '@/features/calendar/MiniMonth';
import { MonthCard } from '@/features/calendar/MonthCard';
import { parseMonthQuery } from '@/features/calendar/monthQuery';
import { type MonthInfo, monthsOfYear } from '@/features/calendar/months';
import {
  addDaysISO,
  isISODate,
  type ISODate,
  parseCellKey,
  todayISO,
  weekRangeLabel,
} from '@/lib/date';
import { successHaptic, tapHaptic } from '@/lib/haptics';
import { useActiveWorkers, useCells, useEvents } from '@/store/selectors';
import type { CalendarEvent, CellValue } from '@/store/types';
import { useAppStore } from '@/store/useAppStore';
import { useWeekView } from '@/store/useWeekView';
import { colors, fonts, gradients, radius, spacing } from '@/theme/tokens';

/** 올해 기준 앞뒤 2년 */
const YEARS_AROUND = 2;
const COLUMNS = 3;
const GAP = 10;
const YEAR_H = 36;
/** 선반 널빤지 두께, 선반 앞 가격표(달 이름) 높이, 다음 선반까지 간격 */
const SHELF_H = 14;
const TAG_H = 22;
const SHELF_GAP = 14;
const MONTHS_ROW_H = MINI_MONTH_HEIGHT + SHELF_H + (TAG_H - SHELF_H) / 2 + SHELF_GAP;
const MAX_DOTS = 3;
/** 스크롤 속도 → 상품 기울기(도). 멈추면 스프링으로 제자리 */
const SWAY_PER_PX = 0.35;
const SWAY_MAX = 5;

type Row =
  | { type: 'year'; key: string; year: number }
  | { type: 'months'; key: string; year: number; months: MonthInfo[] };

function buildRows(years: number[]): Row[] {
  const rows: Row[] = [];
  for (const year of years) {
    rows.push({ type: 'year', key: `y-${year}`, year });
    const months = monthsOfYear(year);
    for (let i = 0; i < months.length; i += COLUMNS) {
      rows.push({
        type: 'months',
        key: `m-${year}-${i}`,
        year,
        months: months.slice(i, i + COLUMNS),
      });
    }
  }
  return rows;
}

const rowHeight = (row: Row) => (row.type === 'year' ? YEAR_H : MONTHS_ROW_H);

/** 날짜별 점 색 — 출근은 초록, 상태 카드는 카드 글자색. 같은 색은 하나로, 최대 3개 */
function buildDots(cells: Record<string, CellValue>, activeIds: Set<string>) {
  const dots = new Map<ISODate, string[]>();
  const filled = new Set<ISODate>();
  for (const [key, cell] of Object.entries(cells)) {
    const { workerId, date } = parseCellKey(key);
    if (!activeIds.has(workerId)) continue;
    filled.add(date);
    const color = cell.kind === 'time' ? colors.feedback.success : cell.fg;
    const list = dots.get(date) ?? [];
    if (!list.includes(color) && list.length < MAX_DOTS) list.push(color);
    dots.set(date, list);
  }
  return { dots, filled };
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
 * 캘린더 페이지 — 3열 연간 개요(앞뒤 2년). 달 카드는 마트 진열대 위 상품처럼 선반에 올라가 있고
 * 선반 앞 가격표에 달 이름이 붙는다. 스크롤하면 상품들이 살짝 흔들리다 스프링으로 멈춘다.
 * 달을 누르면 큰 달 카드가 시트로 열린다.
 * 기본 모드: 주를 누르면 그 주 근무표로 이동. 복사 모드(⋯ → 다른 주에서 가져오기): 고른 주를 target 주에 복사.
 */
export default function CalendarScreen() {
  const params = useLocalSearchParams<{ mode?: string; target?: string }>();
  const target: ISODate | null =
    params.mode === 'copy' && isISODate(params.target) ? params.target : null;
  const copyMode = target !== null;

  const viewing = useWeekView((s) => s.start);
  const go = useWeekView((s) => s.go);
  const copyWeek = useAppStore((s) => s.copyWeek);
  const workers = useActiveWorkers();
  const cells = useCells();
  const events = useEvents();
  const { width: screenWidth } = useWindowDimensions();

  const today = useMemo(() => todayISO(), []);
  const todayYear = Number(today.slice(0, 4));
  const years = useMemo(
    () => Array.from({ length: YEARS_AROUND * 2 + 1 }, (_, i) => todayYear - YEARS_AROUND + i),
    [todayYear],
  );
  const rows = useMemo(() => buildRows(years), [years]);
  const offsets = useMemo(() => {
    let o = 0;
    return rows.map((r) => {
      const cur = o;
      o += rowHeight(r);
      return cur;
    });
  }, [rows]);
  const yearIndices = useMemo(
    () => rows.map((r, i) => (r.type === 'year' ? i : -1)).filter((i) => i >= 0),
    [rows],
  );

  const activeIds = useMemo(() => new Set(workers.map((w) => w.id)), [workers]);
  const { dots, filled } = useMemo(() => buildDots(cells, activeIds), [cells, activeIds]);
  const eventDays = useMemo(() => buildEventDays(events), [events]);

  const listRef = useRef<FlatList<Row>>(null);
  const closing = useRef(false);
  // 스크롤 속도만큼 상품을 기울였다가(ΔY 비례) 멈추면 스프링으로 돌아온다
  const sway = useSharedValue(0);
  const lastY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      const y = e.contentOffset.y;
      const dy = y - lastY.value;
      lastY.value = y;
      const target = Math.max(-SWAY_MAX, Math.min(SWAY_MAX, dy * SWAY_PER_PX));
      sway.value = withSequence(
        withTiming(target, { duration: 50 }),
        withSpring(0, { damping: 6, stiffness: 170, mass: 0.7 }),
      );
    },
  });
  const [query, setQuery] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [highlightKey, setHighlightKey] = useState<string | null>(null);
  const [openMonth, setOpenMonth] = useState<MonthInfo | null>(null);
  const [picked, setPicked] = useState<ISODate | null>(null);

  const miniWidth = (Math.min(screenWidth, 520) - spacing.lg * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

  const rowIndexOfMonth = useCallback(
    (year: number, month: number) =>
      rows.findIndex(
        (r) => r.type === 'months' && r.months.some((m) => m.year === year && m.month === month),
      ),
    [rows],
  );
  // 달 행은 고정된 연도 헤더 아래로 오게 viewOffset을 준다
  const scrollToIndex = useCallback(
    (index: number, animated = true) => {
      if (index < 0) return;
      const viewOffset = rows[index]?.type === 'months' ? YEAR_H : 0;
      listRef.current?.scrollToIndex({ index, animated, viewPosition: 0, viewOffset });
    },
    [rows],
  );
  const flash = useCallback((key: string) => {
    setHighlightKey(key);
    setTimeout(() => setHighlightKey((k) => (k === key ? null : k)), 1600);
  }, []);

  // 처음엔 보고 있는 주(복사 모드면 복사 받을 주)의 달이 보이게
  const anchor = target ?? viewing;
  const initialIndex = useMemo(() => {
    const mid = addDaysISO(anchor, 3);
    return Math.max(0, rowIndexOfMonth(Number(mid.slice(0, 4)), Number(mid.slice(5, 7))));
  }, [anchor, rowIndexOfMonth]);
  const didInitialScroll = useRef(false);
  const onListLayout = useCallback(() => {
    if (didInitialScroll.current) return;
    didInitialScroll.current = true;
    scrollToIndex(initialIndex, false);
  }, [initialIndex, scrollToIndex]);

  const onSearch = useCallback(() => {
    const q = parseMonthQuery(query);
    if (!q) {
      setSearchError('예: 2027 3, 2027년 3월, 3월');
      return;
    }
    const year = q.year ?? Number(anchor.slice(0, 4));
    if (!years.includes(year)) {
      setSearchError(`${years[0]}년 ~ ${years[years.length - 1]}년 사이만 볼 수 있어요`);
      return;
    }
    Keyboard.dismiss();
    tapHaptic();
    if (q.month) {
      scrollToIndex(rowIndexOfMonth(year, q.month));
      flash(`${year}-${q.month}`);
    } else {
      scrollToIndex(rows.findIndex((r) => r.type === 'year' && r.year === year));
    }
  }, [query, anchor, years, rows, rowIndexOfMonth, scrollToIndex, flash]);

  const scrollToToday = useCallback(() => {
    tapHaptic();
    scrollToIndex(rowIndexOfMonth(todayYear, Number(today.slice(5, 7))));
    flash(`${todayYear}-${Number(today.slice(5, 7))}`);
  }, [flash, rowIndexOfMonth, scrollToIndex, today, todayYear]);

  const openMonthSheet = useCallback((info: MonthInfo) => {
    tapHaptic();
    setOpenMonth(info);
  }, []);
  const closeMonthSheet = useCallback(() => {
    setOpenMonth(null);
    setPicked(null);
  }, []);

  const finish = useCallback((after: () => void) => {
    if (closing.current) return;
    closing.current = true;
    after();
    setOpenMonth(null);
    // 시트가 내려가는 걸 잠깐 보여준 뒤 닫는다
    setTimeout(() => router.back(), 220);
  }, []);

  const onPickWeek = useCallback(
    (weekStart: ISODate) => {
      tapHaptic();
      if (copyMode) {
        if (weekStart !== target) setPicked(weekStart);
        return;
      }
      finish(() => go(weekStart));
    },
    [copyMode, target, finish, go],
  );

  const confirmCopy = useCallback(() => {
    if (!target || !picked) return;
    finish(() => {
      copyWeek(picked, target);
      successHaptic();
    });
  }, [target, picked, finish, copyWeek]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Row>) => {
      if (item.type === 'year') {
        return (
          <View style={styles.yearRow}>
            <AppText variant="heading">{item.year}년</AppText>
          </View>
        );
      }
      return (
        <View style={styles.monthsRow}>
          <View style={styles.products}>
            {item.months.map((m, i) => (
              <SwayItem key={m.key} sway={sway} dir={i % 2 === 0 ? 1 : -1}>
                <MiniMonth
                  info={m}
                  width={miniWidth}
                  today={today}
                  selectedWeek={copyMode ? picked : viewing}
                  filledDays={filled}
                  eventDays={eventDays}
                  highlighted={highlightKey === `${m.year}-${m.month}`}
                  onPress={openMonthSheet}
                />
              </SwayItem>
            ))}
          </View>
          <View style={styles.shelf}>
            <GradientFill colors={gradients.shelf} horizontal style={styles.plank} />
            <View style={styles.plankShadow} />
            <View style={styles.tags}>
              {item.months.map((m) => (
                <View key={m.key} style={[styles.tagSlot, { width: miniWidth }]}>
                  <View
                    style={[
                      styles.tag,
                      highlightKey === `${m.year}-${m.month}` && styles.tagHighlighted,
                    ]}>
                    <AppText style={styles.tagText}>{m.month}월</AppText>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      );
    },
    [
      miniWidth,
      today,
      copyMode,
      picked,
      viewing,
      filled,
      eventDays,
      highlightKey,
      openMonthSheet,
      sway,
    ],
  );

  const sheetFooter = copyMode ? (
    picked ? (
      <Button
        title={`${weekRangeLabel(picked)} → ${weekRangeLabel(target)} 복사`}
        variant="primary"
        size="lg"
        onPress={confirmCopy}
        style={styles.footerButton}
      />
    ) : (
      <AppText variant="caption" color={colors.text.secondary} style={styles.footerHint}>
        복사할 주를 눌러 주세요. 점선 주가 복사 받을 주예요.
      </AppText>
    )
  ) : undefined;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Button title="오늘" size="sm" variant="secondary" onPress={scrollToToday} />
        <View style={styles.headerCenter}>
          <AppText variant="title">{copyMode ? '복사할 주 선택' : '캘린더'}</AppText>
          <AppText variant="caption" color={colors.text.secondary}>
            {copyMode
              ? `고른 주 근무표를 ${weekRangeLabel(target)} 주에 넣어요`
              : '달을 누른 뒤 주를 고르면 그 주로 가요'}
          </AppText>
        </View>
        <IconButton onPress={() => router.back()} accessibilityLabel="닫기">
          <CloseIcon />
        </IconButton>
      </View>

      <View style={styles.search}>
        <TextField
          value={query}
          onChangeText={(t) => {
            setQuery(t);
            setSearchError(null);
          }}
          placeholder="년도·월로 찾기 (예: 2027 3, 3월)"
          returnKeyType="search"
          onSubmitEditing={onSearch}
          error={searchError}
          accessibilityLabel="년도·월 검색"
        />
        <View style={styles.yearChips}>
          {years.map((y) => (
            <Chip
              key={y}
              label={`${y}년`}
              size="sm"
              onPress={() => {
                tapHaptic();
                scrollToIndex(rows.findIndex((r) => r.type === 'year' && r.year === y));
              }}
            />
          ))}
        </View>
      </View>

      <Animated.FlatList
        ref={listRef}
        data={rows}
        keyExtractor={(r) => r.key}
        renderItem={renderItem}
        onScroll={onScroll}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: rowHeight(rows[index]),
          offset: offsets[index],
          index,
        })}
        onLayout={onListLayout}
        stickyHeaderIndices={yearIndices}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        windowSize={7}
        keyboardShouldPersistTaps="handled"
      />

      <Sheet
        visible={!!openMonth}
        onClose={closeMonthSheet}
        title={openMonth ? `${openMonth.year}년 ${openMonth.month}월` : ''}
        subtitle={copyMode ? '복사할 주를 누르세요' : '주를 누르면 그 주 근무표로 가요'}
        footer={sheetFooter}>
        {openMonth ? (
          <MonthCard
            info={openMonth}
            today={today}
            highlightWeek={copyMode ? picked : viewing}
            outlineWeek={target}
            dots={dots}
            eventDays={eventDays}
            onPickWeek={onPickWeek}
          />
        ) : null}
      </Sheet>
    </SafeAreaView>
  );
}

/** 선반 위 상품 하나 — 아래 가운데를 축으로 스크롤 방향으로 기울어진다 (이웃끼리 반대 방향) */
function SwayItem({
  sway,
  dir,
  children,
}: {
  sway: SharedValue<number>;
  dir: 1 | -1;
  children: ReactNode;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${sway.value * dir}deg` }],
  }));
  return <Animated.View style={[styles.product, animatedStyle]}>{children}</Animated.View>;
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
  headerCenter: { alignItems: 'center', gap: 2, flex: 1, paddingHorizontal: spacing.sm },
  search: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xs },
  yearChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  yearRow: { height: YEAR_H, justifyContent: 'center', backgroundColor: colors.surface.bg },
  monthsRow: { height: MONTHS_ROW_H },
  products: { flexDirection: 'row', gap: GAP, alignItems: 'flex-end', height: MINI_MONTH_HEIGHT },
  product: { transformOrigin: '50% 100%' },
  shelf: { height: SHELF_H + (TAG_H - SHELF_H) / 2 },
  plank: { height: SHELF_H, borderRadius: 4 },
  plankShadow: {
    height: 4,
    marginHorizontal: 6,
    backgroundColor: 'rgba(70, 60, 120, 0.12)',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  tags: {
    position: 'absolute',
    top: (SHELF_H - TAG_H) / 2,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: GAP,
  },
  tagSlot: { alignItems: 'center' },
  tag: {
    height: TAG_H,
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: colors.surface.card,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.surface.border,
    boxShadow: '0 2px 6px rgba(70, 60, 120, 0.12)',
  },
  tagHighlighted: { borderColor: colors.brand.primary, backgroundColor: colors.brand.primaryPale },
  tagText: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 16, color: colors.text.primary },
  footerButton: { flex: 1 },
  footerHint: { flex: 1, textAlign: 'center' },
});
