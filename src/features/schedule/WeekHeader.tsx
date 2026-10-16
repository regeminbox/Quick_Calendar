import { StyleSheet, View } from 'react-native';

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreIcon,
  PlusIcon,
  ShareIcon,
} from '@/components/icons';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { PressableScale } from '@/components/ui/PressableScale';
import { fromISODate, type ISODate, weekRangeLabel } from '@/lib/date';
import { colors, radius, spacing } from '@/theme/tokens';

export interface WeekHeaderProps {
  weekStart: ISODate;
  isCurrentWeek: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onAddEvent?: () => void;
  onShare?: () => void;
  onMore?: () => void;
  /** 제목(10/11 ~ 10/17)을 누르면 캘린더에서 주 선택 */
  onPressTitle?: () => void;
}

export function WeekHeader({
  weekStart,
  isCurrentWeek,
  onPrev,
  onNext,
  onToday,
  onAddEvent,
  onShare,
  onMore,
  onPressTitle,
}: WeekHeaderProps) {
  const year = fromISODate(weekStart).getFullYear();
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <IconButton onPress={onPrev} accessibilityLabel="지난 주">
          <ChevronLeftIcon />
        </IconButton>
        <PressableScale
          onPress={onPressTitle}
          disabled={!onPressTitle}
          scaleTo={0.96}
          accessibilityRole="button"
          accessibilityLabel="캘린더에서 주 선택"
          accessibilityHint="월 달력에서 보고 싶은 주를 고를 수 있어요"
          containerStyle={styles.center}
          style={({ pressed }) => [styles.titleButton, pressed && styles.titlePressed]}>
          <AppText variant="caption" color={colors.text.secondary}>
            {year}년 근무표
          </AppText>
          <View style={[styles.titleRow, !!onPressTitle && styles.titleRowWithChevron]}>
            <AppText variant="title">{weekRangeLabel(weekStart)}</AppText>
            {onPressTitle ? <ChevronDownIcon size={18} color={colors.text.secondary} /> : null}
          </View>
        </PressableScale>
        <IconButton onPress={onNext} accessibilityLabel="다음 주">
          <ChevronRightIcon />
        </IconButton>
      </View>
      <View style={styles.actions}>
        {!isCurrentWeek ? (
          <Button title="오늘" size="sm" variant="ghost" onPress={onToday} />
        ) : (
          <View />
        )}
        <View style={styles.actionsRight}>
          {onMore ? (
            <IconButton size={32} onPress={onMore} accessibilityLabel="주 작업 더보기">
              <MoreIcon size={18} />
            </IconButton>
          ) : null}
          {onAddEvent ? (
            <Button
              title="행사"
              size="sm"
              variant="secondary"
              icon={<PlusIcon size={16} />}
              onPress={onAddEvent}
            />
          ) : null}
          {onShare ? (
            <Button
              title="카톡 공유"
              size="sm"
              variant="primary"
              icon={<ShareIcon size={16} />}
              onPress={onShare}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  center: { alignItems: 'center' },
  titleButton: {
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.md,
  },
  titlePressed: { backgroundColor: colors.surface.muted },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  /** 화살표 폭만큼 왼쪽을 비워 제목 글자가 가운데 오게 */
  titleRowWithChevron: { paddingLeft: 20 },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 32,
  },
  actionsRight: { flexDirection: 'row', gap: spacing.sm },
});
