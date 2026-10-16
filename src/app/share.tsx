import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors, spacing } from '@/theme/tokens';

export default function ShareScreen() {
  return (
    <View style={styles.wrap}>
      <AppText variant="title">카톡으로 보내기</AppText>
      <AppText variant="caption" color={colors.text.secondary}>
        공유 이미지 미리보기. (M3에서 구현)
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.surface.bg, padding: spacing.lg, gap: spacing.xs },
});
