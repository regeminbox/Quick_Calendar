import type { ISODate, TimeStyle } from '@/lib/date';

export interface Worker {
  id: string;
  name: string;
  order: number;
  active: boolean;
}

export type CardKind = 'time' | 'status';

/** 셀에 넣는 "카드". 시간 카드(출근 시각)와 상태 카드(휴무·정일·연차·커스텀) */
export interface Card {
  id: string;
  kind: CardKind;
  /** 상태 카드의 표시 글자 (≤4자 권장). 시간 카드는 time에서 파생 */
  label: string;
  /** kind === 'time' 일 때 출근 'HHmm' */
  time?: string;
  /** 퇴근 'HHmm' (범위 카드, 예: 1530~22) */
  endTime?: string;
  bg: string;
  /** 그라데이션 끝색 (없으면 단색) */
  bg2?: string;
  fg: string;
  order: number;
  builtIn: boolean;
}

/** 셀 값 — 카드가 나중에 삭제·수정돼도 표가 깨지지 않도록 스냅샷을 함께 저장 */
export interface CellValue {
  cardId: string | null;
  kind: CardKind;
  label: string;
  time?: string;
  endTime?: string;
  bg: string;
  bg2?: string;
  fg: string;
}

/** 날짜 헤더 위에 띠로 표시되는 행사 (예: 고래잇 행사 11/3~11/6) */
export interface CalendarEvent {
  id: string;
  title: string;
  start: ISODate;
  end: ISODate;
  color: string;
  /** 띠 그라데이션 끝색 (없으면 단색) */
  color2?: string;
  icon: 'star' | 'none';
}

export interface Settings {
  storeName: string;
  timeStyle: TimeStyle;
  /** 첫 실행 안내를 마쳤는지 */
  onboarded: boolean;
}

export const SCHEMA_VERSION = 1 as const;

export interface PersistedState {
  version: typeof SCHEMA_VERSION;
  workers: Worker[];
  cards: Card[];
  events: CalendarEvent[];
  /** key = `${workerId}|${ISODate}` */
  cells: Record<string, CellValue>;
  settings: Settings;
}
