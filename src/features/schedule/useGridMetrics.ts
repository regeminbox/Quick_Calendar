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

/** 주어진 가용 폭(테두리 제외)에 7일이 들어가도록 열 폭 계산 */
export function computeGridMetrics(availableWidth: number, nameColWidth: number = grid.nameColWidth): GridMetrics {
  const dayColWidth = Math.floor((availableWidth - nameColWidth) / 7);
  return {
    nameColWidth,
    dayColWidth,
    rowHeight: grid.rowHeight,
    headerHeight: grid.headerHeight,
    bandHeight: grid.bandHeight,
    tableWidth: nameColWidth + dayColWidth * 7,
  };
}

/** 화면 폭에 맞춰 7일이 가로 스크롤 없이 들어가도록 열 폭 계산 (태블릿/웹은 520pt에서 멈춤) */
export function useGridMetrics(horizontalPadding = spacing.md): GridMetrics {
  const { width } = useWindowDimensions();
  return computeGridMetrics(Math.min(width, 520) - horizontalPadding * 2 - 2);
}
