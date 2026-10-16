import { StyleSheet, View } from 'react-native';

import { CopyIcon, EraserIcon } from '@/components/icons';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { confirmAsync } from '@/lib/confirm';
import { type ISODate, shiftWeek, weekRangeLabel } from '@/lib/date';
import { successHaptic } from '@/lib/haptics';
import { useAppStore } from '@/store/useAppStore';
import { colors, spacing } from '@/theme/tokens';

export interface WeekActionsSheetProps {
  visible: boolean;
  weekStart: ISODate;
  /** 이번 주에 입력된 칸 수 (덮어쓰기 경고용) */
  filledCount: number;
  onClose: () => void;
}

/** 주 단위 작업: 지난주 복사, 이번 주 비우기 */
export function WeekActionsSheet({ visible, weekStart, filledCount, onClose }: WeekActionsSheetProps) {
  const copyPreviousWeek = useAppStore((s) => s.copyPreviousWeek);
  const clearWeek = useAppStore((s) => s.clearWeek);
  const previous = shiftWeek(weekStart, -1);

  const onCopy = async () => {
    if (filledCount > 0) {
      const ok = await confirmAsync('지난주 근무표를 복사할까요?', `이번 주에 이미 입력한 ${filledCount}칸이 지난주 내용으로 바뀌어요.`, '복사');
      if (!ok) return;
    }
    copyPreviousWeek(weekStart);
    successHaptic();
    onClose();
  };

  const onClear = async () => {
    const ok = await confirmAsync('이번 주를 비울까요?', `${weekRangeLabel(weekStart)} 근무표 ${filledCount}칸이 지워져요.`, '비우기');
    if (!ok) return;
    clearWeek(weekStart);
    successHaptic();
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={`${weekRangeLabel(weekStart)} 주 작업`} subtitle="자주 쓰는 일괄 작업이에요">
      <View style={styles.list}>
        <Button
          title={`지난주(${weekRangeLabel(previous)}) 근무표 복사`}
          variant="secondary"
          size="lg"
          icon={<CopyIcon size={18} />}
          onPress={onCopy}
        />
        <AppText variant="caption" color={colors.text.secondary}>
          같은 패턴으로 반복되는 주에 편해요. 복사 후 바뀐 칸만 고치면 돼요.
        </AppText>
        <Button
          title="이번 주 비우기"
          variant="danger"
          size="lg"
          icon={<EraserIcon size={18} color={colors.feedback.danger} />}
          onPress={onClear}
          disabled={filledCount === 0}
        />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
});
