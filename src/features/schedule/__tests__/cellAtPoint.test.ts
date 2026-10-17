import { describe, expect, it } from '@jest/globals';

import { cellAtPoint } from '../cellAtPoint';

const m = { nameColWidth: 60, dayColWidth: 46, rowHeight: 44 };

describe('cellAtPoint', () => {
  it('좌표 → 행·열', () => {
    expect(cellAtPoint(61, 0, m, 3)).toEqual({ row: 0, col: 0 });
    expect(cellAtPoint(60 + 46 * 6 + 10, 44 * 2 + 5, m, 3)).toEqual({ row: 2, col: 6 });
    expect(cellAtPoint(60 + 46 * 3 + 1, 50, m, 3)).toEqual({ row: 1, col: 3 });
  });

  it('이름 열·표 밖·행 없음은 null', () => {
    expect(cellAtPoint(10, 10, m, 3)).toBeNull();
    expect(cellAtPoint(60 + 46 * 7 + 1, 10, m, 3)).toBeNull();
    expect(cellAtPoint(100, 44 * 3 + 1, m, 3)).toBeNull();
    expect(cellAtPoint(100, -1, m, 3)).toBeNull();
    expect(cellAtPoint(100, 10, m, 0)).toBeNull();
  });
});
