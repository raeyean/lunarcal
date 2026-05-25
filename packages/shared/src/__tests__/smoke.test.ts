import { describe, it, expect } from 'vitest';
import { getMonthDays } from '../lunar/index';

describe('vitest setup', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});

describe('getMonthDays — padding cells', () => {
  it('leading cells come from the previous month', () => {
    // May 2026 starts on a Friday (weekday 5).
    // Cells 0–4 should be from April 2026 (days 26–30).
    const weeks = getMonthDays(2026, 5);
    const firstRow = weeks[0];
    // leading cells: 5 cells (Mon=0 … Thu=3 is 4, Fri=5 means 5 leading)
    // Actually Solar.getWeek() returns 0=Sun … 6=Sat.
    // May 1 2026 is Friday = weekday 5.
    expect(firstRow[0].solar.month).toBe(4); // April
    expect(firstRow[0].solar.day).toBe(26);  // April 26
    expect(firstRow[4].solar.month).toBe(4); // April
    expect(firstRow[4].solar.day).toBe(30);  // April 30
    expect(firstRow[5].solar.month).toBe(5); // May 1
  });

  it('trailing cells come from the next month', () => {
    // May 2026: 31 days, starts Fri, last row ends on a Saturday (day 31).
    // No trailing cells needed in this case.
    // Use April 2026: starts Wed (weekday 3), 30 days.
    // Last partial row: Apr 27 (Sun) … Apr 30 (Wed) → 3 trailing cells (Thu–Sat from May).
    const weeks = getMonthDays(2026, 4);
    const lastRow = weeks[weeks.length - 1];
    const trailingCells = lastRow.filter(c => c.solar.month !== 4);
    expect(trailingCells.length).toBeGreaterThan(0);
    expect(trailingCells[0].solar.month).toBe(5); // May
    expect(trailingCells[0].solar.day).toBe(1);   // May 1
  });

  it('leading/trailing cells have isCurrentMonth false', () => {
    const weeks = getMonthDays(2026, 5);
    const firstRow = weeks[0];
    for (let i = 0; i < 5; i++) {
      expect(firstRow[i].isCurrentMonth).toBe(false);
    }
    expect(firstRow[5].isCurrentMonth).toBe(true);
  });
});
