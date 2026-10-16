import { useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { SparkleIcon } from '@/components/icons';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Sheet } from '@/components/ui/Sheet';
import { TextField } from '@/components/ui/TextField';
import { EVENT_DEFAULT_COLOR, GORAEIT_EVENT_TITLE } from '@/features/cards/defaultCards';
import { confirmAsync } from '@/lib/confirm';
import { dateLabel, fromISODate, type ISODate, todayISO, weekDates } from '@/lib/date';
import { successHaptic } from '@/lib/haptics';
import type { CalendarEvent } from '@/store/types';
import { useAppStore } from '@/store/useAppStore';
import { colors, spacing } from '@/theme/tokens';

import { DateRangePicker, type DateRange } from './DateRangePicker';

export type EventSheetState = { mode: 'new'; weekStart: ISODate } | { mode: 'edit'; event: CalendarEvent } | null;

export interface EventSheetProps {
  state: EventSheetState;
  onClose: () => void;
}

const TITLE_PRESETS = [GORAEIT_EVENT_TITLE, '고래잇 페스타', '재고조사'];
const COLORS = [
  { key: 'yellow', name: '노랑', value: EVENT_DEFAULT_COLOR },
  { key: 'orange', name: '주황', value: '#FFD9A8' },
  { key: 'mint', name: '민트', value: '#CFEFE1' },
  { key: 'sky', name: '하늘', value: '#DDEBFF' },
  { key: 'pink', name: '분홍', value: '#FDE2E2' },
];

/** 날짜 헤더 위 띠(행사) 추가/수정 — 제목·기간·색·★ */
export function EventSheet({ state, onClose }: EventSheetProps) {
  return (
    <Sheet visible={!!state} onClose={onClose} title={state?.mode === 'edit' ? '행사 수정' : '행사 추가'} subtitle="근무표 날짜 위에 띠로 표시돼요">
      {state ? <EventForm key={state.mode === 'edit' ? state.event.id : `new-${state.weekStart}`} state={state} onClose={onClose} /> : null}
    </Sheet>
  );
}

function defaultRange(weekStart: ISODate): DateRange {
  const dates = weekDates(weekStart);
  const today = todayISO();
  const start = dates.includes(today) ? today : dates[0];
  return { start, end: start };
}

function dayCount(range: DateRange): number {
  return Math.round((fromISODate(range.end).getTime() - fromISODate(range.start).getTime()) / 86_400_000) + 1;
}

function EventForm({ state, onClose }: { state: NonNullable<EventSheetState>; onClose: () => void }) {
  const upsertEvent = useAppStore((s) => s.upsertEvent);
  const deleteEvent = useAppStore((s) => s.deleteEvent);
  const event = state.mode === 'edit' ? state.event : null;

  const [title, setTitle] = useState(event?.title ?? GORAEIT_EVENT_TITLE);
  const [range, setRange] = useState<DateRange>(event ? { start: event.start, end: event.end } : defaultRange(state.mode === 'new' ? state.weekStart : todayISO()));
  const [color, setColor] = useState(event?.color ?? EVENT_DEFAULT_COLOR);
  const [star, setStar] = useState(event ? event.icon === 'star' : true);

  const save = () => {
    upsertEvent({ id: event?.id, title, start: range.start, end: range.end, color, icon: star ? 'star' : 'none' });
    successHaptic();
    onClose();
  };

  const remove = async () => {
    if (!event) return;
    const ok = await confirmAsync('이 행사를 삭제할까요?');
    if (!ok) return;
    deleteEvent(event.id);
    onClose();
  };

  return (
    <>
      <View style={styles.section}>
        <TextField label="행사 이름" value={title} onChangeText={setTitle} placeholder={GORAEIT_EVENT_TITLE} maxLength={12} returnKeyType="done" />
        <View style={styles.chips}>
          {TITLE_PRESETS.map((preset) => (
            <Chip key={preset} label={preset} size="sm" selected={title === preset} onPress={() => setTitle(preset)} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.rangeRow}>
          <AppText variant="caption" color={colors.text.secondary}>
            기간
          </AppText>
          <AppText style={styles.rangeText}>
            {range.start === range.end ? dateLabel(range.start) : `${dateLabel(range.start)} ~ ${dateLabel(range.end)}`} · {dayCount(range)}일
          </AppText>
        </View>
        <DateRangePicker value={range} onChange={setRange} />
      </View>

      <View style={styles.section}>
        <AppText variant="caption" color={colors.text.secondary}>
          띠 색
        </AppText>
        <View style={styles.swatches}>
          {COLORS.map((c) => (
            <Pressable
              key={c.key}
              onPress={() => setColor(c.value)}
              accessibilityRole="button"
              accessibilityLabel={c.name}
              accessibilityState={{ selected: color === c.value }}
              style={[styles.swatch, { backgroundColor: c.value, borderColor: color === c.value ? colors.text.primary : colors.surface.border }]}
            />
          ))}
        </View>
      </View>

      <View style={styles.switchRow}>
        <View style={styles.switchText}>
          <SparkleIcon size={16} />
          <AppText>반짝이 아이콘 표시</AppText>
        </View>
        <Switch value={star} onValueChange={setStar} trackColor={{ true: colors.brand.yellow, false: colors.surface.border }} thumbColor={colors.surface.card} />
      </View>

      <View style={styles.buttons}>
        {event ? <Button title="삭제" variant="danger" onPress={remove} /> : null}
        <View style={styles.spacer} />
        <Button title="취소" variant="secondary" onPress={onClose} />
        <Button title="저장" variant="primary" onPress={save} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  rangeRow: { gap: 2 },
  rangeText: { fontSize: 15 },
  swatches: { flexDirection: 'row', gap: spacing.sm },
  swatch: { width: 36, height: 36, borderRadius: 18, borderWidth: 2 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switchText: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  buttons: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  spacer: { flex: 1 },
});
