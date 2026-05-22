export interface BirthProfile {
  version: 1;
  solarDate: string;                   // 'YYYY-MM-DD' Gregorian
  solarTime: string | null;            // 'HH:mm' 24h, null = 時辰未知
  gender: 'male' | 'female' | null;    // null = unspecified
  createdAt: string;                   // ISO
  updatedAt: string;                   // ISO
}

export interface SavedDate {
  id: string;
  label: string;
  solarDate: string;                   // 'YYYY-MM-DD'
  createdAt: string;                   // ISO
}

export interface BaziPillar {
  gan: string;
  zhi: string;
  ganZhi: string;
  wuXing: string;       // 2-char concat: gan element + zhi element (e.g. '金水')
  hideGan: string[];
  naYin: string;
  shiShenGan: string;
  shiShenZhi: string[];
  diShi: string;
}

export interface DaYun {
  startAge: number;
  startYear: number;    // Gregorian calendar year DaYun begins
  ganZhi: string;
}

export interface BaziChart {
  source: BirthProfile;
  hasTime: boolean;
  year: BaziPillar;
  month: BaziPillar;
  day: BaziPillar;
  time: BaziPillar | null;
  dayMaster: string;
  dayMasterWuXing: string;
  wuXingCounts: Record<'木' | '火' | '土' | '金' | '水', number>;
  daYun: DaYun[] | null;
  taiYuan: string | null;
  mingGong: string | null;
}

export type GanRelation =
  | '相合' | '比和' | '生我' | '我生' | '剋我' | '我剋' | '無關';

export type ZhiRelation =
  | '三合' | '六合' | '相沖' | '相刑' | '相害' | '相破' | '無關';

export type CompatReason =
  | 'tianHe_diHe' | 'tianHe' | 'sanHe' | 'liuHe' | 'shengWo' | 'biHe'
  | 'neutral' | 'keWo' | 'xiang' | 'xiangPo' | 'xiangHai' | 'xiangChong';

export interface CompatScore {
  stars: 1 | 2 | 3 | 4 | 5;
  reasonKey: CompatReason;
  reasonText: string;
  detail: {
    ganRelation: GanRelation;
    zhiRelation: ZhiRelation;
  };
}
