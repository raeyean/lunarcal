import { describe, expect, it } from 'vitest';
import { LunarUtil, Solar } from 'lunar-javascript';
import { ACTIVITY_NAMES_TRADITIONAL, dayYi, getDayData, meaningsFor } from '../index';
// The 擇吉 finder's activity list lives in the app; it is plain data.
import { ALL_ACTIVITIES } from '../../../../src/constants/activities';

describe('Activity names in traditional characters (#42)', () => {
  const table = ACTIVITY_NAMES_TRADITIONAL;

  it('covers every lunar-javascript Activity', () => {
    const yiJi: string[] = LunarUtil.YI_JI;
    const missing = yiJi.filter((name) => !(name in table));
    expect(missing).toEqual([]);
    expect(Object.keys(table).sort()).toEqual([...new Set(yiJi)].sort());
  });

  it('leaves no simplified character behind', () => {
    // Every character the table converts somewhere is a simplified form; none
    // may survive in any converted name.
    const simplified = new Set<string>();
    for (const [s, t] of Object.entries(table)) {
      const sc = [...s];
      const tc = [...t];
      expect(tc.length).toBe(sc.length);
      sc.forEach((c, i) => {
        if (c !== tc[i]) simplified.add(c);
      });
    }
    const leftovers = Object.values(table).filter((t) => [...t].some((c) => simplified.has(c)));
    expect(leftovers).toEqual([]);
  });

  it('getDayData returns traditional 宜/忌', () => {
    const day = getDayData(2026, 11, 21);
    expect(day.yi.slice(0, 3)).toEqual(['解除', '修飾垣牆', '冠笄']);
    expect(day.ji).toContain('開市');
    expect(day.ji).toContain('動土');
  });

  it('every 擇吉 finder Activity is found on at least one day in 2026', () => {
    const seen = new Set<string>();
    for (let d = new Date(Date.UTC(2026, 0, 1)); d.getUTCFullYear() === 2026; d.setUTCDate(d.getUTCDate() + 1)) {
      const lunar = Solar.fromYmd(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()).getLunar();
      for (const name of dayYi(lunar)) seen.add(name);
    }
    const neverFound = ALL_ACTIVITIES.filter((a) => !seen.has(a));
    expect(neverFound).toEqual([]);
  });

  it('meaningsFor finds meanings for traditional names', () => {
    expect(meaningsFor(['開市', '啟攢']).map((m) => m.name)).toEqual(['開市', '啟攢']);
  });
});
