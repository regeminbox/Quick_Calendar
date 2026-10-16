import { addDays, differenceInCalendarDays, format, isValid, parseISO, startOfWeek } from 'date-fns';

/** 'yyyy-MM-dd' 형식의 로컬 달력 날짜 */
export type ISODate = string;

/** 근무표는 엑셀과 동일하게 일요일 시작 */
export const WEEK_STARTS_ON = 0 as const;
export const WEEKDAY_KO = ['일', '월', '화', '수', '목', '금', '토'] as const;
export type WeekdayKo = (typeof WEEKDAY_KO)[number];

export function toISODate(date: Date): ISODate {
  return format(date, 'yyyy-MM-dd');
}

export function fromISODate(iso: ISODate): Date {
  const d = parseISO(iso);
  if (!isValid(d)) throw new Error(`Invalid ISO date: ${iso}`);
  return d;
}

export function isISODate(value: unknown): value is ISODate {
  return (
    typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && isValid(parseISO(value))
  );
}

export function startOfWeekISO(date: Date | ISODate): ISODate {
  const d = typeof date === 'string' ? fromISODate(date) : date;
  return toISODate(startOfWeek(d, { weekStartsOn: WEEK_STARTS_ON }));
}

export function addDaysISO(iso: ISODate, days: number): ISODate {
  return toISODate(addDays(fromISODate(iso), days));
}

/** 주 시작일(일요일)부터 7일 */
export function weekDates(weekStart: ISODate): ISODate[] {
  const start = fromISODate(weekStart);
  return Array.from({ length: 7 }, (_, i) => toISODate(addDays(start, i)));
}

export function shiftWeek(weekStart: ISODate, deltaWeeks: number): ISODate {
  return addDaysISO(weekStart, deltaWeeks * 7);
}

export function todayISO(now: Date = new Date()): ISODate {
  return toISODate(now);
}

export interface DayInfo {
  iso: ISODate;
  day: number;
  month: number;
  weekdayIndex: number;
  weekday: WeekdayKo;
  isSunday: boolean;
  isSaturday: boolean;
}

export function dayInfo(iso: ISODate): DayInfo {
  const d = fromISODate(iso);
  const weekdayIndex = d.getDay();
  return {
    iso,
    day: d.getDate(),
    month: d.getMonth() + 1,
    weekdayIndex,
    weekday: WEEKDAY_KO[weekdayIndex],
    isSunday: weekdayIndex === 0,
    isSaturday: weekdayIndex === 6,
  };
}

/** '10/25 ~ 10/31' (해가 바뀌어도 월/일만) */
export function weekRangeLabel(weekStart: ISODate): string {
  const start = fromISODate(weekStart);
  const end = addDays(start, 6);
  return `${format(start, 'M/d')} ~ ${format(end, 'M/d')}`;
}

/** '2026년 10월 25일 ~ 10월 31일' — 공유 이미지 제목용 */
export function weekTitle(weekStart: ISODate): string {
  const start = fromISODate(weekStart);
  const end = addDays(start, 6);
  const sameYear = start.getFullYear() === end.getFullYear();
  return sameYear
    ? `${format(start, 'yyyy년 M월 d일')} ~ ${format(end, 'M월 d일')}`
    : `${format(start, 'yyyy년 M월 d일')} ~ ${format(end, 'yyyy년 M월 d일')}`;
}

/** 'M월 d일 (요일)' */
export function dateLabel(iso: ISODate): string {
  const info = dayInfo(iso);
  return `${info.month}월 ${info.day}일 (${info.weekday})`;
}

/**
 * 기간 [start, end] (양끝 포함)이 해당 주와 겹치는 열 범위(0~6).
 * 겹치지 않으면 null. 주 밖으로 넘치는 부분은 잘라낸다.
 */
export function eventColumnRange(
  range: { start: ISODate; end: ISODate },
  weekStart: ISODate,
): { from: number; to: number } | null {
  const ws = fromISODate(weekStart);
  const from = differenceInCalendarDays(fromISODate(range.start), ws);
  const to = differenceInCalendarDays(fromISODate(range.end), ws);
  if (to < 0 || from > 6 || to < from) return null;
  return { from: Math.max(0, from), to: Math.min(6, to) };
}

export function cellKey(workerId: string, date: ISODate): string {
  return `${workerId}|${date}`;
}

export function parseCellKey(key: string): { workerId: string; date: ISODate } {
  const i = key.lastIndexOf('|');
  return { workerId: key.slice(0, i), date: key.slice(i + 1) };
}

/** '1000' | '10:00' | '10' | '930' | '9:30' → 'HHmm'. 잘못된 입력은 null */
export function normalizeTimeInput(input: string): string | null {
  const digits = input.replace(/[^0-9]/g, '');
  if (digits.length === 0 || digits.length > 4) return null;
  let h: number;
  let m: number;
  if (digits.length <= 2) {
    h = Number(digits);
    m = 0;
  } else if (digits.length === 3) {
    h = Number(digits[0]);
    m = Number(digits.slice(1));
  } else {
    h = Number(digits.slice(0, 2));
    m = Number(digits.slice(2));
  }
  if (h > 23 || m > 59) return null;
  return `${String(h).padStart(2, '0')}${String(m).padStart(2, '0')}`;
}

export type TimeStyle = 'colon' | 'compact';

/** 'HHmm' → '10:00' (colon) 또는 '1000' (compact, 엑셀 표기) */
export function formatTimeLabel(hhmm: string, style: TimeStyle = 'colon'): string {
  const n = normalizeTimeInput(hhmm) ?? hhmm;
  if (style === 'compact') return n.replace(/^0/, '');
  return `${n.slice(0, 2)}:${n.slice(2)}`;
}
