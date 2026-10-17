export interface MonthQuery {
  year?: number;
  month?: number;
}

/**
 * 검색창 입력 → 년/월.
 * "2027", "2027 3", "2027년 3월", "27년 3월", "3월", "2027/3", "2027.03" 모두 받는다.
 * 숫자가 하나도 없으면 null.
 */
export function parseMonthQuery(input: string): MonthQuery | null {
  const q = input.trim();
  if (!q) return null;
  let year: number | undefined;
  let month: number | undefined;
  const rest: string[] = [];
  const re = /(\d{1,4})\s*(년|월)?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(q))) {
    const digits = m[1];
    const unit = m[2];
    const v = Number(digits);
    if (unit === '년') year = digits.length <= 2 ? 2000 + v : v;
    else if (unit === '월') {
      if (v >= 1 && v <= 12) month = v;
    } else rest.push(digits);
  }
  for (const digits of rest) {
    const v = Number(digits);
    if (digits.length === 4 && year === undefined) year = v;
    else if (v >= 1 && v <= 12 && month === undefined) month = v;
    else if (digits.length === 2 && year === undefined && v > 12) year = 2000 + v;
  }
  if (year === undefined && month === undefined) return null;
  return { year, month };
}
