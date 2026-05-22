// 五行 of 天干
export const WUXING_OF_GAN: Record<string, string> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土',
  己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
};

// 五行 of 地支
export const WUXING_OF_ZHI: Record<string, string> = {
  子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火',
  午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水',
};

// 天干合 (10 pairs; mapping is symmetric)
export const TIAN_HE: Record<string, string> = {
  甲: '己', 己: '甲', 乙: '庚', 庚: '乙', 丙: '辛', 辛: '丙',
  丁: '壬', 壬: '丁', 戊: '癸', 癸: '戊',
};

// 地支六合
export const DI_LIU_HE: Record<string, string> = {
  子: '丑', 丑: '子', 寅: '亥', 亥: '寅', 卯: '戌', 戌: '卯',
  辰: '酉', 酉: '辰', 巳: '申', 申: '巳', 午: '未', 未: '午',
};

// 地支三合 — four groups of three
export const DI_SAN_HE_GROUPS: string[][] = [
  ['申', '子', '辰'],
  ['亥', '卯', '未'],
  ['寅', '午', '戌'],
  ['巳', '酉', '丑'],
];

// 地支沖 (opposite, 6 pairs)
export const DI_CHONG: Record<string, string> = {
  子: '午', 午: '子', 丑: '未', 未: '丑', 寅: '申', 申: '寅',
  卯: '酉', 酉: '卯', 辰: '戌', 戌: '辰', 巳: '亥', 亥: '巳',
};

// 地支刑 (寅巳申 三刑, 丑戌未 三刑, 子卯 互刑, 自刑: 辰午酉亥)
export const DI_XING_PAIRS: Set<string> = new Set([
  '寅巳', '巳寅', '巳申', '申巳', '寅申', '申寅',
  '丑戌', '戌丑', '戌未', '未戌', '丑未', '未丑',
  '子卯', '卯子',
  '辰辰', '午午', '酉酉', '亥亥',
]);

// 地支害 (6 pairs, symmetric)
export const DI_HAI: Record<string, string> = {
  子: '未', 未: '子', 丑: '午', 午: '丑', 寅: '巳', 巳: '寅',
  卯: '辰', 辰: '卯', 申: '亥', 亥: '申', 酉: '戌', 戌: '酉',
};

// 地支破 (6 pairs)
export const DI_PO: Record<string, string> = {
  子: '酉', 酉: '子', 卯: '午', 午: '卯', 辰: '丑', 丑: '辰',
  戌: '未', 未: '戌', 寅: '亥', 亥: '寅', 巳: '申', 申: '巳',
};

// 五行 generation cycle: gen(a) === b → a 生 b
export const WUXING_GENERATES: Record<string, string> = {
  木: '火', 火: '土', 土: '金', 金: '水', 水: '木',
};

// 五行 control cycle: control(a) === b → a 剋 b
export const WUXING_CONTROLS: Record<string, string> = {
  木: '土', 土: '水', 水: '火', 火: '金', 金: '木',
};
