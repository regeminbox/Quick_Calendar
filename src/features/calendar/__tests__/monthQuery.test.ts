import { describe, expect, it } from '@jest/globals';

import { parseMonthQuery } from '../monthQuery';

describe('parseMonthQuery', () => {
  it.each([
    ['2027', { year: 2027, month: undefined }],
    ['2027 3', { year: 2027, month: 3 }],
    ['2027년 3월', { year: 2027, month: 3 }],
    ['27년 3월', { year: 2027, month: 3 }],
    ['3월', { year: undefined, month: 3 }],
    ['2027/3', { year: 2027, month: 3 }],
    ['2027.03', { year: 2027, month: 3 }],
    ['12', { year: undefined, month: 12 }],
    ['26', { year: 2026, month: undefined }],
    ['3 2027', { year: 2027, month: 3 }],
  ])('%s', (input, expected) => {
    expect(parseMonthQuery(input)).toEqual(expected);
  });

  it('숫자가 없으면 null', () => {
    expect(parseMonthQuery('')).toBeNull();
    expect(parseMonthQuery('abc')).toBeNull();
    expect(parseMonthQuery('13월')).toBeNull();
  });
});
