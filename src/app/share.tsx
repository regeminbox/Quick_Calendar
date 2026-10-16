import { format } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CloseIcon, ShareIcon } from '@/components/icons';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { SHARE_CARD_WIDTH, ShareCard } from '@/features/share/ShareCard';
import { useShareImage } from '@/features/share/useShareImage';
import { isISODate, type TimeStyle } from '@/lib/date';
import { useActiveWorkers, useCells, useEvents, useSettings } from '@/store/selectors';
import { currentWeekStart, useAppStore } from '@/store/useAppStore';
import { colors, radius, spacing } from '@/theme/tokens';

const TIME_STYLE_OPTIONS = [
  { key: 'compact', label: '1000 표기' },
  { key: 'colon', label: '10:00 표기' },
] as const;

export default function ShareScreen() {
  const { week } = useLocalSearchParams<{ week?: string }>();
  const weekStart = isISODate(week) ? week : currentWeekStart();
  const { width: screenWidth } = useWindowDimensions();

  const workers = useActiveWorkers();
  const cells = useCells();
  const events = useEvents();
  const settings = useSettings();
  const updateSettings = useAppStore((s) => s.updateSettings);

  const [cardHeight, setCardHeight] = useState(0);
  const { ref, share, busy, error } = useShareImage(cardHeight, SHARE_CARD_WIDTH);
  const generatedAt = useMemo(() => format(new Date(), 'yyyy.MM.dd HH:mm'), []);

  // 400pt 카드를 화면 폭에 맞게 축소해서 보여주되, 캡처는 원본 크기로
  const scale = Math.min(1, (Math.min(screenWidth, 520) - spacing.lg * 2) / SHARE_CARD_WIDTH);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <AppText variant="title">카톡으로 보내기</AppText>
        <IconButton onPress={() => router.back()} accessibilityLabel="닫기">
          <CloseIcon />
        </IconButton>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.fullWidth}>
          <SegmentedControl options={TIME_STYLE_OPTIONS} value={settings.timeStyle} onChange={(v: TimeStyle) => updateSettings({ timeStyle: v })} />
        </View>
        <View style={[styles.previewFrame, { width: SHARE_CARD_WIDTH * scale, height: cardHeight ? cardHeight * scale : undefined }]}>
          <View style={{ width: SHARE_CARD_WIDTH, transformOrigin: 'top left', transform: [{ scale }] }}>
            <ShareCard
              ref={ref}
              weekStart={weekStart}
              workers={workers}
              cells={cells}
              events={events}
              timeStyle={settings.timeStyle}
              storeName={settings.storeName}
              generatedAt={generatedAt}
              onLayoutHeight={setCardHeight}
            />
          </View>
        </View>
        <AppText variant="caption" color={colors.text.secondary} style={styles.hint}>
          이 모습 그대로 선명한 이미지로 만들어져요. 공유 시트에서 카카오톡 → 대화방을 고르면 끝.
        </AppText>
        {error ? (
          <AppText variant="caption" color={colors.feedback.danger} style={styles.hint}>
            {error}
          </AppText>
        ) : null}
      </ScrollView>
      <View style={styles.footer}>
        <Button
          title={busy ? '이미지 만드는 중…' : '카톡으로 보내기'}
          variant="primary"
          size="lg"
          icon={<ShareIcon size={18} />}
          onPress={share}
          disabled={busy || cardHeight === 0 || workers.length === 0}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  content: { padding: spacing.lg, gap: spacing.md, alignItems: 'center' },
  previewFrame: {
    overflow: 'hidden',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surface.border,
    backgroundColor: colors.surface.card,
  },
  hint: { textAlign: 'center' },
  fullWidth: { alignSelf: 'stretch' },
  footer: { padding: spacing.lg, paddingTop: spacing.sm },
});
