/**
 * 디자인 토큰 — 이마트 노랑 포인트 + 웜 그레이 배경, 색은 상태 표시에만 사용.
 * 레퍼런스: ref.theseeker.io/r/7391 (톤), /r/3398 (노랑 위계), /r/7484 (표 구조)
 */
export const colors = {
  brand: {
    yellow: '#FFD200',
    yellowDeep: '#F2B600',
    yellowSoft: '#FFF1A8',
    yellowPale: '#FFFBE6',
  },
  surface: {
    bg: '#F6F5F1',
    card: '#FFFFFF',
    border: '#E6E3DC',
    muted: '#ECEAE4',
    overlay: 'rgba(20, 20, 20, 0.35)',
  },
  text: {
    primary: '#141414',
    secondary: '#6F6B63',
    tertiary: '#A39F96',
    inverse: '#FFFFFF',
    onYellow: '#141414',
  },
  weekday: {
    sun: '#D13B3B',
    sat: '#2F6BD6',
  },
  feedback: {
    danger: '#D13B3B',
    success: '#1E7A46',
  },
} as const;

/** 커스텀 카드 색 선택지 (배경/글자 쌍). 8종. */
export const cardPalette = [
  { key: 'yellow', name: '노랑', bg: '#FFF1A8', fg: '#8A6400' },
  { key: 'orange', name: '주황', bg: '#FFE3C2', fg: '#B45309' },
  { key: 'pink', name: '분홍', bg: '#FDE2E2', fg: '#D13B3B' },
  { key: 'green', name: '초록', bg: '#DDF3E4', fg: '#1E7A46' },
  { key: 'blue', name: '파랑', bg: '#DDEBFF', fg: '#1D5FD0' },
  { key: 'purple', name: '보라', bg: '#EDE4FF', fg: '#6B3FD1' },
  { key: 'gray', name: '회색', bg: '#ECEAE4', fg: '#6F6B63' },
  { key: 'black', name: '검정', bg: '#141414', fg: '#FFFFFF' },
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
