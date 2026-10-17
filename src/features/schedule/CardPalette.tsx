import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { CloseIcon, EraserIcon, PencilIcon, PlusIcon } from '@/components/icons';
import { AppText } from '@/components/ui/AppText';
import { Chip } from '@/components/ui/Chip';
import { IconButton } from '@/components/ui/IconButton';
import { formatTimeRange } from '@/lib/date';
import { tapHaptic } from '@/lib/haptics';
import { useSettings, useStatusCards, useTimeCards } from '@/store/selectors';
import { useAppStore } from '@/store/useAppStore';
import { type BrushTool, useBrush } from '@/store/useBrush';
import { colors, fonts, radius, spacing } from '@/theme/tokens';

export interface CardPaletteProps {
  onManageCards: () => void;
}

/** 근무표 위 카드 줄 — 여기서 고른 카드가 칸을 한 번 누를 때 바로 들어간다 */
export function CardPalette({ onManageCards }: CardPaletteProps) {
  const timeCards = useTimeCards();
  const statusCards = useStatusCards();
  const { timeStyle, gridTipDismissed } = useSettings();
  const updateSettings = useAppStore((s) => s.updateSettings);
  const tool = useBrush((s) => s.tool);
  const cardId = useBrush((s) => s.cardId);
  const select = useBrush((s) => s.select);
  const activeCardId = tool === 'card' ? (cardId ?? timeCards[0]?.id ?? null) : null;

  const pick = (t: BrushTool, id?: string) => {
    tapHaptic();
    select(t, id);
  };

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        keyboardShouldPersistTaps="handled">
        {timeCards.map((c) => (
          <Chip
            key={c.id}
            size="sm"
            label={formatTimeRange(c.time ?? c.label, c.endTime, timeStyle)}
            selected={c.id === activeCardId}
            onPress={() => pick('card', c.id)}
          />
        ))}
        {statusCards.map((c) => (
          <Chip
            key={c.id}
            size="sm"
            label={c.label}
            bg={c.bg}
            bg2={c.bg2}
            fg={c.fg}
            selected={c.id === activeCardId}
            onPress={() => pick('card', c.id)}
          />
        ))}
        <View style={styles.divider} />
        <Chip
          size="sm"
          label="지우개"
          icon={<EraserIcon size={14} />}
          selected={tool === 'erase'}
          onPress={() => pick('erase')}
        />
        <Chip
          size="sm"
          label="직접 입력"
          icon={<PencilIcon size={14} />}
          selected={tool === 'edit'}
          onPress={() => pick('edit')}
        />
        <Chip
          size="sm"
          label="카드 관리"
          dashed
          icon={<PlusIcon size={14} />}
          onPress={onManageCards}
        />
      </ScrollView>

      {!gridTipDismissed ? (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          layout={LinearTransition}
          style={styles.tip}>
          <View style={styles.tipLines}>
            <TipLine mark="한 번" text="칸을 누르면 위에서 고른 카드가 들어가요" />
            <TipLine mark="두 번" text="연달아 누르면 직접 입력·다른 카드로 바꿔요" />
            <TipLine mark="꾹+끌기" text="꾹 누른 채 끌면 그 카드가 복사돼요 (지우개면 지워져요)" />
          </View>
          <IconButton
            size={28}
            filled={false}
            accessibilityLabel="사용법 안내 닫기"
            onPress={() => updateSettings({ gridTipDismissed: true })}>
            <CloseIcon size={16} color={colors.text.secondary} />
          </IconButton>
        </Animated.View>
      ) : null}
    </View>
  );
}

function TipLine({ mark, text }: { mark: string; text: string }) {
  return (
    <View style={styles.tipLine}>
      <View style={styles.tipMark}>
        <AppText style={styles.tipMarkText}>{mark}</AppText>
      </View>
      <AppText variant="caption" color={colors.text.secondary} style={styles.tipText}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, paddingTop: spacing.sm },
  row: { paddingHorizontal: spacing.md, gap: spacing.xs, alignItems: 'center' },
  divider: { width: 1, height: 20, backgroundColor: colors.surface.border, marginHorizontal: 4 },
  tip: {
    marginHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.brand.primaryPale,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
  },
  tipLines: { flex: 1, gap: 4 },
  tipLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  tipMark: {
    minWidth: 48,
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tipMarkText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    lineHeight: 14,
    color: colors.brand.primary,
  },
  tipText: { flex: 1 },
});
