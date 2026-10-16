import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, radius } from '@/theme/tokens';

export interface IconButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  children: ReactNode;
  size?: number;
  filled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** 둥근 아이콘 버튼 (기본 36pt) */
export function IconButton({
  children,
  size = 36,
  filled = true,
  style,
  disabled,
  ...rest
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={6}
      disabled={disabled}
      {...rest}
      style={({ pressed }) => [
        styles.base,
        {
          width: size,
          height: size,
          backgroundColor: filled ? colors.surface.card : 'transparent',
          borderColor: filled ? colors.surface.border : 'transparent',
          opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        },
        style,
      ]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
