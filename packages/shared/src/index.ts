// Lunar computation
export {
  getDayData,
  findUpcomingDeity,
  getMonthDays,
  getChineseMonthName,
  getChineseDayName,
  type DayData,
  type TongshuData,
  type ShichenSlot,
} from './lunar/index';

// Data
export {
  DEITY_DAYS,
  getDeityDay,
  type DeityDay,
  type DeityKind,
} from './data/deityDays';

export {
  SPECIAL_LUNAR_EVENTS,
  getSpecialEvents,
  type SpecialEvent,
} from './data/specialEvents';

export {
  ACTIVITY_MEANINGS,
  meaningsFor,
  type ActivityMeaning,
} from './data/activityMeanings';

// Zod schemas (inferred types usable on both server and client)
export {
  DeityKindSchema,
  DeityDaySchema,
  DeityResponseSchema,
  DeityListResponseSchema,
} from './schemas/deity';

export {
  DirectionsSchema,
  DirectionsResponseSchema,
} from './schemas/directions';

export {
  ActivityItemSchema,
  YiJiResponseSchema,
} from './schemas/yiji';

// Bazi engine + compat scoring (local-only; no API exposure)
export {
  computeBazi,
  computeCompat,
  ganRelation,
  zhiRelation,
  COMPAT_REASONS_ZH_HANT,
  BaziError,
} from './bazi';

export type {
  BirthProfile,
  SavedDate,
  BaziPillar,
  BaziChart,
  DaYun,
  GanRelation,
  ZhiRelation,
  CompatReason,
  CompatScore,
} from './bazi';

// Profile schemas (local-only; used by mobile profileStorage)
export {
  BirthProfileSchema,
  SavedDateSchema,
  SavedDatesArraySchema,
} from './schemas/profile';
