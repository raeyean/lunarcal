export type DeityKind = 'fo' | 'pusa' | 'shen' | 'dao';

export interface DeityDay {
  name: string;
  deity: string;
  kind: DeityKind;
}

export const DEITY_DAYS: Record<string, DeityDay> = {
  '1-1':  { name: '彌勒佛聖誕', deity: '彌勒佛', kind: 'fo' },
  '1-5':  { name: '路頭神誕 · 接財神', deity: '財神', kind: 'shen' },
  '1-9':  { name: '玉皇大帝聖誕', deity: '玉皇大帝', kind: 'shen' },
  '1-15': { name: '天官大帝聖誕', deity: '天官大帝', kind: 'shen' },
  '1-19': { name: '觀音菩薩出家紀念', deity: '觀音菩薩', kind: 'pusa' },
  '2-2':  { name: '土地公誕', deity: '福德正神', kind: 'shen' },
  '2-3':  { name: '文昌帝君誕', deity: '文昌帝君', kind: 'shen' },
  '2-15': { name: '太上老君聖誕', deity: '太上老君', kind: 'dao' },
  '2-19': { name: '觀音菩薩聖誕', deity: '觀音菩薩', kind: 'pusa' },
  '2-21': { name: '普賢菩薩聖誕', deity: '普賢菩薩', kind: 'pusa' },
  '3-3':  { name: '王母娘娘聖誕', deity: '王母娘娘', kind: 'shen' },
  '3-15': { name: '財神趙公明誕', deity: '趙公明', kind: 'shen' },
  '3-23': { name: '天上聖母 · 媽祖誕', deity: '媽祖', kind: 'shen' },
  '4-4':  { name: '文殊菩薩聖誕', deity: '文殊菩薩', kind: 'pusa' },
  '4-8':  { name: '釋迦牟尼佛誕 · 浴佛節', deity: '釋迦牟尼佛', kind: 'fo' },
  '4-14': { name: '呂祖純陽誕', deity: '呂洞賓', kind: 'dao' },
  '4-28': { name: '藥王菩薩聖誕', deity: '藥王菩薩', kind: 'pusa' },
  '5-13': { name: '關聖帝君誕', deity: '關帝', kind: 'shen' },
  '6-19': { name: '觀音菩薩成道日', deity: '觀音菩薩', kind: 'pusa' },
  '6-24': { name: '雷祖大帝誕', deity: '雷祖', kind: 'shen' },
  '7-13': { name: '大勢至菩薩聖誕', deity: '大勢至菩薩', kind: 'pusa' },
  '7-15': { name: '盂蘭盆 · 地官聖誕', deity: '地官大帝', kind: 'shen' },
  '7-30': { name: '地藏王菩薩聖誕', deity: '地藏王菩薩', kind: 'pusa' },
  '8-3':  { name: '灶君誕', deity: '灶君', kind: 'shen' },
  '8-15': { name: '太陰星君誕', deity: '月神', kind: 'shen' },
  '8-22': { name: '燃燈古佛聖誕', deity: '燃燈古佛', kind: 'fo' },
  '9-9':  { name: '斗姥元君誕', deity: '斗姥', kind: 'dao' },
  '9-19': { name: '觀音菩薩出家日', deity: '觀音菩薩', kind: 'pusa' },
  '9-30': { name: '藥師琉璃光佛誕', deity: '藥師佛', kind: 'fo' },
  '10-5': { name: '達摩祖師誕', deity: '達摩祖師', kind: 'fo' },
  '10-15':{ name: '水官大帝聖誕', deity: '水官大帝', kind: 'shen' },
  '11-17':{ name: '阿彌陀佛聖誕', deity: '阿彌陀佛', kind: 'fo' },
  '11-19':{ name: '太陽星君誕', deity: '日神', kind: 'shen' },
  '12-8': { name: '釋迦牟尼佛成道 · 臘八', deity: '釋迦牟尼佛', kind: 'fo' },
  '12-23':{ name: '送灶神 · 小年', deity: '灶君', kind: 'shen' },
  '12-29':{ name: '華嚴菩薩聖誕', deity: '華嚴菩薩', kind: 'pusa' },
};

export function getDeityDay(lunarMonth: number, lunarDay: number): DeityDay | null {
  return DEITY_DAYS[`${lunarMonth}-${lunarDay}`] ?? null;
}
