import { describe, it, expect } from 'vitest';
import { computeCompat } from '../bazi/compat';

describe('computeCompat — scoring matrix', () => {
  it('5 stars for 干合 + 三合 (甲申 vs 己子)', () => {
    const r = computeCompat('甲申', '己子');
    expect(r.stars).toBe(5);
    expect(r.reasonKey).toBe('tianHe_diHe');
  });

  it('5 stars for 干合 + 六合 (甲子 vs 己丑)', () => {
    const r = computeCompat('甲子', '己丑');
    expect(r.stars).toBe(5);
    expect(r.reasonKey).toBe('tianHe_diHe');
  });

  it('4 stars for 干合 only (甲寅 vs 己丑)', () => {
    const r = computeCompat('甲寅', '己丑');
    expect(r.stars).toBe(4);
    expect(r.reasonKey).toBe('tianHe');
  });

  it('4 stars for 三合 only (丙申 vs 戊子)', () => {
    const r = computeCompat('丙申', '戊子');
    expect(r.stars).toBe(4);
    expect(r.reasonKey).toBe('sanHe');
  });

  it('4 stars for 六合 only (丙子 vs 戊丑)', () => {
    const r = computeCompat('丙子', '戊丑');
    expect(r.stars).toBe(4);
    expect(r.reasonKey).toBe('liuHe');
  });

  it('4 stars for 生我 only (辛巳 vs 戊辰: 戊土生辛金, 巳辰 無關)', () => {
    const r = computeCompat('辛巳', '戊辰');
    expect(r.stars).toBe(4);
    expect(r.reasonKey).toBe('shengWo');
  });

  it('3 stars for 比和 (same wuxing, no special zhi relation)', () => {
    // 甲寅 vs 乙未 — both 木 gan; 寅未 no relation
    const safe = computeCompat('甲寅', '乙未');
    expect(safe.stars).toBe(3);
    expect(safe.reasonKey).toBe('biHe');
  });

  it('3 stars for neutral (no relation either side)', () => {
    // 甲子 vs 丁亥: 甲丁 no he/sheng/ke; 子亥 no relation
    const r = computeCompat('甲子', '丁亥');
    expect(r.stars).toBe(3);
    expect(r.reasonKey).toBe('neutral');
  });

  it('2 stars for 剋我 (target gan controls user gan)', () => {
    // 甲寅 vs 庚未 — 庚金剋甲木; 寅未 no relation
    const r = computeCompat('甲寅', '庚未');
    expect(r.stars).toBe(2);
    expect(r.reasonKey).toBe('keWo');
  });

  it('2 stars for 相刑 (寅巳 刑)', () => {
    // 甲寅 vs 丁巳 — gan 甲丁 neutral; 寅巳 刑
    const r = computeCompat('甲寅', '丁巳');
    expect(r.stars).toBe(2);
    expect(r.reasonKey).toBe('xiang');
  });

  it('2 stars for 相破 (子酉 破)', () => {
    const r = computeCompat('甲子', '丁酉');
    expect(r.stars).toBe(2);
    expect(r.reasonKey).toBe('xiangPo');
  });

  it('2 stars for 相害 (子未 害)', () => {
    const r = computeCompat('甲子', '丁未');
    expect(r.stars).toBe(2);
    expect(r.reasonKey).toBe('xiangHai');
  });

  it('1 star for 相沖 (子午 沖)', () => {
    const r = computeCompat('甲子', '乙午');
    expect(r.stars).toBe(1);
    expect(r.reasonKey).toBe('xiangChong');
  });
});

describe('computeCompat — robustness', () => {
  it('invalid gan/zhi → returns neutral with 3 stars', () => {
    const r = computeCompat('XX', 'YY');
    expect(r.stars).toBe(3);
    expect(r.reasonKey).toBe('neutral');
  });

  it('reasonText is the zh-Hant string for the reason key', () => {
    const r = computeCompat('甲子', '乙午');
    expect(r.reasonText).toMatch(/相沖/);
  });

  it('detail.ganRelation and detail.zhiRelation are populated', () => {
    const r = computeCompat('甲子', '己丑');
    expect(r.detail.ganRelation).toBe('相合');
    expect(r.detail.zhiRelation).toBe('六合');
  });
});
