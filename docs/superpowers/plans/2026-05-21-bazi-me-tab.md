# Bazi Profile + "Me" Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a dedicated "Me" tab hosting birth profile entry, computed 4-pillar Bazi chart, day-pillar compatibility scoring, and a saved-dates list, with all data stored locally only.

**Architecture:** New `@lunarcal/shared/bazi` module exposes pure-fn `computeBazi(profile)` and `computeCompat(userGz, targetGz)`. Mobile gains `BirthProfileContext` hydrated from AsyncStorage; `MeScreen` renders chart + compat + saved dates. Nav extends from 2 to 3 tabs via new extracted `BottomTabBar` component. Compat strip also surfaces on `DailyDetailScreen`.

**Tech Stack:** TypeScript strict, React Native (Expo 54), lunar-javascript 1.7.7, AsyncStorage, Zod, Vitest (added to `@lunarcal/shared`).

**Spec:** `docs/superpowers/specs/2026-05-18-bazi-me-tab-design.md`

---

## File Structure

```
packages/shared/
├── package.json                        MODIFY: add vitest devDep, test script
├── vitest.config.ts                    CREATE
├── src/
│   ├── index.ts                        MODIFY: re-export bazi module
│   ├── bazi/
│   │   ├── index.ts                    CREATE
│   │   ├── types.ts                    CREATE — BirthProfile, BaziChart, CompatScore
│   │   ├── tables.ts                   CREATE — WuXing, TianHe, DiLiuHe, DiSanHe, DiChong, etc.
│   │   ├── compute.ts                  CREATE — computeBazi, BaziError
│   │   ├── compat.ts                   CREATE — computeCompat
│   │   └── compatReasons.zh-Hant.ts    CREATE
│   ├── schemas/
│   │   └── profile.ts                  CREATE — BirthProfileSchema, SavedDateSchema
│   └── __tests__/
│       ├── bazi.compute.test.ts        CREATE
│       ├── bazi.compat.test.ts         CREATE
│       └── schemas.profile.test.ts     CREATE

src/
├── utils/
│   ├── profileStorage.ts               CREATE
│   ├── bazi.ts                         CREATE — re-exports from @lunarcal/shared
│   └── uuid.ts                         CREATE — small inline RFC-4122-ish uuid
├── context/
│   └── BirthProfileContext.tsx         CREATE
├── components/
│   ├── BottomTabBar.tsx                CREATE
│   ├── BaziPillarCell.tsx              CREATE
│   ├── BaziChart.tsx                   CREATE
│   ├── CompatStrip.tsx                 CREATE
│   ├── ProfileForm.tsx                 CREATE
│   └── SavedDateRow.tsx                CREATE
├── screens/
│   ├── MeScreen.tsx                    CREATE
│   └── DailyDetailScreen.tsx           MODIFY: insert <CompatStrip compact /> above Yi/Ji
└── App.tsx                             MODIFY: provider, 3-tab activeTab, BottomTabBar
```

---

## Task 0: Workspace test setup (Vitest in `@lunarcal/shared`)

**Files:**
- Modify: `packages/shared/package.json`
- Create: `packages/shared/vitest.config.ts`
- Create: `packages/shared/src/__tests__/smoke.test.ts`

- [ ] **Step 1: Install Vitest in shared workspace**

Run:
```bash
npm install --workspace=@lunarcal/shared --save-dev vitest@^4.1.6
```

Expected: `packages/shared/package.json` now lists `vitest` under devDependencies.

- [ ] **Step 2: Add vitest config**

Create `packages/shared/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/__tests__/**/*.test.ts'],
  },
});
```

- [ ] **Step 3: Add test scripts to `packages/shared/package.json`**

Inside the `scripts` object, replace:

```json
"scripts": {
  "build": "tsc"
}
```

with:

```json
"scripts": {
  "build": "tsc",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 4: Write smoke test**

Create `packages/shared/src/__tests__/smoke.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

