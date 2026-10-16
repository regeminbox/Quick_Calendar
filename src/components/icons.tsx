import type { ReactNode } from 'react';
import type { ColorValue } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors } from '@/theme/tokens';

export interface IconProps {
  size?: number;
  color?: ColorValue;
  strokeWidth?: number;
}

function Base({ size = 22, children }: { size?: number; children: ReactNode }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {children}
    </Svg>
  );
}

const stroke = (color: ColorValue, strokeWidth: number) =>
  ({ stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }) as const;

export function ChevronLeftIcon({ size, color = colors.text.primary, strokeWidth = 2 }: IconProps) {
  return (
    <Base size={size}>
      <Path d="M15 18l-6-6 6-6" {...stroke(color, strokeWidth)} />
    </Base>
  );
}

export function ChevronRightIcon({ size, color = colors.text.primary, strokeWidth = 2 }: IconProps) {
  return (
    <Base size={size}>
      <Path d="M9 18l6-6-6-6" {...stroke(color, strokeWidth)} />
    </Base>
  );
}

export function CalendarIcon({ size, color = colors.text.primary, strokeWidth = 2 }: IconProps) {
  return (
    <Base size={size}>
      <Rect x={3} y={5} width={18} height={16} rx={3} {...stroke(color, strokeWidth)} />
      <Path d="M3 10h18M8 3v4M16 3v4" {...stroke(color, strokeWidth)} />
      <Path d="M7.5 14.5h3v3h-3z" fill={color} />
    </Base>
  );
}

export function PeopleIcon({ size, color = colors.text.primary, strokeWidth = 2 }: IconProps) {
  return (
    <Base size={size}>
      <Circle cx={9} cy={8} r={3.5} {...stroke(color, strokeWidth)} />
      <Path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" {...stroke(color, strokeWidth)} />
      <Path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.3c2.1.7 3.5 2.6 3.5 5.7" {...stroke(color, strokeWidth)} />
    </Base>
  );
}

export function SlidersIcon({ size, color = colors.text.primary, strokeWidth = 2 }: IconProps) {
  return (
    <Base size={size}>
      <Path d="M4 7h9M18 7h2M4 17h4M13 17h7" {...stroke(color, strokeWidth)} />
      <Circle cx={15.5} cy={7} r={2.5} {...stroke(color, strokeWidth)} />
      <Circle cx={10.5} cy={17} r={2.5} {...stroke(color, strokeWidth)} />
    </Base>
  );
}

export function ShareIcon({ size, color = colors.text.primary, strokeWidth = 2 }: IconProps) {
  return (
    <Base size={size}>
      <Path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" {...stroke(color, strokeWidth)} />
      <Path d="M16 6l-4-4-4 4M12 2v13" {...stroke(color, strokeWidth)} />
    </Base>
  );
}

export function PlusIcon({ size, color = colors.text.primary, strokeWidth = 2 }: IconProps) {
  return (
    <Base size={size}>
      <Path d="M12 5v14M5 12h14" {...stroke(color, strokeWidth)} />
    </Base>
  );
}

export function CloseIcon({ size, color = colors.text.primary, strokeWidth = 2 }: IconProps) {
  return (
    <Base size={size}>
      <Path d="M6 6l12 12M18 6L6 18" {...stroke(color, strokeWidth)} />
    </Base>
  );
}

export function CheckIcon({ size, color = colors.text.primary, strokeWidth = 2.5 }: IconProps) {
  return (
    <Base size={size}>
      <Path d="M5 12.5l4.5 4.5L19 7.5" {...stroke(color, strokeWidth)} />
    </Base>
  );
}

export function TrashIcon({ size, color = colors.text.primary, strokeWidth = 2 }: IconProps) {
  return (
    <Base size={size}>
      <Path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" {...stroke(color, strokeWidth)} />
    </Base>
  );
}

export function PencilIcon({ size, color = colors.text.primary, strokeWidth = 2 }: IconProps) {
  return (
    <Base size={size}>
      <Path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3zM13.5 6.5l3 3" {...stroke(color, strokeWidth)} />
    </Base>
  );
}

export function CopyIcon({ size, color = colors.text.primary, strokeWidth = 2 }: IconProps) {
  return (
    <Base size={size}>
      <Rect x={9} y={9} width={11} height={11} rx={2} {...stroke(color, strokeWidth)} />
      <Path d="M5 15V5a2 2 0 0 1 2-2h10" {...stroke(color, strokeWidth)} />
    </Base>
  );
}

export function ArrowUpIcon({ size, color = colors.text.primary, strokeWidth = 2 }: IconProps) {
  return (
    <Base size={size}>
      <Path d="M12 19V5M5 12l7-7 7 7" {...stroke(color, strokeWidth)} />
    </Base>
  );
}

export function ArrowDownIcon({ size, color = colors.text.primary, strokeWidth = 2 }: IconProps) {
  return (
    <Base size={size}>
      <Path d="M12 5v14M19 12l-7 7-7-7" {...stroke(color, strokeWidth)} />
    </Base>
  );
}

export function EraserIcon({ size, color = colors.text.primary, strokeWidth = 2 }: IconProps) {
  return (
    <Base size={size}>
      <Path d="M3 17l7.5-7.5 6 6L13 19H7l-4-2zM10.5 9.5l5-5a2 2 0 0 1 2.8 0l2.2 2.2a2 2 0 0 1 0 2.8l-4 4" {...stroke(color, strokeWidth)} />
    </Base>
  );
}

export function SparkleIcon({ size, color = colors.text.primary }: IconProps) {
  return (
    <Base size={size}>
      <Path
        d="M12 2.5c.6 4.6 2.9 6.9 7.5 7.5-4.6.6-6.9 2.9-7.5 7.5-.6-4.6-2.9-6.9-7.5-7.5 4.6-.6 6.9-2.9 7.5-7.5z"
        fill={color}
      />
      <Path d="M19 15.5c.25 1.9 1.2 2.85 3.1 3.1-1.9.25-2.85 1.2-3.1 3.1-.25-1.9-1.2-2.85-3.1-3.1 1.9-.25 2.85-1.2 3.1-3.1z" fill={color} opacity={0.7} />
    </Base>
  );
}
