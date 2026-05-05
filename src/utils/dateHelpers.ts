export type YearMonth = { year: number; month: number };
export type YearMonthDay = { year: number; month: number; day: number };

export function getPrevMonth(year: number, month: number): YearMonth {
  return month === 1
    ? { year: year - 1, month: 12 }
    : { year, month: month - 1 };
}

export function getNextMonth(year: number, month: number): YearMonth {
  return month === 12
    ? { year: year + 1, month: 1 }
    : { year, month: month + 1 };
}

export function getPrevDay(year: number, month: number, day: number): YearMonthDay {
  const d = new Date(year, month - 1, day - 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
}

export function getNextDay(year: number, month: number, day: number): YearMonthDay {
  const d = new Date(year, month - 1, day + 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
}
