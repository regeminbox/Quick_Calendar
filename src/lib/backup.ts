import { format } from 'date-fns';

import { SCHEMA_VERSION, type PersistedState } from '@/store/types';
import { normalizeImported } from '@/store/useAppStore';

export const BACKUP_APP_ID = 'quickcalendar';

export interface BackupFile {
  app: typeof BACKUP_APP_ID;
  version: typeof SCHEMA_VERSION;
  exportedAt: string;
  data: PersistedState;
}

export function backupFileName(now: Date = new Date()): string {
  return `quickcalendar-backup-${format(now, 'yyyyMMdd-HHmm')}.json`;
}

export function serializeBackup(state: PersistedState, now: Date = new Date()): string {
  const file: BackupFile = {
    app: BACKUP_APP_ID,
    version: SCHEMA_VERSION,
    exportedAt: now.toISOString(),
    data: state,
  };
  return JSON.stringify(file, null, 2);
}

/** 백업 JSON 문자열 → 저장 가능한 상태. 형식이 아니면 한국어 메시지로 throw */
export function parseBackup(json: string): PersistedState {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('JSON 파일이 아니에요.');
  }
  if (!parsed || typeof parsed !== 'object') throw new Error('백업 파일 형식이 아니에요.');
  const obj = parsed as Partial<BackupFile> & Partial<PersistedState>;
  const data =
    obj.app === BACKUP_APP_ID && obj.data && typeof obj.data === 'object'
      ? obj.data
      : (obj as Partial<PersistedState>);
  if (!Array.isArray(data.workers) || !data.cells || typeof data.cells !== 'object') {
    throw new Error('퀵캘린더 백업 파일이 아니에요.');
  }
  if (typeof data.version === 'number' && data.version > SCHEMA_VERSION) {
    throw new Error('더 새로운 버전의 앱에서 만든 백업이에요. 앱을 업데이트해 주세요.');
  }
  return normalizeImported(data as PersistedState);
}
