// Mobile-side re-export of the shared bazi module — mirrors src/utils/lunar.ts pattern.
export {
  computeBazi,
  computeCompat,
  ganRelation,
  zhiRelation,
  COMPAT_REASONS_ZH_HANT,
  BaziError,
} from '@lunarcal/shared';

export type {
  BirthProfile,
  SavedDate,
  BaziPillar,
  BaziChart,
  DaYun,
  CompatScore,
  CompatReason,
  GanRelation,
  ZhiRelation,
} from '@lunarcal/shared';