describe('vitest setup', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run smoke test**

Run: `npm test -w @lunarcal/shared`
Expected: 1 passing test.

- [ ] **Step 6: Wire root test script**

Modify root `package.json` — add a `test` entry alongside existing scripts:

```json
"test": "npm run test -w @lunarcal/api && npm run test -w @lunarcal/shared"
```

Run: `npm test`
Expected: both workspaces tests pass.

- [ ] **Step 7: Commit**

```bash
git add packages/shared/package.json packages/shared/vitest.config.ts packages/shared/src/__tests__/smoke.test.ts package.json package-lock.json
git commit -m "chore(shared): add vitest workspace test setup"
```

---

## Task 1: Bazi & profile types

**Files:**
- Create: `packages/shared/src/bazi/types.ts`

- [ ] **Step 1: Write types file**

Create `packages/shared/src/bazi/types.ts`:

```typescript
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
  wuXing: string;
  hideGan: string[];
  naYin: string;
  shiShenGan: string;
  shiShenZhi: string[];
  diShi: string;
}

export interface DaYun {
  startAge: number;
  startYear: number;
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
  wuXingCounts: Record<string, number>;
  daYun: DaYun[] | null;
  taiYuan: string;
  mingGong: string;
}

export type GanRelation =
  | '相合' | '相剋' | '比和' | '生我' | '我生' | '剋我' | '我剋' | '無關';

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
```

- [ ] **Step 2: Commit**

```bash
git add packages/shared/src/bazi/types.ts
git commit -m "feat(bazi): add core types for profile, chart, and compat"
```

---

## Task 2: Zod schemas for profile + saved dates

**Files:**
- Create: `packages/shared/src/schemas/profile.ts`
- Test: `packages/shared/src/__tests__/schemas.profile.test.ts`

- [ ] **Step 1: Write failing test**

Create `packages/shared/src/__tests__/schemas.profile.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  BirthProfileSchema,
  SavedDateSchema,
  SavedDatesArraySchema,
} from '../schemas/profile';

const validProfile = {
  version: 1,
  solarDate: '1990-06-15',
  solarTime: '14:30',
  gender: 'male',
  createdAt: '2026-05-18T00:00:00.000Z',
  updatedAt: '2026-05-18T00:00:00.000Z',
};

describe('BirthProfileSchema', () => {
  it('accepts a full valid profile', () => {
    expect(BirthProfileSchema.safeParse(validProfile).success).toBe(true);
  });

  it('accepts profile with null time and null gender', () => {
    const p = { ...validProfile, solarTime: null, gender: null };
    expect(BirthProfileSchema.safeParse(p).success).toBe(true);
  });

  it('rejects unknown version', () => {
    expect(BirthProfileSchema.safeParse({ ...validProfile, version: 2 }).success).toBe(false);
  });

  it('rejects malformed date', () => {
    expect(BirthProfileSchema.safeParse({ ...validProfile, solarDate: '1990/6/15' }).success).toBe(false);
  });

  it('rejects unexpected gender values', () => {
    expect(BirthProfileSchema.safeParse({ ...validProfile, gender: 'other' }).success).toBe(false);
  });
});

const validSaved = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  label: '婚禮',
  solarDate: '2026-10-20',
  createdAt: '2026-05-18T00:00:00.000Z',
};

describe('SavedDateSchema', () => {
  it('accepts valid saved date', () => {
    expect(SavedDateSchema.safeParse(validSaved).success).toBe(true);
  });

  it('rejects empty label', () => {
    expect(SavedDateSchema.safeParse({ ...validSaved, label: '' }).success).toBe(false);
  });

  it('rejects malformed id', () => {
    expect(SavedDateSchema.safeParse({ ...validSaved, id: 'not-a-uuid' }).success).toBe(false);
  });
});

describe('SavedDatesArraySchema', () => {
  it('accepts empty array', () => {
    expect(SavedDatesArraySchema.safeParse([]).success).toBe(true);
  });

  it('accepts array of valid saved dates', () => {
    expect(SavedDatesArraySchema.safeParse([validSaved, validSaved]).success).toBe(true);
  });

  it('rejects whole array if one item is bad', () => {
    expect(
      SavedDatesArraySchema.safeParse([validSaved, { ...validSaved, label: '' }]).success,
    ).toBe(false);
  });
});
```

- [ ] **Step 2: Run test — expect failure**

Run: `npm test -w @lunarcal/shared -- schemas.profile`
Expected: FAIL — `Cannot find module '../schemas/profile'`.

- [ ] **Step 3: Implement schemas**

Create `packages/shared/src/schemas/profile.ts`:

```typescript
import { z } from 'zod';

export const BirthProfileSchema = z.object({
  version: z.literal(1),
  solarDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  solarTime: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
  gender: z.enum(['male', 'female']).nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const SavedDateSchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1).max(50),
  solarDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  createdAt: z.string(),
});

export const SavedDatesArraySchema = z.array(SavedDateSchema);

export type BirthProfileInput = z.infer<typeof BirthProfileSchema>;
export type SavedDateInput = z.infer<typeof SavedDateSchema>;
```

- [ ] **Step 4: Run tests — expect pass**

Run: `npm test -w @lunarcal/shared -- schemas.profile`
Expected: all schema tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/shared/src/schemas/profile.ts packages/shared/src/__tests__/schemas.profile.test.ts
git commit -m "feat(shared): add Zod schemas for birth profile + saved dates"
```

---

## Task 3: Bazi lookup tables (Wu Xing + relation tables)

**Files:**
- Create: `packages/shared/src/bazi/tables.ts`

- [ ] **Step 1: Write tables**

Create `packages/shared/src/bazi/tables.ts`:

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add packages/shared/src/bazi/tables.ts
git commit -m "feat(bazi): add wuxing and ganzhi relation lookup tables"
```

---

## Task 4: BaziError class

**Files:**
- Create: `packages/shared/src/bazi/errors.ts`

- [ ] **Step 1: Write error class**

Create `packages/shared/src/bazi/errors.ts`:

```typescript
export type BaziErrorCode = 'INVALID_DATE' | 'INVALID_TIME' | 'ENGINE_FAILURE';

export class BaziError extends Error {
  public readonly code: BaziErrorCode;

  constructor(code: BaziErrorCode, message: string) {
    super(message);
    this.name = 'BaziError';
    this.code = code;
    // restore prototype chain for instanceof checks across transpile targets
    Object.setPrototypeOf(this, BaziError.prototype);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/shared/src/bazi/errors.ts
git commit -m "feat(bazi): add BaziError class for validation failures"
```

---

## Task 5: Spike — verify lunar-javascript DaYun API

**Files:**
- Create: `packages/shared/scripts/spike-dayun.ts` (throwaway, delete after)

Spec flagged that `dy.getStartAge` errored. This task confirms the real API surface before writing `computeBazi`.

- [ ] **Step 1: Write spike script**

Create `packages/shared/scripts/spike-dayun.ts`:

```typescript
import { Solar } from 'lunar-javascript';

const solar = Solar.fromYmdHms(1990, 6, 15, 14, 30, 0);
const ec = solar.getLunar().getEightChar();

// 1 = male, 0 = female (per existing spike)
const yun = ec.getYun(1);

console.log('yun proto methods:');
let proto: object | null = Object.getPrototypeOf(yun);
const yunMethods = new Set<string>();
while (proto) {
  Object.getOwnPropertyNames(proto).forEach((n) => {
    if (typeof (yun as any)[n] === 'function' && n.startsWith('get')) yunMethods.add(n);
  });
  proto = Object.getPrototypeOf(proto);
}
console.log([...yunMethods].sort());

const daYuns = yun.getDaYun();
console.log('\nfirst DaYun proto methods:');
const dy = daYuns[0];
let p: object | null = Object.getPrototypeOf(dy);
const dyMethods = new Set<string>();
while (p) {
  Object.getOwnPropertyNames(p).forEach((n) => {
    if (typeof (dy as any)[n] === 'function' && n.startsWith('get')) dyMethods.add(n);
  });
  p = Object.getPrototypeOf(p);
}
console.log([...dyMethods].sort());

console.log('\nDaYun[0] sample values:');
for (const m of dyMethods) {
  try {
    const v = (dy as any)[m]();
    console.log(`  ${m}() =>`, v);
  } catch (e) {
    console.log(`  ${m}() THREW`, (e as Error).message);
  }
}

console.log('\nFirst 8 DaYun:');
daYuns.slice(0, 8).forEach((d: any) => {
  const methods = [...dyMethods];
  const obj: Record<string, unknown> = {};
  for (const m of methods) {
    try { obj[m] = d[m](); } catch { /* ignore */ }
  }
  console.log(obj);
});
```

- [ ] **Step 2: Run spike**

Run from repo root:
```bash
npx tsx packages/shared/scripts/spike-dayun.ts
```

(If `tsx` isn't available: `npx -y tsx ...`)

- [ ] **Step 3: Capture findings**

Note in your task journal which methods exist on `Yun` and on each `DaYun`:
- The method that returns the starting age (likely `getStartAge`, `getStartYear`, or accessible via `getStartSolar()`)
- The method that returns the GanZhi for a DaYun (likely `getGanZhi`)

Use the actual names in Task 6 when computing `daYun: DaYun[]`.

- [ ] **Step 4: Delete spike**

```bash
rm packages/shared/scripts/spike-dayun.ts
```

(Do not commit the spike file. The findings live in your notes / task journal.)

- [ ] **Step 5: Commit (empty — record spike happened)**

This step has no file changes; skip the commit. Move directly to Task 6.

---

## Task 6: computeBazi — pillars only (no DaYun)

**Files:**
- Create: `packages/shared/src/bazi/compute.ts`
- Test: `packages/shared/src/__tests__/bazi.compute.test.ts`

- [ ] **Step 1: Write failing test (pillars + wuXingCounts + validation)**

Create `packages/shared/src/__tests__/bazi.compute.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { computeBazi } from '../bazi/compute';
import { BaziError } from '../bazi/errors';
import type { BirthProfile } from '../bazi/types';

const profile = (overrides: Partial<BirthProfile> = {}): BirthProfile => ({
  version: 1,
  solarDate: '1990-06-15',
  solarTime: '14:30',
  gender: 'male',
  createdAt: '2026-05-18T00:00:00.000Z',
  updatedAt: '2026-05-18T00:00:00.000Z',
  ...overrides,
});

describe('computeBazi — pillars', () => {
  it('returns the four pillars for a known birthday', () => {
    const chart = computeBazi(profile());
    expect(chart.year.ganZhi).toBe('庚午');
    expect(chart.month.ganZhi).toBe('壬午');
    expect(chart.day.ganZhi).toBe('辛亥');
    expect(chart.time?.ganZhi).toBe('乙未');
    expect(chart.dayMaster).toBe('辛');
    expect(chart.dayMasterWuXing).toBe('金');
    expect(chart.hasTime).toBe(true);
  });

  it('marks time pillar null when solarTime is null', () => {
    const chart = computeBazi(profile({ solarTime: null }));
    expect(chart.hasTime).toBe(false);
    expect(chart.time).toBeNull();
  });

  it('still returns year/month/day when solarTime is null', () => {
    const chart = computeBazi(profile({ solarTime: null }));
    expect(chart.year.ganZhi).toBe('庚午');
    expect(chart.month.ganZhi).toBe('壬午');
    expect(chart.day.ganZhi).toBe('辛亥');
  });

  it('handles 立春 boundary (1985-02-04 06:00 → year pillar 乙丑 not 甲子)', () => {
    const chart = computeBazi(profile({
      solarDate: '1985-02-04',
      solarTime: '06:00',
    }));
    // 1985 立春 falls on 1985-02-04 around 04:12; after 立春 year stem advances.
    expect(chart.year.gan).toBe('乙');
    expect(chart.year.zhi).toBe('丑');
  });

  it('wuXingCounts sums to 8 when time is set', () => {
    const chart = computeBazi(profile());
    const total = Object.values(chart.wuXingCounts).reduce((a, b) => a + b, 0);
    expect(total).toBe(8);
  });

  it('wuXingCounts sums to 6 when time is null', () => {
    const chart = computeBazi(profile({ solarTime: null }));
    const total = Object.values(chart.wuXingCounts).reduce((a, b) => a + b, 0);
    expect(total).toBe(6);
  });

  it('throws BaziError INVALID_DATE for year < 1900', () => {
    expect(() => computeBazi(profile({ solarDate: '1850-01-01' }))).toThrow(BaziError);
    try {
      computeBazi(profile({ solarDate: '1850-01-01' }));
    } catch (e) {
      expect((e as BaziError).code).toBe('INVALID_DATE');
    }
  });

  it('throws BaziError INVALID_DATE for year > 2100', () => {
    expect(() => computeBazi(profile({ solarDate: '2200-01-01' }))).toThrow(BaziError);
  });

  it('throws BaziError INVALID_DATE for malformed solarDate', () => {
    expect(() => computeBazi(profile({ solarDate: 'not-a-date' }))).toThrow(BaziError);
  });
});
```

- [ ] **Step 2: Run test — expect failure**

Run: `npm test -w @lunarcal/shared -- bazi.compute`
Expected: FAIL — `Cannot find module '../bazi/compute'`.

- [ ] **Step 3: Implement compute.ts (pillars only)**

Create `packages/shared/src/bazi/compute.ts`:

```typescript
import { Solar } from 'lunar-javascript';
import { BaziError } from './errors';
import { WUXING_OF_GAN, WUXING_OF_ZHI } from './tables';
import type {
  BirthProfile,
  BaziChart,
  BaziPillar,
} from './types';

type EightChar = ReturnType<ReturnType<ReturnType<typeof Solar.fromYmdHms>['getLunar']>['getEightChar']>;
type Slot = 'Year' | 'Month' | 'Day' | 'Time';

function buildPillar(slot: Slot, ec: EightChar): BaziPillar {
  // lunar-javascript exposes per-slot getters: getYearGan, getYearZhi, etc.
  const gan: string = (ec as any)[`get${slot}Gan`]();
  const zhi: string = (ec as any)[`get${slot}Zhi`]();
  const ganZhi = (ec as any)[`get${slot}`]() as string;
  const hideGan: string[] = ((ec as any)[`get${slot}HideGan`]() as string[]) ?? [];
  const naYin: string = (ec as any)[`get${slot}NaYin`]();
  const shiShenGan: string = (ec as any)[`get${slot}ShiShenGan`]();
  const shiShenZhi: string[] = ((ec as any)[`get${slot}ShiShenZhi`]() as string[]) ?? [];
  const diShi: string = (ec as any)[`get${slot}DiShi`]();
  const wuXing = `${WUXING_OF_GAN[gan] ?? ''}${WUXING_OF_ZHI[zhi] ?? ''}`;

  return { gan, zhi, ganZhi, wuXing, hideGan, naYin, shiShenGan, shiShenZhi, diShi };
}

function countWuXing(pillars: BaziPillar[]): Record<string, number> {
  const counts: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  for (const p of pillars) {
    const ganE = WUXING_OF_GAN[p.gan];
    const zhiE = WUXING_OF_ZHI[p.zhi];
    if (ganE) counts[ganE]++;
    if (zhiE) counts[zhiE]++;
  }
  return counts;
}

export function computeBazi(profile: BirthProfile): BaziChart {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(profile.solarDate);
  if (!dateMatch) {
    throw new BaziError('INVALID_DATE', `solarDate is malformed: ${profile.solarDate}`);
  }
  const y = Number(dateMatch[1]);
  const m = Number(dateMatch[2]);
  const d = Number(dateMatch[3]);
  if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) {
    throw new BaziError('INVALID_DATE', `solarDate out of range: ${profile.solarDate}`);
  }

  const hasTime = profile.solarTime !== null;
  let hh = 12;
  let mm = 0;
  if (hasTime) {
    const timeMatch = /^(\d{2}):(\d{2})$/.exec(profile.solarTime as string);
    if (!timeMatch) {
      throw new BaziError('INVALID_TIME', `solarTime is malformed: ${profile.solarTime}`);
    }
    hh = Number(timeMatch[1]);
    mm = Number(timeMatch[2]);
    if (hh < 0 || hh > 23 || mm < 0 || mm > 59) {
      throw new BaziError('INVALID_TIME', `solarTime out of range: ${profile.solarTime}`);
    }
  }

  let ec: EightChar;
  try {
    ec = Solar.fromYmdHms(y, m, d, hh, mm, 0).getLunar().getEightChar();
  } catch (e) {
    throw new BaziError('ENGINE_FAILURE', `lunar-javascript threw: ${(e as Error).message}`);
  }

  const year = buildPillar('Year', ec);
  const month = buildPillar('Month', ec);
  const day = buildPillar('Day', ec);
  const time = hasTime ? buildPillar('Time', ec) : null;

  const pillars = time ? [year, month, day, time] : [year, month, day];
  const wuXingCounts = countWuXing(pillars);

  const taiYuan: string = (ec as any).getTaiYuan?.() ?? '';
  const mingGong: string = (ec as any).getMingGong?.() ?? '';

  return {
    source: profile,
    hasTime,
    year,
    month,
    day,
    time,
    dayMaster: day.gan,
    dayMasterWuXing: WUXING_OF_GAN[day.gan] ?? '',
    wuXingCounts,
    daYun: null,                  // populated in Task 7
    taiYuan,
    mingGong,
  };
}
```

- [ ] **Step 4: Run tests — expect pass**

Run: `npm test -w @lunarcal/shared -- bazi.compute`
Expected: all pillar tests pass; DaYun-related tests not yet written.

- [ ] **Step 5: Commit**

```bash
git add packages/shared/src/bazi/compute.ts packages/shared/src/__tests__/bazi.compute.test.ts
git commit -m "feat(bazi): implement computeBazi pillars + wuxing counts"
```

---

## Task 7: computeBazi — DaYun computation

**Files:**
- Modify: `packages/shared/src/bazi/compute.ts`
- Modify: `packages/shared/src/__tests__/bazi.compute.test.ts`

> Use the actual method names found in the Task 5 spike. The code below assumes `getStartAge()` and `getGanZhi()` exist on each DaYun. If your spike showed different names, substitute them in the implementation step.

- [ ] **Step 1: Append failing tests**

Append to `packages/shared/src/__tests__/bazi.compute.test.ts`:

```typescript
describe('computeBazi — daYun', () => {
  it('returns null daYun when hasTime is false', () => {
    const chart = computeBazi(profile({ solarTime: null }));
    expect(chart.daYun).toBeNull();
  });

  it('returns null daYun when gender is null', () => {
    const chart = computeBazi(profile({ gender: null }));
    expect(chart.daYun).toBeNull();
  });

  it('returns 8 daYun entries for male with time set', () => {
    const chart = computeBazi(profile({ gender: 'male' }));
    expect(chart.daYun).not.toBeNull();
    expect(chart.daYun!.length).toBe(8);
  });

  it('daYun startAge values are strictly ascending', () => {
    const chart = computeBazi(profile({ gender: 'male' }));
    const ages = chart.daYun!.map((d) => d.startAge);
    for (let i = 1; i < ages.length; i++) {
      expect(ages[i]).toBeGreaterThan(ages[i - 1]);
    }
  });

  it('each daYun has a 2-character ganZhi', () => {
    const chart = computeBazi(profile({ gender: 'female' }));
    chart.daYun!.forEach((d) => expect(d.ganZhi).toHaveLength(2));
  });
});
```

- [ ] **Step 2: Run tests — expect failure on daYun cases only**

Run: `npm test -w @lunarcal/shared -- bazi.compute`
Expected: 5 new tests fail (daYun is currently null in all cases).

- [ ] **Step 3: Implement daYun in compute.ts**

In `packages/shared/src/bazi/compute.ts`, change the `daYun: null` line and add helper above the `computeBazi` return:

```typescript
function buildDaYun(ec: EightChar, gender: 'male' | 'female'): import('./types').DaYun[] {
  const yun: any = (ec as any).getYun(gender === 'male' ? 1 : 0);
  const list: any[] = yun.getDaYun();
  return list.slice(0, 8).map((dy: any) => ({
    startAge: typeof dy.getStartAge === 'function'
      ? dy.getStartAge()
      : Number(dy.startAge),                                   // fallback if API differs
    startYear: typeof dy.getStartYear === 'function'
      ? dy.getStartYear()
      : Number(dy.startYear),
    ganZhi: typeof dy.getGanZhi === 'function'
      ? dy.getGanZhi()
      : String(dy.ganZhi),
  }));
}
```

Then replace `daYun: null,` in the return value with:

```typescript
daYun: hasTime && profile.gender ? buildDaYun(ec, profile.gender) : null,
```

> If your Task 5 spike showed that `getStartAge` is missing on the DaYun object, replace its line with the working accessor your spike confirmed (e.g. compute from `getStartSolar()` minus the birth solar year). Keep the function pure and synchronous.

- [ ] **Step 4: Run tests — expect pass**

Run: `npm test -w @lunarcal/shared -- bazi.compute`
Expected: all compute tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/shared/src/bazi/compute.ts packages/shared/src/__tests__/bazi.compute.test.ts
git commit -m "feat(bazi): compute DaYun array when time + gender known"
```

---

## Task 8: Compat scoring — relation detectors

**Files:**
- Create: `packages/shared/src/bazi/compat.ts`

This task adds private helpers without exporting `computeCompat` yet. `computeCompat` lands in Task 9.

- [ ] **Step 1: Write `compat.ts` with helpers**

Create `packages/shared/src/bazi/compat.ts`:

```typescript
import {
  TIAN_HE,
  DI_LIU_HE,
  DI_SAN_HE_GROUPS,
  DI_CHONG,
  DI_XING_PAIRS,
  DI_HAI,
  DI_PO,
  WUXING_OF_GAN,
  WUXING_GENERATES,
  WUXING_CONTROLS,
} from './tables';
import { COMPAT_REASONS_ZH_HANT } from './compatReasons.zh-Hant';
import type { CompatScore, GanRelation, ZhiRelation, CompatReason } from './types';

export function ganRelation(userGan: string, targetGan: string): GanRelation {
  if (TIAN_HE[userGan] === targetGan) return '相合';
  if (userGan === targetGan) return '比和';
  const userE = WUXING_OF_GAN[userGan];
  const targetE = WUXING_OF_GAN[targetGan];
  if (!userE || !targetE) return '無關';
  if (userE === targetE) return '比和';
  if (WUXING_GENERATES[targetE] === userE) return '生我';
  if (WUXING_GENERATES[userE] === targetE) return '我生';
  if (WUXING_CONTROLS[targetE] === userE) return '剋我';
  if (WUXING_CONTROLS[userE] === targetE) return '我剋';
  return '無關';
}

export function zhiRelation(userZhi: string, targetZhi: string): ZhiRelation {
  if (DI_CHONG[userZhi] === targetZhi) return '相沖';
  for (const group of DI_SAN_HE_GROUPS) {
    if (group.includes(userZhi) && group.includes(targetZhi) && userZhi !== targetZhi) {
      return '三合';
    }
  }
  if (DI_LIU_HE[userZhi] === targetZhi) return '六合';
  if (DI_XING_PAIRS.has(`${userZhi}${targetZhi}`)) return '相刑';
  if (DI_HAI[userZhi] === targetZhi) return '相害';
  if (DI_PO[userZhi] === targetZhi) return '相破';
  return '無關';
}

// Exported below in Task 9.
function _placeholder() { return COMPAT_REASONS_ZH_HANT; }
void _placeholder;
```

> The `compatReasons.zh-Hant.ts` file is created in Task 9 just before `computeCompat`. If your editor lints this as a missing import, ignore it until Task 9 is done — both files commit together in Task 9's commit.

- [ ] **Step 2: Commit**

```bash
git add packages/shared/src/bazi/compat.ts
git commit -m "feat(bazi): add gan/zhi relation detector helpers"
```

---

## Task 9: Compat scoring — computeCompat + reasons

**Files:**
- Create: `packages/shared/src/bazi/compatReasons.zh-Hant.ts`
- Modify: `packages/shared/src/bazi/compat.ts`
- Test: `packages/shared/src/__tests__/bazi.compat.test.ts`

- [ ] **Step 1: Write reason strings**

Create `packages/shared/src/bazi/compatReasons.zh-Hant.ts`:

```typescript
import type { CompatReason } from './types';

export const COMPAT_REASONS_ZH_HANT: Record<CompatReason, string> = {
  tianHe_diHe: '日柱天合地合 · 大利',
  tianHe:      '天干相合 · 順遂',
  sanHe:       '地支三合 · 助力',
  liuHe:       '地支六合 · 親和',
  shengWo:     '貴人扶持 · 利合作',
  biHe:        '比和 · 平穩',
  neutral:     '無特殊關係',
  keWo:        '受剋 · 行事保守',
  xiang:       '相刑 · 慎防口角',
  xiangPo:     '相破 · 不宜開新事',
  xiangHai:    '相害 · 小心暗虧',
  xiangChong:  '日柱相沖 · 避免大事',
};
```

- [ ] **Step 2: Write failing test for computeCompat**

Create `packages/shared/src/__tests__/bazi.compat.test.ts`:

```typescript
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
    const r = computeCompat('甲寅', '乙巳');     // both 木 gan; 寅 & 巳 = 刑 actually
    // pick a true neutral pair: 甲寅 vs 乙未 (both 木 gan; 寅未 no relation)
    const safe = computeCompat('甲寅', '乙未');
    expect(safe.stars).toBe(3);
    expect(safe.reasonKey).toBe('biHe');
  });

  it('3 stars for neutral (no relation either side)', () => {
    const r = computeCompat('甲子', '丁亥');      // 甲丁 no he/sheng/ke; 子亥 no relation
    expect(r.stars).toBe(3);
    expect(r.reasonKey).toBe('neutral');
  });

  it('2 stars for 剋我 (target gan controls user gan)', () => {
    const r = computeCompat('甲寅', '庚未');      // 庚金剋甲木; 寅未 no relation
    expect(r.stars).toBe(2);
    expect(r.reasonKey).toBe('keWo');
  });

  it('2 stars for 相刑 (寅巳 刑)', () => {
    const r = computeCompat('甲寅', '丁巳');      // gan 甲丁 neutral; 寅巳 刑
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
```

- [ ] **Step 3: Run test — expect failure**

Run: `npm test -w @lunarcal/shared -- bazi.compat`
Expected: FAIL — `computeCompat` not yet exported.

- [ ] **Step 4: Implement computeCompat**

Replace the `_placeholder` stub in `packages/shared/src/bazi/compat.ts` with the full export. The complete file should read:

```typescript
import {
  TIAN_HE,
  DI_LIU_HE,
  DI_SAN_HE_GROUPS,
  DI_CHONG,
  DI_XING_PAIRS,
  DI_HAI,
  DI_PO,
  WUXING_OF_GAN,
  WUXING_GENERATES,
  WUXING_CONTROLS,
} from './tables';
import { COMPAT_REASONS_ZH_HANT } from './compatReasons.zh-Hant';
import type { CompatScore, GanRelation, ZhiRelation, CompatReason } from './types';

export function ganRelation(userGan: string, targetGan: string): GanRelation {
  if (TIAN_HE[userGan] === targetGan) return '相合';
  if (userGan === targetGan) return '比和';
  const userE = WUXING_OF_GAN[userGan];
  const targetE = WUXING_OF_GAN[targetGan];
  if (!userE || !targetE) return '無關';
  if (userE === targetE) return '比和';
  if (WUXING_GENERATES[targetE] === userE) return '生我';
  if (WUXING_GENERATES[userE] === targetE) return '我生';
  if (WUXING_CONTROLS[targetE] === userE) return '剋我';
  if (WUXING_CONTROLS[userE] === targetE) return '我剋';
  return '無關';
}

export function zhiRelation(userZhi: string, targetZhi: string): ZhiRelation {
  if (DI_CHONG[userZhi] === targetZhi) return '相沖';
  for (const group of DI_SAN_HE_GROUPS) {
    if (group.includes(userZhi) && group.includes(targetZhi) && userZhi !== targetZhi) {
      return '三合';
    }
  }
  if (DI_LIU_HE[userZhi] === targetZhi) return '六合';
  if (DI_XING_PAIRS.has(`${userZhi}${targetZhi}`)) return '相刑';
  if (DI_HAI[userZhi] === targetZhi) return '相害';
  if (DI_PO[userZhi] === targetZhi) return '相破';
  return '無關';
}

function isValidGanZhi(gz: string): boolean {
  if (gz.length !== 2) return false;
  return Boolean(WUXING_OF_GAN[gz[0]]);
}

export function computeCompat(userDayGanZhi: string, targetDayGanZhi: string): CompatScore {
  // Defensive: on bad input, return neutral instead of throwing.
  if (!isValidGanZhi(userDayGanZhi) || !isValidGanZhi(targetDayGanZhi)) {
    console.warn(
      `[computeCompat] invalid ganzhi input: user=${userDayGanZhi} target=${targetDayGanZhi}`,
    );
    return {
      stars: 3,
      reasonKey: 'neutral',
      reasonText: COMPAT_REASONS_ZH_HANT.neutral,
      detail: { ganRelation: '無關', zhiRelation: '無關' },
    };
  }

  const userGan = userDayGanZhi[0];
  const userZhi = userDayGanZhi[1];
  const targetGan = targetDayGanZhi[0];
  const targetZhi = targetDayGanZhi[1];

  const gRel = ganRelation(userGan, targetGan);
  const zRel = zhiRelation(userZhi, targetZhi);

  let stars: CompatScore['stars'] = 3;
  let reasonKey: CompatReason = 'neutral';

  // Priority order matters — most specific (and most extreme) wins.
  if (gRel === '相合' && (zRel === '三合' || zRel === '六合')) {
    stars = 5; reasonKey = 'tianHe_diHe';
  } else if (zRel === '相沖') {
    stars = 1; reasonKey = 'xiangChong';
  } else if (gRel === '相合') {
    stars = 4; reasonKey = 'tianHe';
  } else if (zRel === '三合') {
    stars = 4; reasonKey = 'sanHe';
  } else if (zRel === '六合') {
    stars = 4; reasonKey = 'liuHe';
  } else if (gRel === '生我') {
    stars = 4; reasonKey = 'shengWo';
  } else if (zRel === '相刑') {
    stars = 2; reasonKey = 'xiang';
  } else if (zRel === '相破') {
    stars = 2; reasonKey = 'xiangPo';
  } else if (zRel === '相害') {
    stars = 2; reasonKey = 'xiangHai';
  } else if (gRel === '剋我') {
    stars = 2; reasonKey = 'keWo';
  } else if (gRel === '比和') {
    stars = 3; reasonKey = 'biHe';
  } else {
    stars = 3; reasonKey = 'neutral';
  }

  return {
    stars,
    reasonKey,
    reasonText: COMPAT_REASONS_ZH_HANT[reasonKey],
    detail: { ganRelation: gRel, zhiRelation: zRel },
  };
}
```

- [ ] **Step 5: Run tests — expect pass**

Run: `npm test -w @lunarcal/shared -- bazi.compat`
Expected: all 16 compat tests pass.

- [ ] **Step 6: Run full shared test suite**

Run: `npm test -w @lunarcal/shared`
Expected: all suites pass (smoke, schemas, compute, compat).

- [ ] **Step 7: Commit**

```bash
git add packages/shared/src/bazi/compat.ts packages/shared/src/bazi/compatReasons.zh-Hant.ts packages/shared/src/__tests__/bazi.compat.test.ts
git commit -m "feat(bazi): implement day-pillar compatibility scoring"
```

---

## Task 10: Public re-exports from shared package

**Files:**
- Create: `packages/shared/src/bazi/index.ts`
- Modify: `packages/shared/src/index.ts`

- [ ] **Step 1: Write bazi index**

Create `packages/shared/src/bazi/index.ts`:

```typescript
export { computeBazi } from './compute';
export { computeCompat, ganRelation, zhiRelation } from './compat';
export { COMPAT_REASONS_ZH_HANT } from './compatReasons.zh-Hant';
export { BaziError } from './errors';
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
} from './types';
```

- [ ] **Step 2: Re-export from package root**

Open `packages/shared/src/index.ts` and append at the end:

```typescript
// Bazi engine + compat scoring (local-only; no API exposure)
export {
  computeBazi,
  computeCompat,
  ganRelation,
  zhiRelation,
  COMPAT_REASONS_ZH_HANT,
  BaziError,
  type BirthProfile,
  type SavedDate,
  type BaziPillar,
  type BaziChart,
  type DaYun,
  type GanRelation,
  type ZhiRelation,
  type CompatReason,
  type CompatScore,
} from './bazi';

// Profile schemas (local-only)
export {
  BirthProfileSchema,
  SavedDateSchema,
  SavedDatesArraySchema,
} from './schemas/profile';
```

- [ ] **Step 3: Verify type compile**

Run: `npm run build -w @lunarcal/shared`
Expected: `tsc` succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add packages/shared/src/bazi/index.ts packages/shared/src/index.ts
git commit -m "feat(shared): export bazi module + profile schemas"
```

---

## Task 11: Mobile uuid utility

**Files:**
- Create: `src/utils/uuid.ts`

No native `crypto.randomUUID` in React Native. Use a small inline RFC 4122–shaped implementation; sufficient for local-only saved-date IDs (collisions effectively impossible at single-user scale).

- [ ] **Step 1: Write uuid utility**

Create `src/utils/uuid.ts`:

```typescript
/**
 * RFC 4122–shaped v4 UUID generator using Math.random.
 * Sufficient for local-only AsyncStorage record IDs; not for security-sensitive use.
 */
export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/uuid.ts
git commit -m "feat(mobile): add small uuid utility for local IDs"
```

---

## Task 12: Mobile re-export module for bazi

**Files:**
- Create: `src/utils/bazi.ts`

- [ ] **Step 1: Write file**

Create `src/utils/bazi.ts`:

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/bazi.ts
git commit -m "feat(mobile): re-export bazi module from shared"
```

---

## Task 13: profileStorage — birth profile CRUD

**Files:**
- Create: `src/utils/profileStorage.ts`

> Note: birth profile and saved-date data are local-only. Never serialise either into network requests, analytics events, or crash-report payloads.

- [ ] **Step 1: Write storage module**

Create `src/utils/profileStorage.ts`:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BirthProfileSchema,
  SavedDateSchema,
  SavedDatesArraySchema,
  type BirthProfile,
  type SavedDate,
} from '@lunarcal/shared';
import { uuid } from './uuid';

const KEY_PROFILE = '@lunarcal/birthProfile';
const KEY_SAVED_DATES = '@lunarcal/savedDates';

export type ProfileInput = {
  solarDate: string;
  solarTime: string | null;
  gender: 'male' | 'female' | null;
};

export async function getProfile(): Promise<BirthProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY_PROFILE);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const result = BirthProfileSchema.safeParse(parsed);
    if (!result.success) {
      console.warn('[profileStorage] profile schema mismatch, treating as absent');
      return null;
    }
    return result.data;
  } catch (e) {
    console.warn('[profileStorage] getProfile failed', e);
    return null;
  }
}

export async function setProfile(input: ProfileInput): Promise<BirthProfile> {
  const now = new Date().toISOString();
  const existing = await getProfile();
  const profile: BirthProfile = {
    version: 1,
    solarDate: input.solarDate,
    solarTime: input.solarTime,
    gender: input.gender,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  const validated = BirthProfileSchema.parse(profile);     // throws on bad input
  await AsyncStorage.setItem(KEY_PROFILE, JSON.stringify(validated));
  return validated;
}

export async function clearProfile(): Promise<void> {
  await AsyncStorage.removeItem(KEY_PROFILE);
}

export async function getSavedDates(): Promise<SavedDate[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY_SAVED_DATES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Filter out malformed individual items rather than rejecting the whole array.
    const good: SavedDate[] = [];
    for (const item of parsed) {
      const r = SavedDateSchema.safeParse(item);
      if (r.success) good.push(r.data);
      else console.warn('[profileStorage] dropped malformed saved date', item);
    }
    return good;
  } catch (e) {
    console.warn('[profileStorage] getSavedDates failed', e);
    return [];
  }
}

async function writeSavedDates(items: SavedDate[]): Promise<void> {
  const validated = SavedDatesArraySchema.parse(items);
  await AsyncStorage.setItem(KEY_SAVED_DATES, JSON.stringify(validated));
}

export async function addSavedDate(label: string, solarDate: string): Promise<SavedDate> {
  const item: SavedDate = {
    id: uuid(),
    label: label.trim(),
    solarDate,
    createdAt: new Date().toISOString(),
  };
  const current = await getSavedDates();
  const next = [...current, item];
  await writeSavedDates(next);
  return item;
}

export async function removeSavedDate(id: string): Promise<void> {
  const current = await getSavedDates();
  await writeSavedDates(current.filter((d) => d.id !== id));
}

export async function updateSavedDate(
  id: string,
  patch: Partial<Pick<SavedDate, 'label' | 'solarDate'>>,
): Promise<SavedDate | null> {
  const current = await getSavedDates();
  const idx = current.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  const updated: SavedDate = { ...current[idx], ...patch };
  const next = [...current];
  next[idx] = updated;
  await writeSavedDates(next);
  return updated;
}

export async function clearSavedDates(): Promise<void> {
  await AsyncStorage.removeItem(KEY_SAVED_DATES);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/profileStorage.ts
git commit -m "feat(mobile): add profileStorage module for local-only profile + saved dates"
```

---

## Task 14: BirthProfileContext

**Files:**
- Create: `src/context/BirthProfileContext.tsx`

- [ ] **Step 1: Write context provider**

Create `src/context/BirthProfileContext.tsx`:

```typescript
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  getProfile,
  setProfile as writeProfile,
  clearProfile as wipeProfile,
  getSavedDates,
  addSavedDate as addSaved,
  removeSavedDate as removeSaved,
  updateSavedDate as updateSaved,
  clearSavedDates as wipeSavedDates,
  type ProfileInput,
} from '../utils/profileStorage';
import type { BirthProfile, SavedDate } from '@lunarcal/shared';

interface BirthProfileContextValue {
  profile: BirthProfile | null;
  savedDates: SavedDate[];
  isLoading: boolean;
  saveProfile: (input: ProfileInput) => Promise<void>;
  clearProfile: (alsoClearSavedDates: boolean) => Promise<void>;
  addSavedDate: (label: string, solarDate: string) => Promise<void>;
  removeSavedDate: (id: string) => Promise<void>;
  updateSavedDate: (id: string, patch: Partial<Pick<SavedDate, 'label' | 'solarDate'>>) => Promise<void>;
}

const BirthProfileContext = createContext<BirthProfileContextValue | null>(null);

export function BirthProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<BirthProfile | null>(null);
  const [savedDates, setSavedDates] = useState<SavedDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [p, s] = await Promise.all([getProfile(), getSavedDates()]);
        if (!cancelled) {
          setProfile(p);
          setSavedDates(s);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const saveProfile = useCallback(async (input: ProfileInput) => {
    const next = await writeProfile(input);
    setProfile(next);
  }, []);

  const clearProfile = useCallback(async (alsoClearSavedDates: boolean) => {
    await wipeProfile();
    if (alsoClearSavedDates) {
      await wipeSavedDates();
      setSavedDates([]);
    }
    setProfile(null);
  }, []);

  const addSavedDate = useCallback(async (label: string, solarDate: string) => {
    const created = await addSaved(label, solarDate);
    setSavedDates((prev) => [...prev, created]);
  }, []);

  const removeSavedDate = useCallback(async (id: string) => {
    await removeSaved(id);
    setSavedDates((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const updateSavedDate = useCallback(async (id: string, patch: Partial<Pick<SavedDate, 'label' | 'solarDate'>>) => {
    const updated = await updateSaved(id, patch);
    if (!updated) return;
    setSavedDates((prev) => prev.map((d) => (d.id === id ? updated : d)));
  }, []);

  const value: BirthProfileContextValue = {
    profile,
    savedDates,
    isLoading,
    saveProfile,
    clearProfile,
    addSavedDate,
    removeSavedDate,
    updateSavedDate,
  };

  return (
    <BirthProfileContext.Provider value={value}>{children}</BirthProfileContext.Provider>
  );
}

export function useBirthProfile(): BirthProfileContextValue {
  const ctx = useContext(BirthProfileContext);
  if (!ctx) throw new Error('useBirthProfile must be used inside <BirthProfileProvider>');
  return ctx;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/context/BirthProfileContext.tsx
git commit -m "feat(mobile): add BirthProfileContext for profile + saved dates state"
```

---

## Task 15: Wire BirthProfileProvider into App.tsx

**Files:**
- Modify: `App.tsx`

- [ ] **Step 1: Inspect current provider tree**

Run: `grep -n "Provider" App.tsx`
Identify where `QueryClientProvider` and `ThemeProvider` wrap the tree.

- [ ] **Step 2: Add provider import**

At the top of `App.tsx`, add:

```typescript
import { BirthProfileProvider } from './src/context/BirthProfileContext';
```

- [ ] **Step 3: Wrap tree**

Inside the existing provider stack, place `<BirthProfileProvider>` immediately *inside* `<QueryClientProvider>` and *outside* (or sibling to) `<ThemeProvider>`. The resulting JSX should look like:

```tsx
<QueryClientProvider client={queryClient}>
  <BirthProfileProvider>
    <ThemeProvider>
      {/* existing AppContent */}
    </ThemeProvider>
  </BirthProfileProvider>
</QueryClientProvider>
```

> If the existing tree uses a different ordering, preserve its order and just add `BirthProfileProvider` somewhere between `QueryClientProvider` and the children that need it.

- [ ] **Step 4: Smoke run**

Run: `npm start`
In a separate terminal: `npm run ios` (or `android`)
Expected: app boots, no provider-missing console errors.

- [ ] **Step 5: Commit**

```bash
git add App.tsx
git commit -m "feat(mobile): wire BirthProfileProvider into root tree"
```

---

## Task 16: BaziPillarCell component

**Files:**
- Create: `src/components/BaziPillarCell.tsx`

- [ ] **Step 1: Write component**

Create `src/components/BaziPillarCell.tsx`:

```tsx
import React from 'react';
import { View, Text, StyleSheet, AccessibilityInfo } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import type { BaziPillar } from '@lunarcal/shared';

interface Props {
  label: '年柱' | '月柱' | '日柱' | '時柱';
  pillar: BaziPillar | null;     // null when time unknown
  emphasize?: boolean;            // day pillar
  unknown?: boolean;              // time + hasTime=false
}

export function BaziPillarCell({ label, pillar, emphasize, unknown }: Props) {
  const { colors } = useTheme();

  if (unknown || !pillar) {
    return (
      <View
        style={[styles.cell, { backgroundColor: colors.surface, borderColor: colors.border }]}
        accessibilityLabel={`${label} 時辰未知`}
      >
        <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
        <Text style={[styles.unknownText, { color: colors.muted }]}>時辰未知</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.cell,
        { backgroundColor: colors.surface, borderColor: emphasize ? colors.primary : colors.border },
        emphasize && styles.emphasized,
      ]}
      accessibilityLabel={`${label} ${pillar.ganZhi}`}
    >
      <Text style={[styles.label, { color: emphasize ? colors.primary : colors.muted }]}>
        {emphasize ? '日主' : label}
      </Text>
      <Text style={[styles.gan, { color: colors.primary }]}>{pillar.gan}</Text>
      <Text style={[styles.zhi, { color: colors.text }]}>{pillar.zhi}</Text>
      <Text style={[styles.nayin, { color: colors.muted }]} numberOfLines={1}>
        {pillar.naYin}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    minHeight: 96,
  },
  emphasized: { borderWidth: 2 },
  label: { fontSize: 10, marginBottom: 4 },
  gan: { fontSize: 22, fontWeight: '700', lineHeight: 26 },
  zhi: { fontSize: 18, lineHeight: 22, marginTop: 2 },
  nayin: { fontSize: 9, marginTop: 6 },
  unknownText: { fontSize: 11, marginTop: 24 },
});
```

> If `useTheme()` returns a different shape than `{ colors: { primary, surface, border, text, muted } }`, adjust property names to match the existing `ThemeContext`. Run `grep -n "muted\|surface\|border" src/context/ThemeContext.tsx src/constants/colors.ts` before implementing to confirm.

- [ ] **Step 2: Commit**

```bash
git add src/components/BaziPillarCell.tsx
git commit -m "feat(mobile): add BaziPillarCell component"
```

---

## Task 17: BaziChart component

**Files:**
- Create: `src/components/BaziChart.tsx`

- [ ] **Step 1: Write component**

Create `src/components/BaziChart.tsx`:

```tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { BaziPillarCell } from './BaziPillarCell';
import type { BaziChart as BaziChartShape } from '@lunarcal/shared';

interface Props {
  bazi: BaziChartShape;
}

export function BaziChart({ bazi }: Props) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <View>
      <View style={styles.grid}>
        <BaziPillarCell label="年柱" pillar={bazi.year} />
        <View style={styles.spacer} />
        <BaziPillarCell label="月柱" pillar={bazi.month} />
        <View style={styles.spacer} />
        <BaziPillarCell label="日柱" pillar={bazi.day} emphasize />
        <View style={styles.spacer} />
        <BaziPillarCell label="時柱" pillar={bazi.time} unknown={!bazi.hasTime} />
      </View>

      <Pressable
        onPress={() => setExpanded((p) => !p)}
        style={[styles.toggle, { borderColor: colors.border }]}
        accessibilityRole="button"
        accessibilityLabel={expanded ? '收起更多資訊' : '顯示更多資訊'}
      >
        <Text style={[styles.toggleText, { color: colors.muted }]}>
          {expanded ? '收起 ▴' : '顯示更多 ▾'}
        </Text>
      </Pressable>

      {expanded && (
        <View style={[styles.detail, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <DetailRow label="十神 (天干)"
            values={[bazi.year.shiShenGan, bazi.month.shiShenGan, bazi.day.shiShenGan, bazi.time?.shiShenGan ?? '—']}
            colors={colors}
          />
          <DetailRow label="藏干"
            values={[
              bazi.year.hideGan.join('·') || '—',
              bazi.month.hideGan.join('·') || '—',
              bazi.day.hideGan.join('·') || '—',
              bazi.time?.hideGan.join('·') || '—',
            ]}
            colors={colors}
          />
          <DetailRow label="地勢"
            values={[bazi.year.diShi, bazi.month.diShi, bazi.day.diShi, bazi.time?.diShi ?? '—']}
            colors={colors}
          />
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: colors.muted }]}>胎元</Text>
            <Text style={[styles.metaValue, { color: colors.text }]}>{bazi.taiYuan || '—'}</Text>
            <Text style={[styles.metaLabel, { color: colors.muted, marginLeft: 16 }]}>命宮</Text>
            <Text style={[styles.metaValue, { color: colors.text }]}>{bazi.mingGong || '—'}</Text>
          </View>

          {bazi.daYun ? (
            <View style={styles.daYunBlock}>
              <Text style={[styles.daYunTitle, { color: colors.muted }]}>大運</Text>
              <View style={styles.daYunRow}>
                {bazi.daYun.map((d) => (
                  <View key={d.startAge} style={[styles.daYunCell, { borderColor: colors.border }]}>
                    <Text style={[styles.daYunAge, { color: colors.muted }]}>{d.startAge}歲</Text>
                    <Text style={[styles.daYunGanZhi, { color: colors.text }]}>{d.ganZhi}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <Text style={[styles.daYunHint, { color: colors.muted }]}>
              {bazi.hasTime ? '選填性別可顯示大運' : '輸入時辰可顯示大運'}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

function DetailRow({
  label,
  values,
  colors,
}: {
  label: string;
  values: string[];
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: colors.muted }]}>{label}</Text>
      <View style={styles.detailValues}>
        {values.map((v, i) => (
          <Text key={i} style={[styles.detailValue, { color: colors.text }]} numberOfLines={1}>
            {v}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', alignItems: 'stretch' },
  spacer: { width: 6 },
  toggle: {
    marginTop: 10,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  toggleText: { fontSize: 12 },
  detail: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  detailRow: { marginBottom: 8 },
  detailLabel: { fontSize: 10, marginBottom: 4 },
  detailValues: { flexDirection: 'row', justifyContent: 'space-between' },
  detailValue: { flex: 1, fontSize: 11, textAlign: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  metaLabel: { fontSize: 10 },
  metaValue: { fontSize: 12, marginLeft: 6 },
  daYunBlock: { marginTop: 10 },
  daYunTitle: { fontSize: 10, marginBottom: 6 },
  daYunRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 } as any,
  daYunCell: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    minWidth: 56,
    alignItems: 'center',
  },
  daYunAge: { fontSize: 9 },
  daYunGanZhi: { fontSize: 13, fontWeight: '600' },
  daYunHint: { fontSize: 11, marginTop: 8, textAlign: 'center', fontStyle: 'italic' },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/BaziChart.tsx
git commit -m "feat(mobile): add BaziChart with collapsible detail panel"
```

---

## Task 18: CompatStrip component

**Files:**
- Create: `src/components/CompatStrip.tsx`

- [ ] **Step 1: Write component**

Create `src/components/CompatStrip.tsx`:

```tsx
import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useBirthProfile } from '../context/BirthProfileContext';
import { computeBazi, computeCompat, BaziError } from '@lunarcal/shared';
import { getDayData } from '../utils/lunar';

interface Props {
  targetSolarDate: string;     // 'YYYY-MM-DD'
  onPress?: () => void;
  compact?: boolean;
}

export function CompatStrip({ targetSolarDate, onPress, compact }: Props) {
  const { profile, isLoading } = useBirthProfile();
  const { colors } = useTheme();

  const result = useMemo(() => {
    if (!profile) return null;
    try {
      const userBazi = computeBazi(profile);
      const [y, m, d] = targetSolarDate.split('-').map(Number);
      const dayData = getDayData(y, m, d);
      const targetGanZhi = dayData.dayGanZhi;       // expected from existing DayData shape
      return computeCompat(userBazi.day.ganZhi, targetGanZhi);
    } catch (e) {
      if (e instanceof BaziError) return null;
      console.warn('[CompatStrip] unexpected error', e);
      return null;
    }
  }, [profile, targetSolarDate]);

  if (isLoading) {
    return (
      <View style={[styles.skeleton, { backgroundColor: colors.surface }]} />
    );
  }

  if (!profile || !result) return null;

  const starString = '★'.repeat(result.stars) + '☆'.repeat(5 - result.stars);
  const a11y = `${result.stars} out of 5 stars, ${result.reasonText}`;

  const body = (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.primary + '40' },
        compact && styles.compact,
      ]}
      accessibilityLabel={a11y}
    >
      {!compact && <Text style={[styles.label, { color: colors.muted }]}>今日對你</Text>}
      <View style={styles.row}>
        <Text style={[styles.stars, { color: colors.primary }]}>{starString}</Text>
        <Text style={[styles.reason, { color: colors.text }]} numberOfLines={1}>
          {result.reasonText}
        </Text>
      </View>
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress} accessibilityRole="button">{body}</Pressable>;
  }
  return body;
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginVertical: 4,
  },
  compact: { padding: 8, marginVertical: 2 },
  label: { fontSize: 10, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center' },
  stars: { fontSize: 14, marginRight: 8 },
  reason: { fontSize: 12, flexShrink: 1 },
  skeleton: { height: 32, borderRadius: 10, marginVertical: 4 },
});
```

> The `getDayData(y, m, d)` return value is expected to expose `dayGanZhi`. If the existing `src/utils/lunar.ts` re-export uses a different field name for the day Ganzhi, swap `dayData.dayGanZhi` for the correct one (e.g. `dayData.ganZhi.day`). Run `grep -n "getDayData\|GanZhi" src/utils/lunar.ts packages/shared/src/lunar/index.ts` first.

- [ ] **Step 2: Commit**

```bash
git add src/components/CompatStrip.tsx
git commit -m "feat(mobile): add CompatStrip with full and compact variants"
```

---

## Task 19: ProfileForm modal

**Files:**
- Create: `src/components/ProfileForm.tsx`

- [ ] **Step 1: Write modal component**

Create `src/components/ProfileForm.tsx`:

```tsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Switch,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../context/ThemeContext';
import type { BirthProfile } from '@lunarcal/shared';
import type { ProfileInput } from '../utils/profileStorage';

interface Props {
  visible: boolean;
  initial?: BirthProfile | null;
  onCancel: () => void;
  onSubmit: (input: ProfileInput) => Promise<void>;
}

function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toHm(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function fromYmd(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function fromHm(s: string): Date {
  const [h, m] = s.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

export function ProfileForm({ visible, initial, onCancel, onSubmit }: Props) {
  const { colors } = useTheme();
  const [dateValue, setDateValue] = useState<Date>(initial ? fromYmd(initial.solarDate) : new Date(1990, 0, 1));
  const [timeKnown, setTimeKnown] = useState<boolean>(initial?.solarTime !== null && initial !== undefined && initial !== null);
  const [timeValue, setTimeValue] = useState<Date>(initial?.solarTime ? fromHm(initial.solarTime) : new Date(2000, 0, 1, 12, 0));
  const [gender, setGender] = useState<'male' | 'female' | null>(initial?.gender ?? null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    if (initial) {
      setDateValue(fromYmd(initial.solarDate));
      setTimeKnown(initial.solarTime !== null);
      setTimeValue(initial.solarTime ? fromHm(initial.solarTime) : new Date(2000, 0, 1, 12, 0));
      setGender(initial.gender);
    } else {
      setDateValue(new Date(1990, 0, 1));
      setTimeKnown(false);
      setTimeValue(new Date(2000, 0, 1, 12, 0));
      setGender(null);
    }
    setError(null);
  }, [visible, initial]);

  const handleSubmit = async () => {
    setError(null);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (dateValue > today) {
      setError('出生日期不可在未來');
      return;
    }
    if (dateValue.getFullYear() < 1900) {
      setError('出生日期需在 1900 年後');
      return;
    }
    const input: ProfileInput = {
      solarDate: toYmd(dateValue),
      solarTime: timeKnown ? toHm(timeValue) : null,
      gender,
    };
    try {
      setSubmitting(true);
      await onSubmit(input);
    } catch (e) {
      setError('儲存失敗，請重試');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onCancel}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>個人資料</Text>

        <Text style={[styles.label, { color: colors.muted }]}>出生日期</Text>
        <DateTimePicker
          value={dateValue}
          mode="date"
          display={Platform.OS === 'ios' ? 'compact' : 'default'}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
          onChange={(_, d) => d && setDateValue(d)}
          accessibilityLabel="出生日期"
        />

        <View style={styles.toggleRow}>
          <Text style={[styles.label, { color: colors.muted, flex: 1 }]}>出生時辰</Text>
          <Switch
            value={timeKnown}
            onValueChange={setTimeKnown}
            accessibilityLabel="出生時辰是否已知"
          />
          <Text style={[styles.toggleHint, { color: colors.muted }]}>{timeKnown ? '已知' : '未知'}</Text>
        </View>
        {timeKnown && (
          <DateTimePicker
            value={timeValue}
            mode="time"
            display={Platform.OS === 'ios' ? 'compact' : 'default'}
            onChange={(_, d) => d && setTimeValue(d)}
            accessibilityLabel="出生時辰"
          />
        )}

        <Text style={[styles.label, { color: colors.muted, marginTop: 16 }]}>性別 (選填)</Text>
        <View style={styles.genderRow}>
          {(['male', 'female', null] as const).map((g) => {
            const lbl = g === 'male' ? '男' : g === 'female' ? '女' : '不指定';
            const selected = gender === g;
            return (
              <Pressable
                key={String(g)}
                onPress={() => setGender(g)}
                style={[
                  styles.genderBtn,
                  { borderColor: colors.border, backgroundColor: selected ? colors.primary : colors.surface },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`性別 ${lbl}`}
              >
                <Text style={{ color: selected ? '#fff' : colors.text }}>{lbl}</Text>
              </Pressable>
            );
          })}
        </View>

        {error && <Text style={[styles.error, { color: colors.primary }]}>{error}</Text>}

        <View style={styles.actions}>
          <Pressable onPress={onCancel} style={[styles.btn, styles.btnGhost, { borderColor: colors.border }]}>
            <Text style={{ color: colors.text }}>取消</Text>
          </Pressable>
          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            style={[styles.btn, styles.btnPrimary, { backgroundColor: colors.primary, opacity: submitting ? 0.6 : 1 }]}
            accessibilityRole="button"
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>{submitting ? '儲存中…' : '儲存'}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 24 },
  label: { fontSize: 12, marginTop: 12, marginBottom: 6 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  toggleHint: { marginLeft: 8, fontSize: 12 },
  genderRow: { flexDirection: 'row', gap: 8 } as any,
  genderBtn: {
    flex: 1, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderRadius: 10,
  },
  actions: { flexDirection: 'row', marginTop: 32, gap: 12 } as any,
  btn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  btnGhost: { borderWidth: 1 },
  btnPrimary: {},
  error: { marginTop: 12, fontSize: 12 },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ProfileForm.tsx
git commit -m "feat(mobile): add ProfileForm modal for birth profile entry"
```

---

## Task 20: SavedDateRow + add/edit modal

**Files:**
- Create: `src/components/SavedDateRow.tsx`
- Create: `src/components/SavedDateForm.tsx`

- [ ] **Step 1: Write SavedDateRow**

Create `src/components/SavedDateRow.tsx`:

```tsx
import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useBirthProfile } from '../context/BirthProfileContext';
import { computeBazi, computeCompat } from '@lunarcal/shared';
import { getDayData } from '../utils/lunar';
import type { SavedDate } from '@lunarcal/shared';

interface Props {
  item: SavedDate;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function SavedDateRow({ item, onPress, onEdit, onDelete }: Props) {
  const { colors } = useTheme();
  const { profile } = useBirthProfile();

  const compat = useMemo(() => {
    if (!profile) return null;
    try {
      const userBazi = computeBazi(profile);
      const [y, m, d] = item.solarDate.split('-').map(Number);
      const dayData = getDayData(y, m, d);
      return computeCompat(userBazi.day.ganZhi, dayData.dayGanZhi);
    } catch {
      return null;
    }
  }, [profile, item.solarDate]);

  const lunarLabel = useMemo(() => {
    const [y, m, d] = item.solarDate.split('-').map(Number);
    try {
      const data = getDayData(y, m, d);
      return `${data.lunarYearGanZhi}年 ${data.lunarMonthCn}月${data.lunarDayCn}`;
    } catch {
      return '';
    }
  }, [item.solarDate]);

  const handleLongPress = () => {
    Alert.alert(item.label, undefined, [
      { text: '編輯', onPress: onEdit },
      { text: '刪除', style: 'destructive', onPress: onDelete },
      { text: '取消', style: 'cancel' },
    ]);
  };

  const stars = compat ? '★'.repeat(compat.stars) + '☆'.repeat(5 - compat.stars) : '';

  return (
    <Pressable
      onPress={onPress}
      onLongPress={handleLongPress}
      style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
      accessibilityRole="button"
      accessibilityLabel={`${item.label} ${item.solarDate} ${compat ? `${compat.stars} 星 ${compat.reasonText}` : ''}`}
      accessibilityActions={[
        { name: 'magicTap', label: '編輯或刪除' },
      ]}
      onAccessibilityAction={(e) => { if (e.nativeEvent.actionName === 'magicTap') handleLongPress(); }}
    >
      <View style={styles.left}>
        <Text style={[styles.label, { color: colors.text }]}>{item.label}</Text>
        <Text style={[styles.date, { color: colors.muted }]}>
          {item.solarDate}{lunarLabel ? ` · 農曆${lunarLabel}` : ''}
        </Text>
      </View>
      {compat && <Text style={[styles.stars, { color: colors.primary }]}>{stars}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 8,
  },
  left: { flex: 1 },
  label: { fontSize: 14, fontWeight: '600' },
  date: { fontSize: 11, marginTop: 2 },
  stars: { fontSize: 14 },
});
```

> Field names like `dayGanZhi`, `lunarYearGanZhi`, `lunarMonthCn`, `lunarDayCn` come from the existing `DayData` shape in `packages/shared/src/lunar/index.ts`. Confirm names before implementing and adjust if needed.

- [ ] **Step 2: Write SavedDateForm**

Create `src/components/SavedDateForm.tsx`:

```tsx
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../context/ThemeContext';

interface Props {
  visible: boolean;
  initialLabel?: string;
  initialSolarDate?: string;     // 'YYYY-MM-DD'
  onCancel: () => void;
  onSubmit: (label: string, solarDate: string) => Promise<void>;
}

function toYmd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function fromYmd(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function SavedDateForm({ visible, initialLabel, initialSolarDate, onCancel, onSubmit }: Props) {
  const { colors } = useTheme();
  const [label, setLabel] = useState(initialLabel ?? '');
  const [date, setDate] = useState<Date>(initialSolarDate ? fromYmd(initialSolarDate) : new Date());
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setLabel(initialLabel ?? '');
    setDate(initialSolarDate ? fromYmd(initialSolarDate) : new Date());
    setError(null);
  }, [visible, initialLabel, initialSolarDate]);

  const handleSubmit = async () => {
    const trimmed = label.trim();
    if (!trimmed) { setError('請輸入名稱'); return; }
    if (trimmed.length > 50) { setError('名稱不可超過 50 字'); return; }
    if (date.getFullYear() < 1900 || date.getFullYear() > 2100) { setError('日期需在 1900–2100 之間'); return; }
    try {
      setSubmitting(true);
      await onSubmit(trimmed, toYmd(date));
    } catch {
      setError('儲存失敗，請重試');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onCancel}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>{initialLabel ? '編輯日子' : '新增日子'}</Text>

        <Text style={[styles.label, { color: colors.muted }]}>名稱</Text>
        <TextInput
          value={label}
          onChangeText={setLabel}
          placeholder="婚禮、生日…"
          placeholderTextColor={colors.muted}
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          maxLength={50}
          accessibilityLabel="名稱"
        />

        <Text style={[styles.label, { color: colors.muted }]}>日期</Text>
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'compact' : 'default'}
          minimumDate={new Date(1900, 0, 1)}
          maximumDate={new Date(2100, 11, 31)}
          onChange={(_, d) => d && setDate(d)}
          accessibilityLabel="日期"
        />

        {error && <Text style={[styles.error, { color: colors.primary }]}>{error}</Text>}

        <View style={styles.actions}>
          <Pressable onPress={onCancel} style={[styles.btn, styles.btnGhost, { borderColor: colors.border }]}>
            <Text style={{ color: colors.text }}>取消</Text>
          </Pressable>
          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            style={[styles.btn, { backgroundColor: colors.primary, opacity: submitting ? 0.6 : 1 }]}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>{submitting ? '儲存中…' : '儲存'}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 24 },
  label: { fontSize: 12, marginTop: 16, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, padding: 10, fontSize: 14 },
  actions: { flexDirection: 'row', marginTop: 32, gap: 12 } as any,
  btn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  btnGhost: { borderWidth: 1 },
  error: { marginTop: 12, fontSize: 12 },
});
```

- [ ] **Step 3: Commit**

```bash
git add src/components/SavedDateRow.tsx src/components/SavedDateForm.tsx
git commit -m "feat(mobile): add SavedDateRow + SavedDateForm components"
```

---

## Task 21: BottomTabBar — extract from App.tsx

**Files:**
- Create: `src/components/BottomTabBar.tsx`
- Modify: `App.tsx`

- [ ] **Step 1: Inspect existing tab JSX in App.tsx**

Run: `grep -n "activeTab\|tab\|Tab" App.tsx`
Note the lines containing the current 2-tab JSX block.

- [ ] **Step 2: Create BottomTabBar with 3 tabs**

Create `src/components/BottomTabBar.tsx`:

```tsx
import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export type TabKey = 'daily' | 'calendar' | 'me';

interface Props {
  active: TabKey;
  onChange: (key: TabKey) => void;
}

const TABS: { key: TabKey; label: string; emoji: string }[] = [
  { key: 'daily',    label: '今日',  emoji: '📅' },
  { key: 'calendar', label: '月曆',  emoji: '⊞' },
  { key: 'me',       label: '我的',  emoji: '👤' },
];

export function BottomTabBar({ active, onChange }: Props) {
  const { colors } = useTheme();
  return (
    <View style={[styles.bar, { backgroundColor: colors.background, borderColor: colors.border }]}>
      {TABS.map((t) => {
        const selected = t.key === active;
        return (
          <Pressable
            key={t.key}
            onPress={() => onChange(t.key)}
            style={styles.tab}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={t.label}
          >
            <Text style={[styles.icon, { color: selected ? colors.primary : colors.muted }]}>
              {t.emoji}
            </Text>
            <Text style={[styles.label, { color: selected ? colors.primary : colors.muted }]}>
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 8,
    paddingBottom: 12,
  },
  tab: { flex: 1, alignItems: 'center' },
  icon: { fontSize: 18 },
  label: { fontSize: 11, marginTop: 2 },
});
```

> If the existing app already uses `@expo/vector-icons` for tab icons elsewhere, swap the emoji strings for matching icons. Confirm via `grep -n "Ionicons\|MaterialIcons" src/components/` before changing.

- [ ] **Step 3: Wire BottomTabBar into App.tsx**

In `App.tsx`:
- Update `activeTab` state type to `'daily' | 'calendar' | 'me'`.
- Replace the existing inline tab JSX with `<BottomTabBar active={activeTab} onChange={setActiveTab} />`.
- Add a new branch in the screen switch:

```tsx
{activeTab === 'me' && (
  <MeScreen
    year={year}
    month={month}
    day={selectedDay}
    onNavigateToDate={(y, m, d) => {
      setYear(y); setMonth(m); setSelectedDay(d); setActiveTab('daily');
    }}
  />
)}
```

- Import `MeScreen` (created in Task 22 — temporarily mock if needed):

```tsx
import { MeScreen } from './src/screens/MeScreen';
```

> If `MeScreen` doesn't exist yet, defer this import + branch until Task 22 lands. Verify the 3-tab bar compiles by stubbing the import with `const MeScreen = () => null;` and removing the stub once Task 22's file exists.

- [ ] **Step 4: Smoke run**

Run: `npm start` then `npm run ios`
Expected: 3-tab bar visible; tapping Me shows empty/null content; existing Daily + Calendar tabs unchanged.

- [ ] **Step 5: Commit**

```bash
git add src/components/BottomTabBar.tsx App.tsx
git commit -m "feat(mobile): extract BottomTabBar with 3-tab nav (daily/calendar/me)"
```

---

## Task 22: MeScreen — empty state + profile hero + chart + compat

**Files:**
- Create: `src/screens/MeScreen.tsx`

- [ ] **Step 1: Write MeScreen**

Create `src/screens/MeScreen.tsx`:

```tsx
import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useBirthProfile } from '../context/BirthProfileContext';
import { computeBazi, BaziError } from '@lunarcal/shared';
import { BaziChart } from '../components/BaziChart';
import { CompatStrip } from '../components/CompatStrip';
import { ProfileForm } from '../components/ProfileForm';
import { SavedDateRow } from '../components/SavedDateRow';
import { SavedDateForm } from '../components/SavedDateForm';
import type { SavedDate } from '@lunarcal/shared';

interface Props {
  year: number;
  month: number;
  day: number;
  onNavigateToDate: (year: number, month: number, day: number) => void;
}

function todaySolarDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function MeScreen({ year, month, day, onNavigateToDate }: Props) {
  const { colors } = useTheme();
  const {
    profile, savedDates, isLoading,
    saveProfile, clearProfile,
    addSavedDate, removeSavedDate, updateSavedDate,
  } = useBirthProfile();

  const [profileFormVisible, setProfileFormVisible] = useState(false);
  const [editingSaved, setEditingSaved] = useState<SavedDate | null>(null);
  const [adding, setAdding] = useState(false);

  const baziResult = useMemo(() => {
    if (!profile) return { kind: 'none' as const };
    try {
      return { kind: 'ok' as const, chart: computeBazi(profile) };
    } catch (e) {
      if (e instanceof BaziError) {
        return { kind: 'error' as const, code: e.code };
      }
      return { kind: 'error' as const, code: 'ENGINE_FAILURE' as const };
    }
  }, [profile]);

  const handleClearProfile = () => {
    Alert.alert(
      '清除個人資料？',
      '此操作無法復原。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清除（保留已存日子）',
          style: 'destructive',
          onPress: () => clearProfile(false),
        },
        {
          text: '清除（含已存日子）',
          style: 'destructive',
          onPress: () => clearProfile(true),
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={styles.skeletonBlock} />
        <View style={styles.skeletonBlock} />
      </ScrollView>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>無個人資料</Text>
        <Text style={[styles.emptyBody, { color: colors.muted }]}>輸入生辰可看每日運勢</Text>
        <Pressable
          style={[styles.cta, { backgroundColor: colors.primary }]}
          onPress={() => setProfileFormVisible(true)}
        >
          <Text style={styles.ctaText}>開始設定</Text>
        </Pressable>
        <ProfileForm
          visible={profileFormVisible}
          initial={null}
          onCancel={() => setProfileFormVisible(false)}
          onSubmit={async (input) => {
            await saveProfile(input);
            setProfileFormVisible(false);
          }}
        />
      </View>
    );
  }

  if (baziResult.kind === 'error') {
    return (
      <View style={[styles.empty, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>個人資料異常</Text>
        <Text style={[styles.emptyBody, { color: colors.muted }]}>請重新輸入</Text>
        <Pressable
          style={[styles.cta, { backgroundColor: colors.primary }]}
          onPress={() => setProfileFormVisible(true)}
        >
          <Text style={styles.ctaText}>重新輸入</Text>
        </Pressable>
        <ProfileForm
          visible={profileFormVisible}
          initial={profile}
          onCancel={() => setProfileFormVisible(false)}
          onSubmit={async (input) => {
            await saveProfile(input);
            setProfileFormVisible(false);
          }}
        />
      </View>
    );
  }

  const chart = baziResult.chart;
  const zodiac = chart.year.zhi; // 屬相 derived from year zhi; map to animal in UI
  const ZODIAC_MAP: Record<string, string> = {
    子: '鼠', 丑: '牛', 寅: '虎', 卯: '兔', 辰: '龍', 巳: '蛇',
    午: '馬', 未: '羊', 申: '猴', 酉: '雞', 戌: '狗', 亥: '豬',
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16 }}>
      <Text style={[styles.h1, { color: colors.text }]}>我的</Text>

      {/* Profile hero */}
      <View style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.heroSub, { color: colors.muted }]}>
            {chart.source.solarDate.split('-')[0]} · {chart.year.ganZhi}年 · 屬{ZODIAC_MAP[zodiac] ?? '?'}
          </Text>
          <Text style={[styles.heroMain, { color: colors.primary }]}>
            日主 {chart.dayMaster}{chart.dayMasterWuXing}
          </Text>
        </View>
        <Pressable
          onPress={() => setProfileFormVisible(true)}
          accessibilityLabel="編輯個人資料"
          style={styles.editBtn}
        >
          <Text style={[styles.editIcon, { color: colors.muted }]}>✎</Text>
        </Pressable>
      </View>

      {/* Bazi chart */}
      <Text style={[styles.sectionLabel, { color: colors.muted }]}>八字四柱</Text>
      <BaziChart bazi={chart} />

      {/* Today compat */}
      <Text style={[styles.sectionLabel, { color: colors.muted, marginTop: 20 }]}>今日對你</Text>
      <CompatStrip
        targetSolarDate={todaySolarDate()}
        onPress={() => {
          const d = new Date();
          onNavigateToDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
        }}
      />

      {/* Saved dates */}
      <View style={styles.savedHeader}>
        <Text style={[styles.sectionLabel, { color: colors.muted, marginTop: 20 }]}>已存日子</Text>
        <Pressable
          onPress={() => setAdding(true)}
          style={[styles.addBtn, { borderColor: colors.primary }]}
          accessibilityLabel="新增日子"
        >
          <Text style={{ color: colors.primary, fontSize: 12 }}>+ 新增</Text>
        </Pressable>
      </View>
      {savedDates.length === 0 ? (
        <Text style={[styles.savedEmpty, { color: colors.muted }]}>尚未新增日子</Text>
      ) : (
        savedDates.map((d) => (
          <SavedDateRow
            key={d.id}
            item={d}
            onPress={() => {
              const [y, m, dd] = d.solarDate.split('-').map(Number);
              onNavigateToDate(y, m, dd);
            }}
            onEdit={() => setEditingSaved(d)}
            onDelete={() => removeSavedDate(d.id)}
          />
        ))
      )}

      {/* Footer */}
      <Text style={[styles.disclaimer, { color: colors.muted }]}>
        日柱對比僅作日常參考，{'\n'}非完整命理分析。
      </Text>
      <Pressable onPress={handleClearProfile} style={styles.clearBtn}>
        <Text style={[styles.clearText, { color: colors.primary }]}>清除個人資料</Text>
      </Pressable>

      {/* Modals */}
      <ProfileForm
        visible={profileFormVisible}
        initial={profile}
        onCancel={() => setProfileFormVisible(false)}
        onSubmit={async (input) => {
          await saveProfile(input);
          setProfileFormVisible(false);
        }}
      />
      <SavedDateForm
        visible={adding}
        onCancel={() => setAdding(false)}
        onSubmit={async (label, solarDate) => {
          await addSavedDate(label, solarDate);
          setAdding(false);
        }}
      />
      <SavedDateForm
        visible={editingSaved !== null}
        initialLabel={editingSaved?.label}
        initialSolarDate={editingSaved?.solarDate}
        onCancel={() => setEditingSaved(null)}
        onSubmit={async (label, solarDate) => {
          if (editingSaved) {
            await updateSavedDate(editingSaved.id, { label, solarDate });
          }
          setEditingSaved(null);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '600' },
  emptyBody: { fontSize: 14, marginTop: 8, textAlign: 'center' },
  cta: { marginTop: 24, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  ctaText: { color: '#fff', fontWeight: '600' },
  h1: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  hero: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  heroSub: { fontSize: 11 },
  heroMain: { fontSize: 22, fontWeight: '700', marginTop: 6 },
  editBtn: { padding: 8 },
  editIcon: { fontSize: 18 },
  sectionLabel: { fontSize: 11, marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' as const },
  savedHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addBtn: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 20 },
  savedEmpty: { fontSize: 12, fontStyle: 'italic', marginVertical: 8 },
  disclaimer: { fontSize: 11, textAlign: 'center', marginTop: 32, lineHeight: 16 },
  clearBtn: { alignItems: 'center', marginTop: 16, marginBottom: 32, paddingVertical: 12 },
  clearText: { fontSize: 13 },
  skeletonBlock: {
    height: 80, margin: 16, borderRadius: 12, backgroundColor: '#88888820',
  },
});
```

- [ ] **Step 2: If you stubbed `MeScreen` in Task 21, remove the stub and use this import**

Confirm `App.tsx` imports `MeScreen` from `./src/screens/MeScreen`.

- [ ] **Step 3: Smoke run**

Run: `npm run ios`
Expected:
- No profile → empty state with "開始設定" button works
- After save → hero + Bazi chart + today compat + saved-date section visible
- Tapping "+ 新增" opens SavedDateForm, save → row appears
- Long-press a saved row → action sheet
- Clear profile button → alert with three options

- [ ] **Step 4: Commit**

```bash
git add src/screens/MeScreen.tsx
git commit -m "feat(mobile): add MeScreen with profile, chart, compat, saved dates"
```

---

## Task 23: Add compact CompatStrip to DailyDetailScreen

**Files:**
- Modify: `src/screens/DailyDetailScreen.tsx`

- [ ] **Step 1: Inspect insertion point**

Run: `grep -n "YiJi\|宜忌\|YiJiCard" src/screens/DailyDetailScreen.tsx`
Identify the JSX where Yi/Ji cards are rendered.

- [ ] **Step 2: Insert CompatStrip above Yi/Ji**

In `src/screens/DailyDetailScreen.tsx`:

Add import near the top:
```typescript
import { CompatStrip } from '../components/CompatStrip';
```

Compute target solar date string (likely already available as `year/month/day` props in the screen). Insert this JSX immediately above the Yi/Ji section:

```tsx
<CompatStrip
  targetSolarDate={`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`}
  compact
/>
```

CompatStrip returns `null` when profile absent, so existing layout is preserved for users without a profile.

- [ ] **Step 3: Smoke run**

Run: `npm run ios`
Expected:
- No profile → DailyDetail unchanged
- With profile → compact compat strip appears just above Yi/Ji cards

- [ ] **Step 4: Commit**

```bash
git add src/screens/DailyDetailScreen.tsx
git commit -m "feat(mobile): show compat strip on DailyDetailScreen when profile exists"
```

---

## Task 24: Update root CLAUDE.md mention of test runner

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update the "Known Gaps" entry**

Replace the line:
```
- No mobile test runner (Jest, Detox) — API has Vitest coverage
```
with:
```
- No mobile UI test runner (Jest, Detox) — pure-fn code in `@lunarcal/shared` has Vitest coverage; mobile screens rely on manual QA
```

Also update the "Common Commands" section to add:
```
npm test -w @lunarcal/shared  # Run shared package Vitest tests
npm test                       # Run all workspace tests (api + shared)
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md test runner notes for shared workspace"
```

---

## Task 25: Manual QA pass

**Files:** none (verification only)

Run through every item in the spec's manual QA checklist. For each item, confirm behaviour on iOS sim (and Android if available) before marking the step complete.

- [ ] **Step 1: Cold start, no profile → Me tab shows empty state with "開始設定" button**
- [ ] **Step 2: Profile form: save with all fields → hero + chart renders**
- [ ] **Step 3: Profile form: save with `solarTime` null → time pillar shows "時辰未知"**
- [ ] **Step 4: Profile form: save with `gender` null → 大運 panel hidden + hint shown when expanded**
- [ ] **Step 5: Profile form: save with both time and gender null → time pillar "未知" + 大運 hint shown**
- [ ] **Step 6: Edit existing profile → all fields pre-fill correctly**
- [ ] **Step 7: Bazi chart "顯示更多" toggle expands/collapses; daYun row scrolls if needed**
- [ ] **Step 8: Compat strip on Me tab shows today's score; tapping switches to Daily tab on today**
- [ ] **Step 9: Compat strip on DailyDetail appears above Yi/Ji when profile exists; absent otherwise**
- [ ] **Step 10: Add saved date: empty label → inline "請輸入名稱" error**
- [ ] **Step 11: Add saved date: valid → row appears with stars + reason**
- [ ] **Step 12: Tap saved date → switches to Daily tab on correct date**
- [ ] **Step 13: Long-press saved date → action sheet (編輯/刪除/取消) works**
- [ ] **Step 14: Edit saved date label or date → row updates**
- [ ] **Step 15: Light theme + Dark theme: all new screens render correctly (toggle via Settings)**
- [ ] **Step 16: AsyncStorage corruption test — paste this command in a debug script and confirm Me tab still works:**

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.setItem('@lunarcal/birthProfile', '{ bad json');
```

Expected: app behaves as if no profile (logs warning).

- [ ] **Step 17: Clear profile flow — three buttons (取消/保留已存日子/含已存日子) all behave correctly**
- [ ] **Step 18: iOS build runs (`npm run ios`)**
- [ ] **Step 19: Android build runs (`npm run android`) — confirm tab bar, modals, date picker all work**
- [ ] **Step 20: VoiceOver pass — open VoiceOver, tab through Me screen; confirm pillar cells, compat stars, saved rows announce sensibly**

After completing all 20 verification items, commit a journal note (no code change):

```bash
git commit --allow-empty -m "qa: manual smoke pass for bazi/me-tab phase"
```

---

## Final Verification

- [ ] **Run all tests**

```bash
npm test
```
Expected: all api + shared tests pass.

- [ ] **Run typecheck**

```bash
npm run build -w @lunarcal/shared
npx tsc --noEmit
```
Expected: zero errors.

- [ ] **Run lint**

```bash
npx expo lint
```
Expected: no new violations introduced.

- [ ] **Open a PR**

```bash
gh pr create --title "feat: Bazi profile + Me tab + day-pillar compat" --body "$(cat <<'EOF'
## Summary
- New "Me" tab hosts birth profile, computed 4-pillar Bazi chart, day-pillar compatibility for any date, and a saved-dates list.
- All birth/saved data is local-only (AsyncStorage); no API or telemetry touches it.
- Compat strip also surfaces on DailyDetail when a profile exists.

## Test plan
- [ ] `npm test` passes (api + shared)
- [ ] Manual QA checklist from `docs/superpowers/plans/2026-05-21-bazi-me-tab.md` Task 25 verified on iOS
- [ ] Android build + smoke pass

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Self-Review Notes (engineer reading the plan: skim before starting)

- The **Task 5 spike** is critical: if `getStartAge`/`getStartYear`/`getGanZhi` names differ in `lunar-javascript@1.7.7`, adjust the helper in Task 7 before continuing.
- `getDayData` return shape (used in CompatStrip + SavedDateRow): confirm exact property name for day Ganzhi via `grep -n "dayGanZhi\|GanZhi" packages/shared/src/lunar/index.ts` before Task 18.
- `useTheme()` color keys (`primary`, `surface`, `border`, `muted`, `text`, `background`): confirm exact keys via `cat src/constants/colors.ts` before any UI task. If keys differ, search-and-replace in all created components.
- Tab icons: emoji used as placeholder. If existing app uses `@expo/vector-icons`, replace in Task 21 with matching icons (e.g. `<Ionicons name="person-outline" />`).
- "Out of scope" items the spec explicitly defers (share card, cloud sync, full 用神 analysis): do NOT add scaffolding for these in this phase, even if they look easy.
