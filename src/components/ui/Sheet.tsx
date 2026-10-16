import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing } from '@/theme/tokens';

import { AppText } from './AppText';

export interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** 아래에서 올라오는 시트. RN 기본 Modal 기반이라 Expo Go·웹 모두 동작 */
export function Sheet({ visible, onClose, title, subtitle, children, footer }: SheetProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.fill}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="닫기" />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          <View style={styles.handle} />
          {title ? (
            <View style={styles.titleBlock}>
              <AppText variant="heading">{title}</AppText>
              {subtitle ? (
                <AppText variant="caption" color={colors.text.secondary}>
                  {subtitle}
                </AppText>
              ) : null}
            </View>
          ) : null}
          <ScrollView
            bounces={false}
            keyboardShouldPersistTaps="handled"
            style={styles.scroll}
            contentContainerStyle={styles.content}>
            {children}
          </ScrollView>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.surface.overlay },
  sheet: {
    backgroundColor: colors.surface.card,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    maxHeight: '88%',
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.surface.border, alignSelf: 'center', marginBottom: spacing.sm },
  titleBlock: { gap: 2, marginBottom: spacing.md },
  scroll: { flexGrow: 0 },
  content: { gap: spacing.lg, paddingBottom: spacing.sm },
  footer: { flexDirection: 'row', gap: spacing.sm, paddingTop: spacing.md },
});
