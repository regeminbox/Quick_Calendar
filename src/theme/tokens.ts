/**
 * 디자인 토큰 — 밝은 중성 배경 + 인디고 포인트 + 파스텔 상태색(연두·라벤더·분홍·살구·하늘·노랑).
 * 캘린더 레퍼런스 톤을 따르고, 색은 상태·선택 표시에만 쓴다. 고래잇 행사 띠만 파스텔 노랑을 기본으로 둔다.
 */
export const colors = {
  brand: {
    /** 포인트 — 버튼·오늘·선택 (레퍼런스의 인디고) */
    primary: '#5B5FE8',
    primaryDeep: '#4549CC',
    /** 연한 라벤더 — 날짜 헤더, 선택한 주 */
    primarySoft: '#E6E5FF',
    /** 아주 연한 라벤더 — 오늘 열, 안내 상자 */
    primaryPale: '#F4F3FF',
    /** 고래잇 행사 띠 기본색 — 파스텔 노랑 */
    yellow: '#FFE38A',
    yellowDeep: '#D9A400',
    yellowSoft: '#FFF1B8',
    yellowPale: '#FFFBE6',
  },
  surface: {
    bg: '#F3F3F1',
    card: '#FFFFFF',
    border: '#E7E6E2',
    muted: '#EEEEEB',
    overlay: 'rgba(23, 23, 28, 0.35)',
  },
  text: {
    primary: '#17171C',
    secondary: '#6E7281',
    tertiary: '#A3A6B0',
    inverse: '#FFFFFF',
    onYellow: '#17171C',
    onPrimary: '#FFFFFF',
  },
  weekday: {
    sun: '#D14B4B',
    sat: '#3B6FD6',
  },
  feedback: {
    danger: '#D14B4B',
    dangerSoft: '#FDE1E1',
    success: '#2E8A5A',
  },
} as const;

/** 커스텀 카드 색 선택지 (배경/글자 쌍). 8종 — 파스텔 배경 + 진한 글자 */
export const cardPalette = [
  { key: 'yellow', name: '노랑', bg: '#FFF1B8', fg: '#8A6400' },
  { key: 'orange', name: '살구', bg: '#FFE6CC', fg: '#B35A0B' },
  { key: 'pink', name: '분홍', bg: '#FDE1F0', fg: '#C22A7A' },
  { key: 'green', name: '연두', bg: '#E6F5CF', fg: '#4A7A14' },
  { key: 'blue', name: '하늘', bg: '#DAEBFF', fg: '#1D5FC9' },
  { key: 'purple', name: '라벤더', bg: '#EADFFB', fg: '#5E33C2' },
  { key: 'mint', name: '민트', bg: '#D8F3EA', fg: '#107A5E' },
  { key: 'gray', name: '회색', bg: '#ECEAE4', fg: '#6F6B63' },
] as const;

export type CardPaletteKey = (typeof cardPalette)[number]['key'];

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 10, md: 14, lg: 20, pill: 999 } as const;

export const fonts = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
} as const;

export const typography = {
  title: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 28 },
  heading: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22 },
  body: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 20 },
  caption: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
  cell: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 14 },
} as const;

/** 390pt 폭 기준 그리드 치수 — 이름 열 60 + 7×46 = 382 (가로 스크롤 없음) */
export const grid = {
  nameColWidth: 60,
  dayColWidth: 46,
  rowHeight: 44,
  headerHeight: 52,
  bandHeight: 24,
  gap: 2,
} as const;
