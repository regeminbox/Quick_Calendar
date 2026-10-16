import { cellKey, type ISODate } from '@/lib/date';
import type { CellValue, Worker } from '@/store/types';

export interface LegendItem {
  label: string;
  bg: string;
  fg: string;
}

/** 이번 주 표에 실제로 쓰인 상태 카드만 범례로 (라벨+색 기준 중복 제거) */
export function collectLegend(
  cells: Record<string, CellValue>,
  workers: Worker[],
  dates: ISODate[],
): LegendItem[] {
  const seen = new Map<string, LegendItem>();
  for (const worker of workers) {
    for (const date of dates) {
      const value = cells[cellKey(worker.id, date)];
      if (!value || value.kind !== 'status') continue;
      const key = `${value.label}|${value.bg}|${value.fg}`;
      if (!seen.has(key)) seen.set(key, { label: value.label, bg: value.bg, fg: value.fg });
    }
  }
  return [...seen.values()];
}
