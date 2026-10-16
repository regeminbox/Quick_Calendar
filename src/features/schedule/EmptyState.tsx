import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { CalendarIcon } from '@/components/icons';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { colors, radius, spacing } from '@/theme/tokens';

export interface EmptyStateProps {
  onAddWorker: () => void;
  onSeedSample: () => void;
}

export function EmptyState({ onAddWorker, onSeedSample }: EmptyStateProps) {
  return (
    <Animated.View entering={FadeIn.duration(260)} style={styles.wrap}>
      <View style={styles.tile}>
        <CalendarIcon size={30} />
      </View>
      <AppText variant="heading">아직 근무자가 없어요</AppText>
      <AppText variant="caption" color={colors.text.secondary} style={styles.center}>
        근무자를 추가하면 바로 근무표를 짤 수 있어요.{'\n'}예시로 먼저 둘러봐도 좋아요.
      </AppText>
      <View style={styles.buttons}>
        <Button title="근무자 추가" variant="primary" onPress={onAddWorker} />
        <Button title="예시로 채우기" variant="secondary" onPress={onSeedSample} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  tile: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.brand.primaryPale,
    borderWidth: 1,
    borderColor: colors.brand.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  center: { textAlign: 'center' },
  buttons: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
});
