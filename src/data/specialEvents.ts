/**
 * Special lunar calendar events not covered by the lunar-javascript library.
 * Key format: "lunarMonth-lunarDay"
 * These are traditional Chinese / Hong Kong folk-religious events.
 */

export interface SpecialEvent {
  name: string;
  shortName: string; // abbreviated for calendar cell display
}

export const SPECIAL_LUNAR_EVENTS: Record<string, SpecialEvent[]> = {
  // 观音诞 — Guanyin's Birthday (four times a year)
  '2-19': [{ name: '觀音誕（觀音大士誕辰）', shortName: '觀音誕' }],
  '6-19': [{ name: '觀音誕（觀音成道日）', shortName: '觀音誕' }],
  '9-19': [{ name: '觀音誕（觀音出家日）', shortName: '觀音誕' }],
  '11-19': [{ name: '觀音誕（觀音歸位日）', shortName: '觀音誕' }],

  // 天后誕 / 媽祖誕 — Tin Hau (Mazu) Birthday
  '3-23': [{ name: '天后誕 · 媽祖誕', shortName: '天后誕' }],

  // 关帝诞 — Guan Di Birthday
  '6-24': [{ name: '關帝誕', shortName: '關帝誕' }],

  // 黄大仙诞 — Wong Tai Sin Birthday
  '8-23': [{ name: '黃大仙誕', shortName: '黃大仙誕' }],

  // 谭公诞 — Tam Kung Birthday
  '4-8': [{ name: '譚公誕', shortName: '譚公誕' }],

  // 车公诞 — Che Kung Birthday
  '1-2': [{ name: '車公誕', shortName: '車公誕' }],

  // 洪聖誕 — Hung Shing Birthday
  '2-13': [{ name: '洪聖誕', shortName: '洪聖誕' }],

  // 北帝誕 — Pak Tai Birthday
  '3-3': [{ name: '北帝誕（玄天上帝誕）', shortName: '北帝誕' }],

  // 侯王誕 — Hau Wong Birthday
  '6-6': [{ name: '侯王誕', shortName: '侯王誕' }],

  // 魯班誕 — Lo Pan Birthday
  '6-13': [{ name: '魯班誕', shortName: '魯班誕' }],

  // 呂祖誕 — Lu Zu Birthday
  '4-14': [{ name: '呂祖誕（純陽祖師誕）', shortName: '呂祖誕' }],

  // 土地誕 — Earth God Birthday
  '2-2': [{ name: '土地誕（福德正神誕）', shortName: '土地誕' }],

  // 財神誕 — God of Wealth Birthday
  '7-22': [{ name: '財神誕', shortName: '財神誕' }],

  // 華光誕 — Wah Kwong Birthday
  '9-28': [{ name: '華光誕', shortName: '華光誕' }],

  // 濟公誕 — Ji Gong Birthday
  '7-12': [{ name: '濟公誕（濟公活佛誕）', shortName: '濟公誕' }],

  // 齊天大聖誕 — Monkey King Birthday
  '8-16': [{ name: '齊天大聖誕', shortName: '大聖誕' }],

  // 六壬仙師誕 — Luk Yam Immortal Birthday
  '3-18': [{ name: '六壬仙師誕', shortName: '六壬誕' }],
};

/**
 * Look up special events for a given lunar date.
 */
export function getSpecialEvents(lunarMonth: number, lunarDay: number): SpecialEvent[] {
  return SPECIAL_LUNAR_EVENTS[`${lunarMonth}-${lunarDay}`] || [];
}
