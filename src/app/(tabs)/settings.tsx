import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { colors, spacing } from '@/theme/tokens';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <AppText variant="title">설정</AppText>
        <AppText variant="caption" color={colors.text.secondary}>
          매장명, 시간 표기, 백업. (M4에서 구현)
        </AppText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.xs },
});
