import type { GridMetrics } from './useGridMetrics';

export interface CellPoint {
  row: number;
  /** 0 = 일요일 … 6 = 토요일 */
  col: number;
}

/** 근무자 행 영역 안의 좌표 → (행, 요일 열). 이름 열이나 표 밖이면 null */
export function cellAtPoint(
  x: number,
  y: number,
  metrics: Pick<GridMetrics, 'nameColWidth' | 'dayColWidth' | 'rowHeight'>,
  rowCount: number,
): CellPoint | null {
  if (rowCount <= 0 || y < 0) return null;
  const col = Math.floor((x - metrics.nameColWidth) / metrics.dayColWidth);
  const row = Math.floor(y / metrics.rowHeight);
  if (col < 0 || col > 6 || row >= rowCount) return null;
  return { row, col };
}
