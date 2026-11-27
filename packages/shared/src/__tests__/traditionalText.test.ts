import { describe, expect, it } from 'vitest';
import { Solar, type Lunar } from 'lunar-javascript';
import {
  TRADITIONAL_CHARS,
  TRADITIONAL_PHRASES,
  TRADITIONAL_UNCHANGED,
  computeBazi,
  getDayData,
  toTraditionalText,
} from '../index';
import type { BirthProfile } from '../bazi/types';

// The lunar-javascript fields the app shows as free text (#51).
const DAY_FIELDS = [
  'getDaySha', 'getDayNaYin', 'getDayChongDesc', 'getPengZuGan', 'getPengZuZhi',
  'getDayTianShen', 'getDayTianShenType', 'getDayTianShenLuck', 'getZhiXing',
  'getXiu', 'getXiuLuck', 'getXiuSong', 'getYueXiang', 'getLiuYao', 'getWuHou',
  'getDayLu', 'getDayJiShen', 'getDayXiongSha', 'getDayPositionTai',
  'getDayPositionXiDesc', 'getDayPositionCaiDesc', 'getDayPositionFuDesc',
  'getDayPositionYangGuiDesc', 'getDayPositionYinGuiDesc',
] as const;
const SLOTS = ['Year', 'Month', 'Day', 'Time'] as const;

function dayTexts(lunar: Lunar): string[] {
  return DAY_FIELDS.flatMap((f) => {
    const v = (lunar[f] as () => string | string[])();
    return Array.isArray(v) ? v : [v];
  });
}

function baziTexts(year: number, month: number, day: number, hour: number): string[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ec: any = Solar.fromYmdHms(year, month, day, hour, 30, 0).getLunar().getEightChar();
  return SLOTS.flatMap((s) => [
    ec[`get${s}NaYin`](), ec[`get${s}ShiShenGan`](), ec[`get${s}DiShi`](),
    ...ec[`get${s}ShiShenZhi`](), ...ec[`get${s}HideGan`](),
  ]).concat(ec.getTaiYuan(), ec.getMingGong());
}

/** Characters left in converted text that the table would still convert. */
function leftovers(text: string): string[] {
  let t = text;
  for (const to of Object.values(TRADITIONAL_PHRASES)) t = t.split(to).join('');
  return [...t].filter((c) => c in TRADITIONAL_CHARS);
}

describe('the character table covers lunar-javascript (#51)', () => {
  const known = new Set([...TRADITIONAL_UNCHANGED, ...Object.keys(TRADITIONAL_CHARS)]);

  it('knows every character of the daily fields, 2020–2060', () => {
    const unknown = new Set<string>();
    let s = Solar.fromYmd(2020, 1, 1);
    while (s.getYear() <= 2060) {
      for (const text of dayTexts(s.getLunar())) {
        for (const c of text) if (!known.has(c)) unknown.add(c);
      }
      s = s.next(1);
    }
    expect([...unknown]).toEqual([]);
  });

  it('knows every character of the Bazi terms, 1900–2100', () => {
    const unknown = new Set<string>();
    let s = Solar.fromYmd(1900, 1, 1);
    while (s.getYear() <= 2100) {
      for (const hour of [0, 6, 12, 18]) {
        for (const text of baziTexts(s.getYear(), s.getMonth(), s.getDay(), hour)) {
          for (const c of text) if (!known.has(c)) unknown.add(c);
        }
      }
      s = s.next(29);
    }
    expect([...unknown]).toEqual([]);
  });

  it('maps every character to another one', () => {
    for (const [from, to] of Object.entries(TRADITIONAL_CHARS)) {
      expect([from.length, to.length, from === to]).toEqual([1, 1, false]);
    }
    const both = [...TRADITIONAL_UNCHANGED].filter((c) => c in TRADITIONAL_CHARS);
    expect(both).toEqual([]);
  });
});

describe('toTraditionalText (#51)', () => {
  it.each([
    ['征鸟厉疾', '征鳥厲疾'],
    ['斗', '斗'],
    ['占门床 外正南', '占門床 外正南'],
    ['宅舍安宁不见凶', '宅舍安寧不見凶'],
    ['阴阳击冲', '陰陽擊沖'],
    ['天后', '天后'],
    ['益后', '益後'],
    ['三年之后主瘟疫', '三年之後主瘟疫'],
    ['房床栖 外正南', '房床棲 外正南'],
    ['温风至', '溫風至'],
    ['箧满金银谷满仓，福荫高官', '篋滿金銀穀滿倉，福蔭高官'],
    ['东北', '東北'],
  ])('%s → %s', (from, to) => {
    expect(toTraditionalText(from)).toBe(to);
  });
});

describe('getDayData returns traditional text (#51)', () => {
  const DIRECTIONS = ['正北', '東北', '正東', '東南', '正南', '西南', '正西', '西北', '北', '東', '南', '西'];

  it('leaves no simplified character in a year of days', () => {
    const d = new Date(Date.UTC(2026, 0, 1));
    while (d.getUTCFullYear() < 2027) {
      const day = getDayData(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
      const texts = [
        ...Object.values(day.tongshu).flat(),
        ...Object.values(day.clash),
        ...Object.values(day.directions),
        ...day.pengzu,
      ].filter((v): v is string => typeof v === 'string');
      expect(texts.flatMap(leftovers)).toEqual([]);
      // 吉/凶 comparisons and the compass keep working.
      expect(['吉', '凶']).toContain(day.tongshu.tianShenLuck);
      expect(['吉', '凶']).toContain(day.tongshu.xiuLuck);
      expect(['黃道', '黑道']).toContain(day.tongshu.tianShenType);
      for (const dir of Object.values(day.directions)) expect(DIRECTIONS).toContain(dir);
      d.setUTCDate(d.getUTCDate() + 1);
    }
  });
});

describe('computeBazi returns traditional terms (#51)', () => {
  const profile: BirthProfile = {
    version: 1,
    solarDate: '1990-05-15',
    solarTime: '10:00',
    gender: 'male',
    createdAt: '2026-05-18T00:00:00.000Z',
    updatedAt: '2026-05-18T00:00:00.000Z',
  };

  it('gives 七殺, 長生 and 養', () => {
    const chart = computeBazi(profile);
    expect(chart.month.shiShenZhi).toContain('七殺');
    expect(chart.month.diShi).toBe('長生');
    expect(chart.day.diShi).toBe('養');
    const pillars = [chart.year, chart.month, chart.day, chart.time!];
    const texts = pillars.flatMap((p) => [p.naYin, p.shiShenGan, p.diShi, ...p.shiShenZhi, ...p.hideGan]);
    expect(texts.flatMap(leftovers)).toEqual([]);
  });
});
