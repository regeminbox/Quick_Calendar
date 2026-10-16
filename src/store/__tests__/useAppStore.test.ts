import { beforeEach, describe, expect, it } from '@jest/globals';

import { cellKey } from '@/lib/date';

import { buildSample, initialState, normalizeImported, useAppStore } from '../useAppStore';

const W1 = '2026-10-25';
const W2 = '2026-11-01';

beforeEach(() => {
  useAppStore.setState({ ...initialState() });
});

describe('근무자', () => {
  it('추가 → 이름 변경 → 순서 이동 → 삭제(셀도 함께 삭제)', () => {
    const s = useAppStore.getState();
    const a = s.addWorker('  김민준 ');
    const b = s.addWorker('이서연');
    expect(useAppStore.getState().workers.map((w) => w.name)).toEqual(['김민준', '이서연']);

    s.renameWorker(a, '김민준2');
    s.moveWorker(b, -1);
    expect(useAppStore.getState().workers.sort((x, y) => x.order - y.order).map((w) => w.name)).toEqual([
      '이서연',
      '김민준2',
    ]);

    const card = useAppStore.getState().cards.find((c) => c.id === 'status_jeongil')!;
    s.setCellCard(a, W1, card);
    expect(useAppStore.getState().cells[cellKey(a, W1)]).toMatchObject({ label: '정일', cardId: 'status_jeongil' });

    s.removeWorker(a);
    expect(useAppStore.getState().workers).toHaveLength(1);
    expect(useAppStore.getState().cells[cellKey(a, W1)]).toBeUndefined();
  });
});

describe('셀과 카드', () => {
  it('카드를 지워도 셀 스냅샷은 남는다', () => {
    const s = useAppStore.getState();
    const w = s.addWorker('박지후');
    s.upsertCard({ id: 'c_edu', kind: 'status', label: '교육', bg: '#DDEBFF', fg: '#1D5FD0' });
    const edu = useAppStore.getState().cards.find((c) => c.id === 'c_edu')!;
    expect(edu.builtIn).toBe(false);
    s.setCellCard(w, W1, edu);
    s.deleteCard('c_edu');
    expect(useAppStore.getState().cards.some((c) => c.id === 'c_edu')).toBe(false);
    expect(useAppStore.getState().cells[cellKey(w, W1)]).toMatchObject({ label: '교육', bg: '#DDEBFF' });
  });

  it('직접 입력 시간은 cardId 없이 저장되고, 지우기가 된다', () => {
    const s = useAppStore.getState();
    const w = s.addWorker('최수아');
    s.setCellTime(w, W1, '0930');
    expect(useAppStore.getState().cells[cellKey(w, W1)]).toMatchObject({ cardId: null, kind: 'time', time: '0930' });
    s.clearCell(w, W1);
    expect(useAppStore.getState().cells[cellKey(w, W1)]).toBeUndefined();
  });
});

describe('주 단위 작업', () => {
  it('지난주 복사는 날짜-7의 값을 그대로 가져오고 비어 있으면 비운다', () => {
    const s = useAppStore.getState();
    const w = s.addWorker('정하준');
    const t1000 = useAppStore.getState().cards.find((c) => c.id === 'time_1000')!;
    s.setCellCard(w, '2026-10-26', t1000); // 10/25 주 월요일
    s.setCellTime(w, '2026-11-04', '1100'); // 11/1 주 수요일(복사 후 비워져야 함)
    s.copyPreviousWeek(W2);
    const cells = useAppStore.getState().cells;
    expect(cells[cellKey(w, '2026-11-02')]).toMatchObject({ time: '1000' });
    expect(cells[cellKey(w, '2026-11-04')]).toBeUndefined();
  });

  it('주 비우기', () => {
    const s = useAppStore.getState();
    const w = s.addWorker('근무자');
    s.setCellTime(w, '2026-11-02', '1000');
    s.setCellTime(w, '2026-10-26', '1000');
    s.clearWeek(W2);
    const cells = useAppStore.getState().cells;
    expect(cells[cellKey(w, '2026-11-02')]).toBeUndefined();
    expect(cells[cellKey(w, '2026-10-26')]).toBeDefined();
  });
});

describe('행사', () => {
  it('시작/종료가 뒤집혀도 정렬해서 저장하고, 빈 제목은 기본 제목', () => {
    const s = useAppStore.getState();
    const id = s.upsertEvent({ title: '  ', start: '2026-11-06', end: '2026-11-03', color: '#FFD200', icon: 'whale' });
    const e = useAppStore.getState().events.find((x) => x.id === id)!;
    expect(e).toMatchObject({ title: '고래잇 행사', start: '2026-11-03', end: '2026-11-06' });
    s.upsertEvent({ ...e, title: '고래잇 페스타' });
    expect(useAppStore.getState().events).toHaveLength(1);
    s.deleteEvent(id);
    expect(useAppStore.getState().events).toHaveLength(0);
  });
});

describe('예시 데이터 / 백업', () => {
  it('buildSample은 5명 + 35칸 + 고래잇 행사 하나', () => {
    const sample = buildSample(new Date(2026, 9, 28));
    expect(sample.workers).toHaveLength(5);
    expect(Object.keys(sample.cells)).toHaveLength(35);
    expect(sample.events[0]).toMatchObject({ title: '고래잇 행사', start: '2026-10-27', end: '2026-10-30' });
  });

  it('normalizeImported는 빠진 필드를 기본값으로 채운다', () => {
    const out = normalizeImported({ version: 1, workers: [], cards: [], events: [], cells: {}, settings: { storeName: '테스트' } } as never);
    expect(out.cards.length).toBeGreaterThan(0);
    expect(out.settings).toMatchObject({ storeName: '테스트', timeStyle: 'compact' });
  });
});
