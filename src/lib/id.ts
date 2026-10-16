let counter = 0;

/** 충돌 걱정 없는 짧은 로컬 ID (서버 없음) */
export function newId(prefix: string): string {
  counter = (counter + 1) % 1296;
  const time = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 6);
  return `${prefix}_${time}${counter.toString(36).padStart(2, '0')}${rand}`;
}
