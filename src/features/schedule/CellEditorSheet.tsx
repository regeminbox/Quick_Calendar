import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { EraserIcon, PlusIcon } from '@/components/icons';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Sheet } from '@/components/ui/Sheet';
import { TextField } from '@/components/ui/TextField';
import { cellKey, dateLabel, formatTimeLabel, type ISODate, normalizeTimeInput } from '@/lib/date';
import { tapHaptic } from '@/lib/haptics';
import { useSettings, useStatusCards, useTimeCards } from '@/store/selectors';
import type { Card } from '@/store/types';
import { useAppStore } from '@/store/useAppStore';
import { colors, spacing } from '@/theme/tokens';

import { cellLabel } from './ScheduleCell';

export interface CellTarget {
  workerId: string;
  date: ISODate;
}

export interface CellEditorSheetProps {
  target: CellTarget | null;
  onClose: () => void;
  /** "새 카드" 칩 → 카드 편집기 열기 (저장되면 이 칸에 바로 적용) */
  onRequestNewCard: () => void;
}

/** 셀을 누르면 올라오는 선택 시트: 출근 시간 칩 / 직접 입력 / 상태·커스텀 카드 / 지우기 */
export function CellEditorSheet({ target, onClose, onRequestNewCard }: CellEditorSheetProps) {
  const { timeStyle } = useSettings();
  const workerName = useAppStore((s) => (target ? s.workers.find((w) => w.id === target.workerId)?.name : undefined));
  const value = useAppStore((s) => (target ? s.cells[cellKey(target.workerId, target.date)] : undefined));
  const clearCell = useAppStore((s) => s.clearCell);

  const title = target ? `${workerName ?? ''} · ${dateLabel(target.date)}` : '';
  const subtitle = value ? `현재: ${cellLabel(value, timeStyle)}` : '비어 있음';

  const clear = () => {
    if (!target) return;
    clearCell(target.workerId, target.date);
    tapHaptic();
    onClose();
  };

  return (
    <Sheet
      visible={!!target}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      footer={
        <>
          <Button
            title="지우기"
            variant="danger"
            icon={<EraserIcon size={16} color={colors.feedback.danger} />}
            onPress={clear}
            disabled={!value}
            style={styles.footerButton}
          />
          <Button title="닫기" variant="secondary" onPress={onClose} style={styles.footerButton} />
        </>
      }>
      {target ? (
        <CellEditor key={`${target.workerId}|${target.date}`} target={target} onClose={onClose} onRequestNewCard={onRequestNewCard} />
      ) : null}
    </Sheet>
  );
}

function CellEditor({ target, onClose, onRequestNewCard }: { target: CellTarget; onClose: () => void; onRequestNewCard: () => void }) {
  const timeCards = useTimeCards();
  const statusCards = useStatusCards();
  const { timeStyle } = useSettings();
  const value = useAppStore((s) => s.cells[cellKey(target.workerId, target.date)]);
  const setCellCard = useAppStore((s) => s.setCellCard);
  const setCellTime = useAppStore((s) => s.setCellTime);
  const [custom, setCustom] = useState('');
  const [error, setError] = useState<string | null>(null);

  const selectedId = value?.cardId ?? null;
  const customTime = value && value.cardId === null && value.kind === 'time' ? value.time : undefined;

  const applyCard = (card: Card) => {
    setCellCard(target.workerId, target.date, card);
    tapHaptic();
    onClose();
  };

  const applyCustom = () => {
    const time = normalizeTimeInput(custom);
    if (!time) {
      setError('예: 930, 1000, 15:30 처럼 입력해 주세요');
      return;
    }
    setCellTime(target.workerId, target.date, time);
    tapHaptic();
    onClose();
  };

  return (
    <>
      <View style={styles.section}>
        <AppText variant="caption" color={colors.text.secondary}>
          출근 시간
        </AppText>
        <View style={styles.chips}>
          {timeCards.map((card) => (
            <Chip
              key={card.id}
              label={formatTimeLabel(card.time ?? card.label, timeStyle)}
              bg={card.bg}
              fg={card.fg}
              selected={card.id === selectedId}
              onPress={() => applyCard(card)}
            />
          ))}
          {customTime ? <Chip label={`직접 ${formatTimeLabel(customTime, timeStyle)}`} selected /> : null}
        </View>
        <View style={styles.customRow}>
          <View style={styles.customField}>
            <TextField
              value={custom}
              onChangeText={(text) => {
                setCustom(text);
                setError(null);
              }}
              placeholder="직접 입력 (예: 930, 1130)"
              keyboardType="number-pad"
              returnKeyType="done"
              onSubmitEditing={applyCustom}
              error={error}
            />
          </View>
          <Button title="적용" variant="secondary" onPress={applyCustom} disabled={!custom.trim()} style={styles.customButton} />
        </View>
      </View>

      <View style={styles.section}>
        <AppText variant="caption" color={colors.text.secondary}>
          상태 · 내 카드
        </AppText>
        <View style={styles.chips}>
          {statusCards.map((card) => (
            <Chip key={card.id} label={card.label} bg={card.bg} fg={card.fg} selected={card.id === selectedId} onPress={() => applyCard(card)} />
          ))}
          <Chip label="새 카드" dashed icon={<PlusIcon size={14} />} onPress={onRequestNewCard} />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  customRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  customField: { flex: 1 },
  customButton: { height: 46 },
  footerButton: { flex: 1 },
});
