import { addDays, getDaysInMonth } from 'date-fns';

import { fromISODate, type ISODate, startOfWeekISO, toISODate } from '@/lib/date';

export interface MonthInfo {
  /** 그 달 1일 (ISO) */
  key: ISODate;
  year: number;
  /** 1~12 */
  month: number;
  /** 달력에 보이는 각 주의 일요일 (5~6개) */
  weeks: ISODate[];
}

export function monthInfo(year: number, month: number): MonthInfo {
  const first = new Date(year, month - 1, 1);
  const rows = Math.ceil((first.getDay() + getDaysInMonth(first)) / 7);
  const gridStart = fromISODate(startOfWeekISO(first));
  const weeks = Array.from({ length: rows }, (_, r) => toISODate(addDays(gridStart, r * 7)));
  return { key: toISODate(first), year, month, weeks };
}

/** 한 해의 12달 */
export function monthsOfYear(year: number): MonthInfo[] {
  return Array.from({ length: 12 }, (_, i) => monthInfo(year, i + 1));
}
