import { create } from 'zustand';

export type BrushTool = 'card' | 'edit' | 'erase';

interface BrushState {
  tool: BrushTool;
  /** tool === 'card'일 때 들어갈 카드 id. null이면 첫 시간 카드 */
  cardId: string | null;
  select: (tool: BrushTool, cardId?: string) => void;
}

/** 근무표 위 카드 줄에서 고른 "지금 넣을 카드"(브러시). 세션 동안만 기억한다 */
export const useBrush = create<BrushState>((set) => ({
  tool: 'card',
  cardId: null,
  select: (tool, cardId) => set((s) => ({ tool, cardId: cardId ?? s.cardId })),
}));
