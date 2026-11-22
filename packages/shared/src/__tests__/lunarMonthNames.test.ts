import { describe, expect, it } from 'vitest';
import { Solar } from 'lunar-javascript';
import { getDayData, toTraditionalLunarMonth } from '../index';

describe('Lunar month labels in traditional characters (#48)', () => {
  it('labels a Leap Month with 閏', () => {
    expect(getDayData(2023, 4, 1).lunar.monthCn).toBe('閏二');
    expect(getDayData(2023, 4, 1).lunar.dayCn).toBe('十一');
  });

  it('labels the 12th month 臘', () => {
    expect(getDayData(2025, 1, 20).lunar.monthCn).toBe('臘');
    expect(getDayData(2025, 1, 20).lunar.dayCn).toBe('廿一');
  });

  it('leaves ordinary months unchanged', () => {
    expect(toTraditionalLunarMonth('正')).toBe('正');
    expect(toTraditionalLunarMonth('冬')).toBe('冬');
    expect(toTraditionalLunarMonth('十')).toBe('十');
  });

  it('never shows a simplified label from 2020 to 2060', () => {
    const labels = new Set<string>();
    const d = new Date(Date.UTC(2020, 0, 1));
    while (d.getUTCFullYear() <= 2060) {
      const lunar = Solar.fromYmd(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()).getLunar();
      labels.add(toTraditionalLunarMonth(lunar.getMonthInChinese()));
      d.setUTCDate(d.getUTCDate() + 7);
    }
    const simplified = [...labels].filter((l) => /[闰腊]/.test(l));
    expect(simplified).toEqual([]);
    expect(labels).toContain('臘');
    expect([...labels].some((l) => l.startsWith('閏'))).toBe(true);
  });
});
