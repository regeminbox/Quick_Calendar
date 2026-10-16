import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { colors, fonts, radius, spacing } from '@/theme/tokens';

import { AppText } from './AppText';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  title: string;
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

const PALETTE: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.brand.yellow, fg: colors.text.onYellow, border: colors.brand.yellow },
  secondary: { bg: colors.surface.card, fg: colors.text.primary, border: colors.surface.border },
  ghost: { bg: 'transparent', fg: colors.text.primary, border: 'transparent' },
  danger: { bg: '#FDE2E2', fg: colors.feedback.danger, border: '#FDE2E2' },
};

const HEIGHT: Record<Size, number> = { sm: 32, md: 40, lg: 50 };
const FONT: Record<Size, number> = { sm: 13, md: 14, lg: 16 };

export function Button({ title, variant = 'secondary', size = 'md', icon, style, disabled, ...rest }: ButtonProps) {
  const palette = PALETTE[variant];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      {...rest}
      style={({ pressed }) => [
        styles.base,
        {
          height: HEIGHT[size],
          backgroundColor: palette.bg,
          borderColor: palette.border,
          opacity: disabled ? 0.45 : pressed ? 0.75 : 1,
        },
        style,
      ]}>
      <View style={styles.content}>
        {icon}
        <AppText style={{ fontFamily: fonts.semibold, fontSize: FONT[size], lineHeight: FONT[size] + 4 }} color={palette.fg}>
          {title}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
