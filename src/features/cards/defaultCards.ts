import type { Card } from '@/store/types';
import { cardPalette, colors, gradients } from '@/theme/tokens';

/** 엑셀 근무표에서 쓰던 출근 시각 5종 */
export const DEFAULT_TIMES = ['1000', '1300', '1400', '1530', '1900'] as const;

export const GORAEIT_EVENT_TITLE = '고래잇 행사';
export const EVENT_DEFAULT_COLOR = gradients.event[0];
export const EVENT_DEFAULT_COLOR2 = gradients.event[1];

function palette(key: (typeof cardPalette)[number]['key']) {
  const found = cardPalette.find((p) => p.key === key);
  if (!found) throw new Error(`unknown palette ${key}`);
  return found;
}

export function timeCard(time: string, order: number, builtIn = true, endTime?: string): Card {
  return {
    id: `time_${time}${endTime ? `_${endTime}` : ''}`,
    kind: 'time',
    label: endTime ? `${time}~${endTime}` : time,
    time,
    endTime,
    bg: colors.surface.card,
    fg: colors.text.primary,
    order,
    builtIn,
  };
}

export function buildDefaultCards(): Card[] {
  const timeCards = DEFAULT_TIMES.map((t, i) => timeCard(t, i));
  const gray = palette('gray');
  const pink = palette('pink');
  const purple = palette('purple');
  const statusCards: Card[] = [
    {
      id: 'status_hyumu',
      kind: 'status',
      label: '휴무',
      bg: gray.bg,
      bg2: gray.bg2,
      fg: gray.fg,
      order: 100,
      builtIn: true,
    },
    {
      id: 'status_jeongil',
      kind: 'status',
      label: '정일',
      bg: pink.bg,
      bg2: pink.bg2,
      fg: pink.fg,
      order: 101,
      builtIn: true,
    },
    {
      id: 'status_yeoncha',
      kind: 'status',
      label: '연차',
      bg: purple.bg,
      bg2: purple.bg2,
      fg: purple.fg,
      order: 102,
      builtIn: true,
    },
  ];
  return [...timeCards, ...statusCards];
}
