export interface SpecialEvent {
  name: string;
  shortName: string;
}

export const SPECIAL_LUNAR_EVENTS: Record<string, SpecialEvent[]> = {
  '2-19': [{ name: '觀音誕（觀音大士誕辰）', shortName: '觀音誕' }],
  '6-19': [{ name: '觀音誕（觀音成道日）', shortName: '觀音誕' }],
  '9-19': [{ name: '觀音誕（觀音出家日）', shortName: '觀音誕' }],
  '11-19': [{ name: '觀音誕（觀音歸位日）', shortName: '觀音誕' }],
  '3-23': [{ name: '天后誕 · 媽祖誕', shortName: '天后誕' }],
  '6-24': [{ name: '關帝誕', shortName: '關帝誕' }],
  '8-23': [{ name: '黃大仙誕', shortName: '黃大仙誕' }],
  '4-8':  [{ name: '譚公誕', shortName: '譚公誕' }],
  '1-2':  [{ name: '車公誕', shortName: '車公誕' }],
  '2-13': [{ name: '洪聖誕', shortName: '洪聖誕' }],
  '3-3':  [{ name: '北帝誕（玄天上帝誕）', shortName: '北帝誕' }],
  '6-6':  [{ name: '侯王誕', shortName: '侯王誕' }],
  '6-13': [{ name: '魯班誕', shortName: '魯班誕' }],
  '4-14': [{ name: '呂祖誕（純陽祖師誕）', shortName: '呂祖誕' }],
  '2-2':  [{ name: '土地誕（福德正神誕）', shortName: '土地誕' }],
  '7-22': [{ name: '財神誕', shortName: '財神誕' }],
  '9-28': [{ name: '華光誕', shortName: '華光誕' }],
  '7-12': [{ name: '濟公誕（濟公活佛誕）', shortName: '濟公誕' }],
  '8-16': [{ name: '齊天大聖誕', shortName: '大聖誕' }],
  '3-18': [{ name: '六壬仙師誕', shortName: '六壬誕' }],
};

export function getSpecialEvents(lunarMonth: number, lunarDay: number): SpecialEvent[] {
  return SPECIAL_LUNAR_EVENTS[`${lunarMonth}-${lunarDay}`] || [];
}
