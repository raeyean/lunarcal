import { describe, expect, it } from 'vitest';
import { LunarUtil, Solar } from 'lunar-javascript';
import {
  FESTIVAL_NAMES_TRADITIONAL,
  SOLAR_TERM_NAMES_TRADITIONAL,
  ZODIAC_NAMES_TRADITIONAL,
  getDayData,
  toTraditionalZodiac,
} from '../index';
// App code with no React Native imports; plain functions and data.
import { scanChunk } from '../../../../src/utils/auspiciousScan';
import { getEventDescription } from '../../../../src/data/eventDescriptions';

const sorted = (xs: Iterable<string>) => [...new Set(xs)].sort();

describe('traditional names tables cover lunar-javascript (#52)', () => {
  it('covers every Clash Animal', () => {
    const animals = LunarUtil.SHENGXIAO.filter(Boolean);
    expect(sorted(Object.keys(ZODIAC_NAMES_TRADITIONAL))).toEqual(sorted(animals));
  });

  it('covers every solar term', () => {
    expect(sorted(Object.keys(SOLAR_TERM_NAMES_TRADITIONAL))).toEqual(sorted(LunarUtil.JIE_QI));
  });

  it('covers every festival name lunar-javascript returns', () => {
    const listed: string[] = [
      ...Object.values(LunarUtil.FESTIVAL),
      ...Object.values(LunarUtil.OTHER_FESTIVAL).flat(),
    ];
    const seen = new Set<string>(listed);
    // Some are computed, not listed (除夕, 寒食节, 春社, 秋社): scan a few years.
    const d = new Date(Date.UTC(2024, 0, 1));
    while (d.getUTCFullYear() < 2028) {
      const lunar = Solar.fromYmd(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()).getLunar();
      [...lunar.getFestivals(), ...lunar.getOtherFestivals()].forEach((n: string) => seen.add(n));
      d.setUTCDate(d.getUTCDate() + 1);
    }
    const missing = [...seen].filter((n) => !(n in FESTIVAL_NAMES_TRADITIONAL));
    expect(missing).toEqual([]);
  });
});

describe('Clash Animal in traditional characters (#52)', () => {
  it('gives 馬, not 马', () => {
    const day = getDayData(2026, 11, 22);
    expect(day.clash.zodiac).toBe('馬');
    expect(day.clash.animal.startsWith('沖馬')).toBe(true);
    expect(day.clash.description).toContain('屬馬者');
    expect(day.clash.description).not.toMatch(/[马龙鸡猪]/);
  });

  it.each(['馬', '龍', '雞', '豬'])('the 擇吉 scan leaves out days that clash with %s', (zodiac) => {
    const start = new Date(2026, 0, 1);
    const end = new Date(2026, 11, 31);
    // 祭祀 is a 宜 on many days, so plenty of candidates clash with each animal.
    const all = scanChunk('祭祀', null, start, 400, end).results;
    const clashing = all.filter((r) =>
      toTraditionalZodiac(Solar.fromYmd(r.date.year, r.date.month, r.date.day).getLunar().getDayChongShengXiao()) === zodiac);
    expect(clashing.length).toBeGreaterThan(0);
    const filtered = scanChunk('祭祀', zodiac, start, 400, end).results;
    expect(filtered.length).toBe(all.length - clashing.length);
  });
});

describe('festival and solar-term descriptions are found (#52)', () => {
  const names = [
    '惊蛰', '谷雨', '小满', '芒种', '处暑',
    '春节', '元宵节', '上巳节', '寒食节', '端午节', '七夕节', '中元节', '中秋节', '重阳节', '寒衣节', '下元节', '腊八节',
    '龙头节',
  ];

  it('every converted name has a description', () => {
    const found = new Set<string>();
    const d = new Date(Date.UTC(2026, 0, 1));
    while (d.getUTCFullYear() < 2027) {
      const day = getDayData(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
      for (const n of [day.jieqi, ...day.festivals]) {
        if (n && getEventDescription(n)) found.add(n);
      }
      d.setUTCDate(d.getUTCDate() + 1);
    }
    const expected = names.map((n) => SOLAR_TERM_NAMES_TRADITIONAL[n] ?? FESTIVAL_NAMES_TRADITIONAL[n]);
    expect(expected.filter((n) => !found.has(n))).toEqual([]);
    expect(expected).toContain('龍抬頭');
  });
});
