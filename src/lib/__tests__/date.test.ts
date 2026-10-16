import { describe, expect, it } from '@jest/globals';

import {
  cellKey,
  dayInfo,
  eventColumnRange,
  formatEndTime,
  formatTimeLabel,
  formatTimeRange,
  isISODate,
  normalizeTimeInput,
  parseCellKey,
  parseTimeRange,
  shiftWeek,
  startOfWeekISO,
  weekDates,
  weekRangeLabel,
  weekTitle,
} from '../date';

describe('주 계산 (일요일 시작)', () => {
  it('startOfWeekISO는 그 주의 일요일을 돌려준다', () => {
    expect(startOfWeekISO('2026-10-28')).toBe('2026-10-25'); // 수요일
    expect(startOfWeekISO('2026-10-25')).toBe('2026-10-25'); // 일요일
    expect(startOfWeekISO('2026-10-31')).toBe('2026-10-25'); // 토요일
  });

  it('weekDates는 일~토 7일을 돌려준다', () => {
    const days = weekDates('2026-10-25');
    expect(days).toEqual([
      '2026-10-25',
      '2026-10-26',
      '2026-10-27',
      '2026-10-28',
      '2026-10-29',
      '2026-10-30',
      '2026-10-31',
    ]);
    expect(days.map((d) => dayInfo(d).weekday)).toEqual(['일', '월', '화', '수', '목', '금', '토']);
    expect(dayInfo(days[0]).isSunday).toBe(true);
    expect(dayInfo(days[6]).isSaturday).toBe(true);
  });

  it('shiftWeek는 월 경계를 넘어 주 단위로 이동한다', () => {
    expect(shiftWeek('2026-10-25', 1)).toBe('2026-11-01');
    expect(shiftWeek('2026-10-25', -1)).toBe('2026-10-18');
  });

  it('weekRangeLabel / weekTitle', () => {
    expect(weekRangeLabel('2026-10-25')).toBe('10/25 ~ 10/31');
    expect(weekRangeLabel('2026-12-27')).toBe('12/27 ~ 1/2');
    expect(weekTitle('2026-10-25')).toBe('2026년 10월 25일 ~ 10월 31일');
    expect(weekTitle('2026-12-27')).toBe('2026년 12월 27일 ~ 2027년 1월 2일');
  });

  it('isISODate', () => {
    expect(isISODate('2026-10-25')).toBe(true);
    expect(isISODate('2026-13-45')).toBe(false);
    expect(isISODate('20261025')).toBe(false);
    expect(isISODate(20261025)).toBe(false);
  });
});

describe('행사 띠 열 범위', () => {
  it('11/3~11/6 행사는 11/1 주에서 2~5열', () => {
    expect(eventColumnRange({ start: '2026-11-03', end: '2026-11-06' }, '2026-11-01')).toEqual({
      from: 2,
      to: 5,
    });
  });

  it('주 밖으로 넘치는 기간은 잘라낸다', () => {
    expect(eventColumnRange({ start: '2026-10-29', end: '2026-11-10' }, '2026-11-01')).toEqual({
      from: 0,
      to: 6,
    });
  });

  it('겹치지 않으면 null', () => {
    expect(eventColumnRange({ start: '2026-11-08', end: '2026-11-09' }, '2026-11-01')).toBeNull();
    expect(eventColumnRange({ start: '2026-10-20', end: '2026-10-31' }, '2026-11-01')).toBeNull();
    expect(eventColumnRange({ start: '2026-11-05', end: '2026-11-03' }, '2026-11-01')).toBeNull();
  });
});

describe('시간 입력', () => {
  it.each([
    ['1000', '1000'],
    ['10:00', '1000'],
    ['10', '1000'],
    ['930', '0930'],
    ['9:30', '0930'],
    ['1530', '1530'],
  ])('%s → %s', (input, expected) => {
    expect(normalizeTimeInput(input)).toBe(expected);
  });

  it('잘못된 입력은 null', () => {
    expect(normalizeTimeInput('2460')).toBeNull();
    expect(normalizeTimeInput('')).toBeNull();
    expect(normalizeTimeInput('12345')).toBeNull();
  });

  it('표기 스타일', () => {
    expect(formatTimeLabel('1000')).toBe('10:00');
    expect(formatTimeLabel('1000', 'compact')).toBe('1000');
    expect(formatTimeLabel('0930', 'compact')).toBe('930');
  });
});

describe('cellKey', () => {
  it('왕복 변환', () => {
    const key = cellKey('w_1', '2026-10-25');
    expect(key).toBe('w_1|2026-10-25');
    expect(parseCellKey(key)).toEqual({ workerId: 'w_1', date: '2026-10-25' });
  });
});

describe('시간 범위', () => {
  it.each([
    ['1530~22', { start: '1530', end: '2200' }],
    ['1530-22', { start: '1530', end: '2200' }],
    ['15:30 ~ 22:00', { start: '1530', end: '2200' }],
    ['930-1430', { start: '0930', end: '1430' }],
    ['1000', { start: '1000' }],
    ['1000 22', { start: '1000', end: '2200' }],
  ])('%s 파싱', (input, expected) => {
    expect(parseTimeRange(input)).toEqual(expected);
  });

  it('잘못된 범위는 null', () => {
    expect(parseTimeRange('abc')).toBeNull();
    expect(parseTimeRange('1000~2500')).toBeNull();
    expect(parseTimeRange('1~2~3')).toBeNull();
    expect(parseTimeRange('')).toBeNull();
  });

  it('표기: 설정 스타일대로, 정각 퇴근은 시만', () => {
    expect(formatTimeRange('1530', '2200', 'compact')).toBe('1530~22');
    expect(formatTimeRange('1530', '2130', 'compact')).toBe('1530~2130');
    expect(formatTimeRange('1530', '2200', 'colon')).toBe('15:30~22:00');
    expect(formatTimeRange('0930', undefined, 'compact')).toBe('930');
    expect(formatEndTime('0900', 'compact')).toBe('9');
    expect(formatEndTime('2200')).toBe('22:00');
  });
});
