import { Text, type TextProps } from 'react-native';

import { colors, typography } from '@/theme/tokens';

export type TextVariant = keyof typeof typography;

export interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
}

/** Pretendard 적용 텍스트. variant로 크기/굵기, color로 색. */
export function AppText({
  variant = 'body',
  color = colors.text.primary,
  style,
  ...rest
}: AppTextProps) {
  return <Text {...rest} style={[typography[variant], { color }, style]} />;
}
