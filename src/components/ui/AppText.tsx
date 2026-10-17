import { Text, type TextProps } from 'react-native';

import { colors, typography } from '@/theme/tokens';

export type TextVariant = keyof typeof typography;

export interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
}

/** 폰 글자 크기 설정이 커도 이만큼까지만 (표가 깨지지 않게) */
export const MAX_FONT_SCALE = 1.2;

/** Pretendard 적용 텍스트. variant로 크기/굵기, color로 색. */
export function AppText({
  variant = 'body',
  color = colors.text.primary,
  style,
  ...rest
}: AppTextProps) {
  return (
    <Text
      maxFontSizeMultiplier={MAX_FONT_SCALE}
      {...rest}
      style={[typography[variant], { color }, style]}
    />
  );
}
