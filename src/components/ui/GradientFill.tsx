import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

export interface GradientFillProps {
  /** [시작색, 끝색]. 끝색이 없거나 같으면 단색 View */
  colors: readonly [string, string?];
  /** 기본은 왼쪽 위 → 오른쪽 아래, horizontal이면 왼쪽 → 오른쪽 */
  horizontal?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

/** 두 파스텔 색을 살짝 섞는 배경. 카드·칸·헤더·띠가 같은 방식으로 쓴다 */
export function GradientFill({ colors, horizontal = false, style, children }: GradientFillProps) {
  const [a, b] = colors;
  if (!b || b === a) return <View style={[style, { backgroundColor: a }]}>{children}</View>;
  return (
    <LinearGradient
      colors={[a, b]}
      start={{ x: 0, y: 0 }}
      end={horizontal ? { x: 1, y: 0 } : { x: 1, y: 1 }}
      style={style}>
      {children}
    </LinearGradient>
  );
}
