import { useWindowDimensions } from 'react-native';

import { grid, spacing } from '@/theme/tokens';

export interface GridMetrics {
  nameColWidth: number;
  dayColWidth: number;
  rowHeight: number;
  headerHeight: number;
  bandHeight: number;
  tableWidth: number;
}

/** 화면 폭에 맞춰 7일이 가로 스크롤 없이 들어가도록 열 폭 계산 (태블릿/웹은 520pt에서 멈춤) */
export function useGridMetrics(horizontalPadding = spacing.md): GridMetrics {
  const { width } = useWindowDimensions();
  const inner = Math.min(width, 520) - horizontalPadding * 2 - 2;
  const nameColWidth = grid.nameColWidth;
  const dayColWidth = Math.floor((inner - nameColWidth) / 7);
  return {
    nameColWidth,
    dayColWidth,
    rowHeight: grid.rowHeight,
    headerHeight: grid.headerHeight,
    bandHeight: grid.bandHeight,
    tableWidth: nameColWidth + dayColWidth * 7,
  };
}
