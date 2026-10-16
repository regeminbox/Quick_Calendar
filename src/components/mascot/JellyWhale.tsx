import Svg, {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';

import { colors } from '@/theme/tokens';

export interface JellyWhaleProps {
  /** 가로 크기(pt). 세로는 0.8배 */
  size?: number;
  /** 머리 위 반짝이 표시 */
  sparkle?: boolean;
}

/**
 * 고래잇 느낌의 노란 고래 — 3D 젤리 질감.
 * 원본 캐릭터의 저작권을 피하기 위해 직접 그린 닮은꼴 (둥근 몸통, 왼쪽 꼬리·지느러미, 오른쪽 얼굴).
 */
export function JellyWhale({ size = 120, sparkle = true }: JellyWhaleProps) {
  const m = colors.mascot;
  return (
    <Svg width={size} height={size * 0.8} viewBox="0 0 200 160">
      <Defs>
        <LinearGradient id="body" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={m.bodyTop} />
          <Stop offset="0.55" stopColor={m.body} />
          <Stop offset="1" stopColor={m.bodyBottom} />
        </LinearGradient>
        <RadialGradient id="gloss" cx="0.35" cy="0.25" r="0.6">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.75" />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="rim" cx="0.5" cy="1" r="0.75">
          <Stop offset="0.55" stopColor={m.bodyBottom} stopOpacity="0" />
          <Stop offset="1" stopColor="#C2731A" stopOpacity="0.55" />
        </RadialGradient>
        <ClipPath id="bodyClip">
          <Ellipse cx="104" cy="88" rx="70" ry="60" />
        </ClipPath>
      </Defs>

      {/* 꼬리 */}
      <Path
        d="M46 76 C 26 62, 14 42, 24 24 C 32 32, 40 38, 48 44 C 52 34, 60 26, 70 22 C 64 38, 58 56, 56 74 Z"
        fill="url(#body)"
      />
      <Path d="M46 76 C 26 62, 14 42, 24 24 C 32 32, 40 38, 48 44 Z" fill="#FFFFFF" opacity="0.18" />

      {/* 몸통 */}
      <Ellipse cx="104" cy="88" rx="70" ry="60" fill="url(#body)" />
      <G clipPath="url(#bodyClip)">
        {/* 배 */}
        <Ellipse cx="116" cy="136" rx="60" ry="24" fill={m.belly} opacity="0.95" />
        {/* 바닥 쪽 림 섀도 (젤리 두께감) */}
        <Ellipse cx="104" cy="88" rx="70" ry="60" fill="url(#rim)" />
        {/* 윗면 광택 */}
        <Ellipse cx="104" cy="88" rx="70" ry="60" fill="url(#gloss)" />
      </G>

      {/* 옆 지느러미 */}
      <Ellipse cx="62" cy="120" rx="22" ry="10" transform="rotate(-24 62 120)" fill="url(#body)" />
      <Ellipse cx="58" cy="117" rx="12" ry="4" transform="rotate(-24 58 117)" fill="#FFFFFF" opacity="0.25" />

      {/* 하이라이트 */}
      <Ellipse cx="78" cy="48" rx="24" ry="10" transform="rotate(-18 78 48)" fill="#FFFFFF" opacity="0.6" />
      <Circle cx="138" cy="40" r="5" fill="#FFFFFF" opacity="0.7" />

      {/* 얼굴 */}
      <Circle cx="142" cy="84" r="7" fill={m.eye} />
      <Circle cx="145" cy="81" r="2.4" fill="#FFFFFF" />
      <Circle cx="156" cy="102" r="7" fill={m.cheek} opacity="0.85" />
      <Path d="M126 104 Q 137 113 148 104" stroke="#8A4B10" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* 반짝이 */}
      {sparkle ? (
        <Path d="M176 22 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3 z" fill={colors.brand.yellow} stroke="#FFFFFF" strokeWidth="1.5" />
      ) : null}
    </Svg>
  );
}
