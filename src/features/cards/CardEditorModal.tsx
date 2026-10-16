import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Sheet } from '@/components/ui/Sheet';
import { TextField } from '@/components/ui/TextField';
import { confirmAsync } from '@/lib/confirm';
import { formatTimeLabel, normalizeTimeInput } from '@/lib/date';
import { successHaptic } from '@/lib/haptics';
import { newId } from '@/lib/id';
import type { Card, CardKind } from '@/store/types';
import { useAppStore } from '@/store/useAppStore';
import { cardPalette, type CardPaletteKey, colors, spacing } from '@/theme/tokens';

export type CardEditorState = { mode: 'new'; kind: CardKind } | { mode: 'edit'; card: Card } | null;

export interface CardEditorModalProps {
  state: CardEditorState;
  onClose: () => void;
  onSaved?: (card: Card) => void;
}

/** 카드 추가/수정 — 상태 카드(라벨+색) 또는 시간 카드(출근 시각) */
export function CardEditorModal({ state, onClose, onSaved }: CardEditorModalProps) {
  const title = state?.mode === 'edit' ? '카드 수정' : '새 카드';
  return (
    <Sheet visible={!!state} onClose={onClose} title={title} subtitle="셀을 눌렀을 때 선택지로 나와요">
      {state ? (
        <CardForm key={state.mode === 'edit' ? state.card.id : `new-${state.kind}`} state={state} onClose={onClose} onSaved={onSaved} />
      ) : null}
    </Sheet>
  );
}

const KIND_OPTIONS = [
  { key: 'status', label: '상태 카드' },
  { key: 'time', label: '시간 카드' },
] as const;

function CardForm({ state, onClose, onSaved }: { state: NonNullable<CardEditorState>; onClose: () => void; onSaved?: (card: Card) => void }) {
  const upsertCard = useAppStore((s) => s.upsertCard);
  const deleteCard = useAppStore((s) => s.deleteCard);
  const timeStyle = useAppStore((s) => s.settings.timeStyle);
  const initial = state.mode === 'edit' ? state.card : null;

  const [kind, setKind] = useState<CardKind>(initial?.kind ?? (state.mode === 'new' ? state.kind : 'status'));
  const [label, setLabel] = useState(initial?.kind === 'status' ? initial.label : '');
  const [time, setTime] = useState(initial?.kind === 'time' && initial.time ? formatTimeLabel(initial.time, 'compact') : '');
  const [paletteKey, setPaletteKey] = useState<CardPaletteKey>(
    () => cardPalette.find((p) => p.bg === initial?.bg)?.key ?? 'yellow',
  );
  const [error, setError] = useState<string | null>(null);

  const palette = cardPalette.find((p) => p.key === paletteKey) ?? cardPalette[0];
  const normalizedTime = normalizeTimeInput(time);
  const previewLabel = kind === 'time' ? (normalizedTime ? formatTimeLabel(normalizedTime, timeStyle) : '--') : label.trim() || '라벨';

  const save = () => {
    const id = initial?.id ?? newId('card');
    if (kind === 'time') {
      if (!normalizedTime) {
        setError('시간을 확인해 주세요 (예: 930, 1000, 15:30)');
        return;
      }
      upsertCard({ id, kind: 'time', label: normalizedTime, time: normalizedTime, bg: colors.surface.card, fg: colors.text.primary, order: initial?.order, builtIn: initial?.builtIn });
    } else {
      const text = label.trim();
      if (!text) {
        setError('카드 이름을 입력해 주세요');
        return;
      }
      if ([...text].length > 4) {
        setError('4자 이내로 입력해 주세요 (칸에 들어가야 해요)');
        return;
      }
      upsertCard({ id, kind: 'status', label: text, bg: palette.bg, fg: palette.fg, order: initial?.order, builtIn: initial?.builtIn });
    }
    const saved = useAppStore.getState().cards.find((c) => c.id === id);
    if (saved) onSaved?.(saved);
    successHaptic();
    onClose();
  };

  const remove = async () => {
    if (!initial) return;
    const ok = await confirmAsync('이 카드를 삭제할까요?', '이미 표에 넣은 칸은 그대로 남아요.');
    if (!ok) return;
    deleteCard(initial.id);
    onClose();
  };

  return (
    <>
      {state.mode === 'new' ? <SegmentedControl options={KIND_OPTIONS} value={kind} onChange={setKind} /> : null}

      {kind === 'time' ? (
        <TextField
          label="출근 시각"
          value={time}
          onChangeText={(t) => {
            setTime(t);
            setError(null);
          }}
          placeholder="예: 930, 1000, 1530"
          keyboardType="number-pad"
          autoFocus
          error={error}
          hint="표에는 설정의 시간 표기(1000 / 10:00)대로 보여요"
        />
      ) : (
        <>
          <TextField
            label="카드 이름 (4자 이내)"
            value={label}
            onChangeText={(t) => {
              setLabel(t);
              setError(null);
            }}
            placeholder="예: 반차, 교육, 병가, 오픈"
            maxLength={4}
            autoFocus
            error={error}
          />
          <View style={styles.section}>
            <AppText variant="caption" color={colors.text.secondary}>
              색
            </AppText>
            <View style={styles.swatches}>
              {cardPalette.map((p) => {
                const active = p.key === paletteKey;
                return (
                  <Pressable
                    key={p.key}
                    onPress={() => setPaletteKey(p.key)}
                    accessibilityRole="button"
                    accessibilityLabel={p.name}
                    accessibilityState={{ selected: active }}
                    style={[styles.swatch, { backgroundColor: p.bg, borderColor: active ? colors.text.primary : colors.surface.border }]}>
                    <View style={[styles.swatchDot, { backgroundColor: p.fg }]} />
                  </Pressable>
                );
              })}
            </View>
          </View>
        </>
      )}

      <View style={styles.section}>
        <AppText variant="caption" color={colors.text.secondary}>
          미리보기
        </AppText>
        <View style={styles.previewRow}>
          <Chip label={previewLabel} bg={kind === 'time' ? colors.surface.card : palette.bg} fg={kind === 'time' ? colors.text.primary : palette.fg} />
        </View>
      </View>

      <View style={styles.buttons}>
        {initial ? <Button title="삭제" variant="danger" onPress={remove} /> : null}
        <View style={styles.spacer} />
        <Button title="취소" variant="secondary" onPress={onClose} />
        <Button title="저장" variant="primary" onPress={save} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  swatch: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  swatchDot: { width: 12, height: 12, borderRadius: 6 },
  previewRow: { flexDirection: 'row' },
  buttons: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  spacer: { flex: 1 },
});
