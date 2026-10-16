import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

export interface PressableScaleProps extends PressableProps {
  /** 바깥(스케일 적용) 뷰 스타일 — flex, margin 등 레이아웃 */
  containerStyle?: StyleProp<ViewStyle>;
  scaleTo?: number;
}

const SPRING = { damping: 16, stiffness: 320, mass: 0.6 };

/** 누르면 살짝 작아졌다 돌아오는 Pressable (UI 스레드 스프링) */
export function PressableScale({
  containerStyle,
  scaleTo = 0.95,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[containerStyle, animatedStyle]}>
      <Pressable
        disabled={disabled}
        {...rest}
        onPressIn={(e) => {
          if (!disabled) scale.set(withSpring(scaleTo, SPRING));
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          scale.set(withSpring(1, SPRING));
          onPressOut?.(e);
        }}
      />
    </Animated.View>
  );
}
