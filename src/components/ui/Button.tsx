import type { ReactNode } from 'react';
import {
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, fonts, radius, spacing } from '@/theme/tokens';

import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  title: string;
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  /** 레이아웃 스타일(flex 등) — 바깥 뷰에 적용 */
  style?: StyleProp<ViewStyle>;
}

const PALETTE: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.brand.primary, fg: colors.text.onPrimary, border: colors.brand.primary },
  secondary: { bg: colors.surface.card, fg: colors.text.primary, border: colors.surface.border },
  ghost: { bg: 'transparent', fg: colors.text.primary, border: 'transparent' },
  danger: {
    bg: colors.feedback.dangerSoft,
    fg: colors.feedback.danger,
    border: colors.feedback.dangerSoft,
  },
};

const HEIGHT: Record<Size, number> = { sm: 32, md: 40, lg: 50 };
const FONT: Record<Size, number> = { sm: 13, md: 14, lg: 16 };

export function Button({
  title,
  variant = 'secondary',
  size = 'md',
  icon,
  style,
  disabled,
  ...rest
}: ButtonProps) {
  const palette = PALETTE[variant];
  return (
    <PressableScale
      accessibilityRole="button"
      disabled={disabled}
      containerStyle={style}
      scaleTo={0.96}
      {...rest}
      style={({ pressed }) => [
        styles.base,
        {
          height: HEIGHT[size],
          backgroundColor: palette.bg,
          borderColor: palette.border,
          opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
        },
      ]}>
      <View style={styles.content}>
        {icon}
        <AppText
          style={{ fontFamily: fonts.semibold, fontSize: FONT[size], lineHeight: FONT[size] + 4 }}
          color={palette.fg}>
          {title}
        </AppText>
      </View>
    </PressableScale>
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
