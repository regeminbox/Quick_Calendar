import { describe, expect, it } from '@jest/globals';

import { cellKey } from '@/lib/date';
import type { CellValue, Worker } from '@/store/types';

import { collectLegend } from '../legend';

const w = (id: string): Worker => ({ id, name: id, order: 0, active: true });
const status = (label: string, bg: string): CellValue => ({ cardId: null, kind: 'status', label, bg, fg: '#000' });
const time = (t: string): CellValue => ({ cardId: null, kind: 'time', label: t, time: t, bg: '#fff', fg: '#000' });

describe('collectLegend', () => {
  it('상태 카드만, 같은 라벨·색은 한 번만', () => {
    const cells = {
      [cellKey('a', '2026-10-25')]: status('정일', '#FDE2E2'),
      [cellKey('a', '2026-10-26')]: time('1000'),
      [cellKey('b', '2026-10-25')]: status('정일', '#FDE2E2'),
      [cellKey('b', '2026-10-27')]: status('연차', '#EDE4FF'),
      [cellKey('c', '2026-10-25')]: status('교육', '#DDEBFF'), // 비활성/목록에 없는 근무자 → 제외
    };
    const legend = collectLegend(cells, [w('a'), w('b')], ['2026-10-25', '2026-10-26', '2026-10-27']);
    expect(legend.map((l) => l.label)).toEqual(['정일', '연차']);
  });

  it('비어 있으면 빈 배열', () => {
    expect(collectLegend({}, [w('a')], ['2026-10-25'])).toEqual([]);
  });
});
