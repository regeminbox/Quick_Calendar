import { describe, expect, it } from '@jest/globals';

import { buildSample } from '@/store/useAppStore';

import { backupFileName, parseBackup, serializeBackup } from '../backup';

describe('backup', () => {
  it('내보내기 → 가져오기 왕복', () => {
    const state = buildSample(new Date(2026, 9, 28));
    const json = serializeBackup(state, new Date(2026, 9, 28, 15, 30));
    const parsed = JSON.parse(json);
    expect(parsed.app).toBe('quickcalendar');
    expect(parsed.exportedAt).toContain('2026-10-28');
    const restored = parseBackup(json);
    expect(restored.workers).toHaveLength(5);
    expect(Object.keys(restored.cells)).toHaveLength(35);
    expect(restored.events[0].title).toBe('고래잇 행사');
  });

  it('래퍼 없이 상태만 있어도 받아들인다', () => {
    const state = buildSample();
    const restored = parseBackup(JSON.stringify(state));
    expect(restored.workers).toHaveLength(5);
  });

  it('잘못된 입력은 한국어 메시지로 거부', () => {
    expect(() => parseBackup('not json')).toThrow('JSON 파일이 아니에요.');
    expect(() => parseBackup('{"hello":1}')).toThrow('퀵캘린더 백업 파일이 아니에요.');
    expect(() =>
      parseBackup(
        JSON.stringify({ app: 'quickcalendar', data: { version: 99, workers: [], cells: {} } }),
      ),
    ).toThrow('더 새로운 버전');
  });

  it('파일 이름에 날짜·시각', () => {
    expect(backupFileName(new Date(2026, 9, 16, 9, 5))).toBe(
      'quickcalendar-backup-20261016-0905.json',
    );
  });
});
