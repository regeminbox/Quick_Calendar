import { StyleSheet, View } from 'react-native';

import { ChevronLeftIcon, ChevronRightIcon, MoreIcon, PlusIcon, ShareIcon } from '@/components/icons';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { fromISODate, type ISODate, weekRangeLabel } from '@/lib/date';
import { colors, spacing } from '@/theme/tokens';

export interface WeekHeaderProps {
  weekStart: ISODate;
  isCurrentWeek: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onAddEvent?: () => void;
  onShare?: () => void;
  onMore?: () => void;
}

export function WeekHeader({ weekStart, isCurrentWeek, onPrev, onNext, onToday, onAddEvent, onShare, onMore }: WeekHeaderProps) {
  const year = fromISODate(weekStart).getFullYear();
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <IconButton onPress={onPrev} accessibilityLabel="지난 주">
          <ChevronLeftIcon />
        </IconButton>
        <View style={styles.center}>
          <AppText variant="caption" color={colors.text.secondary}>
            {year}년 근무표
          </AppText>
          <AppText variant="title">{weekRangeLabel(weekStart)}</AppText>
        </View>
        <IconButton onPress={onNext} accessibilityLabel="다음 주">
          <ChevronRightIcon />
        </IconButton>
      </View>
      <View style={styles.actions}>
        {!isCurrentWeek ? <Button title="오늘" size="sm" variant="ghost" onPress={onToday} /> : <View />}
        <View style={styles.actionsRight}>
          {onMore ? (
            <IconButton size={32} onPress={onMore} accessibilityLabel="주 작업 더보기">
              <MoreIcon size={18} />
            </IconButton>
          ) : null}
          {onAddEvent ? (
            <Button title="행사" size="sm" variant="secondary" icon={<PlusIcon size={16} />} onPress={onAddEvent} />
          ) : null}
          {onShare ? (
            <Button title="카톡 공유" size="sm" variant="primary" icon={<ShareIcon size={16} />} onPress={onShare} />
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  center: { alignItems: 'center', gap: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 32 },
  actionsRight: { flexDirection: 'row', gap: spacing.sm },
});
