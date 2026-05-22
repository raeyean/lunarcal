import { describe, it, expect } from 'vitest';
import { computeBazi } from '../bazi/compute';
import { BaziError } from '../bazi/errors';
import type { BirthProfile } from '../bazi/types';

const profile = (overrides: Partial<BirthProfile> = {}): BirthProfile => ({
  version: 1,
  solarDate: '1990-06-15',
  solarTime: '14:30',
  gender: 'male',
  createdAt: '2026-05-18T00:00:00.000Z',
  updatedAt: '2026-05-18T00:00:00.000Z',
  ...overrides,
});

describe('computeBazi — pillars', () => {
  it('returns the four pillars for a known birthday', () => {
    const chart = computeBazi(profile());
    expect(chart.year.ganZhi).toBe('庚午');
    expect(chart.month.ganZhi).toBe('壬午');
    expect(chart.day.ganZhi).toBe('辛亥');
    expect(chart.time?.ganZhi).toBe('乙未');
    expect(chart.dayMaster).toBe('辛');
    expect(chart.dayMasterWuXing).toBe('金');
    expect(chart.hasTime).toBe(true);
  });

  it('marks time pillar null when solarTime is null', () => {
    const chart = computeBazi(profile({ solarTime: null }));
    expect(chart.hasTime).toBe(false);
    expect(chart.time).toBeNull();
  });

  it('still returns year/month/day when solarTime is null', () => {
    const chart = computeBazi(profile({ solarTime: null }));
    expect(chart.year.ganZhi).toBe('庚午');
    expect(chart.month.ganZhi).toBe('壬午');
    expect(chart.day.ganZhi).toBe('辛亥');
  });

  it('handles 立春 boundary (1985-02-04 06:00 → year pillar starts with 乙)', () => {
    const chart = computeBazi(profile({
      solarDate: '1985-02-04',
      solarTime: '06:00',
    }));
    // 1985 立春 falls on 1985-02-04 ~04:12; after 立春 year stem advances.
    expect(chart.year.gan).toBe('乙');
    expect(chart.year.zhi).toBe('丑');
  });

  it('wuXingCounts sums to 8 when time is set', () => {
    const chart = computeBazi(profile());
    const total = Object.values(chart.wuXingCounts).reduce((a, b) => a + b, 0);
    expect(total).toBe(8);
  });

  it('wuXingCounts sums to 6 when time is null', () => {
    const chart = computeBazi(profile({ solarTime: null }));
    const total = Object.values(chart.wuXingCounts).reduce((a, b) => a + b, 0);
    expect(total).toBe(6);
  });

  it('throws BaziError INVALID_DATE for year < 1900', () => {
    expect(() => computeBazi(profile({ solarDate: '1850-01-01' }))).toThrow(BaziError);
    try {
      computeBazi(profile({ solarDate: '1850-01-01' }));
    } catch (e) {
      expect((e as BaziError).code).toBe('INVALID_DATE');
    }
  });

  it('throws BaziError INVALID_DATE for year > 2100', () => {
    expect(() => computeBazi(profile({ solarDate: '2200-01-01' }))).toThrow(BaziError);
  });

  it('throws BaziError INVALID_DATE for malformed solarDate', () => {
    expect(() => computeBazi(profile({ solarDate: 'not-a-date' }))).toThrow(BaziError);
  });

  it('throws BaziError INVALID_TIME for malformed solarTime', () => {
    expect(() => computeBazi(profile({ solarTime: '25:99' }))).toThrow(BaziError);
    try {
      computeBazi(profile({ solarTime: '25:99' }));
    } catch (e) {
      expect((e as BaziError).code).toBe('INVALID_TIME');
    }
  });

  it('throws BaziError INVALID_TIME for non-time-format string', () => {
    expect(() => computeBazi(profile({ solarTime: 'abc' }))).toThrow(BaziError);
  });
});
