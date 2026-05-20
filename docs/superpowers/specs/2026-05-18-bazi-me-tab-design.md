# Bazi Profile + "Me" Tab Design

**Date:** 2026-05-18
**Status:** Approved, ready for implementation plan

## Overview

Add personalisation to LunarCal: users enter their birth date (and optional time, gender), the app computes their Bazi (八字) chart, and shows day-by-day compatibility ratings between the user's day pillar (日柱) and any given calendar day. A new dedicated "Me" tab (我的) hosts the profile, the Bazi chart, today's compatibility, and a list of user-saved lunar dates (e.g. wedding, anniversary).

Out of scope for this phase: share-as-image card, user accounts / cloud sync, full Bazi 用神/喜神 analysis, social features.

## Requirements

1. **Birth profile entry** — solar date (required), birth time (optional), gender (optional). Stored locally only, never sent over network.
2. **Bazi chart display** — 4-pillar grid (year/month/day/time); time pillar shown as "時辰未知" placeholder if time unset. Collapsible "more" panel for 藏干 / 十神 / 納音 / 大運 (大運 requires both time and gender).
3. **Daily compatibility readout** — 5-star score + 1-line reason, derived from user day Ganzhi vs target day Ganzhi.
4. **Compatibility surface points** — Me tab (today) and DailyDetail screen (for selected day).
5. **Saved dates list** — user bookmarks specific solar dates with a label. Each row shows date + compatibility score. Tap to navigate to the date in DailyDetail.
6. **Nav model** — extend bottom tabs from `daily | calendar` to `daily | calendar | me`.
7. **Privacy** — all birth data and saved dates live in AsyncStorage only. No telemetry includes birth fields.

## Architecture

### Navigation

`App.tsx` currently manages `activeTab: 'daily' | 'calendar'` inline. Change:

- Extend type to `'daily' | 'calendar' | 'me'`.
- Extract inline tab JSX into new `BottomTabBar` component with `{ active, onChange }` props.
- Add `MeScreen` mounted at the same level as `CalendarScreen` and `DailyDetailScreen`.

`MeScreen` receives the shared `year/month/day` state so it can render "today's compatibility" against the calendar date the user is currently focused on.

### Module additions

```
packages/shared/src/
├── bazi/
│   ├── compute.ts        # wrap lunar-javascript getEightChar() → typed BaziChart
│   ├── compat.ts         # pure-fn day-pillar compatibility scoring
│   ├── compatReasons.zh-Hant.ts  # localised reason strings
│   ├── types.ts          # shared TypeScript types
│   └── index.ts          # public re-exports
└── schemas/
    └── profile.ts        # Zod schemas for BirthProfile + SavedDate

apps/api/                  # unchanged — no backend changes (privacy: local-only)

src/
├── screens/MeScreen.tsx
├── components/
│   ├── BottomTabBar.tsx
│   ├── BaziChart.tsx
│   ├── BaziPillarCell.tsx
│   ├── CompatStrip.tsx
│   ├── ProfileForm.tsx
│   └── SavedDateRow.tsx
├── context/BirthProfileContext.tsx
└── utils/profileStorage.ts
```

### Data flow

1. `App.tsx` wraps tree with `<BirthProfileProvider>` (sibling to `ThemeProvider`, inside `QueryClientProvider`).
2. Provider hydrates `birthProfile` and `savedDates` from AsyncStorage on mount; sets `isLoading=false` when both resolved.
3. Consumers (`CompatStrip`, `MeScreen`) check `isLoading` first → render skeleton during hydrate, then either empty state or content.
4. `ProfileForm` submits → Provider's `saveProfile` action writes to AsyncStorage and updates context state.
5. `computeBazi(profile)` is pure; memoise via `useMemo` inside consumers (keyed on `profile.solarDate + solarTime + gender`).

## Data Model

### `BirthProfile`

```typescript
interface BirthProfile {
  version: 1;                          // for future schema migrations
  solarDate: string;                   // 'YYYY-MM-DD' (Gregorian)
  solarTime: string | null;            // 'HH:mm' 24h, null = 時辰未知
  gender: 'male' | 'female' | null;    // null = unspecified, affects 大運 only
  createdAt: string;                   // ISO
  updatedAt: string;                   // ISO
}
```

### `SavedDate`

```typescript
interface SavedDate {
  id: string;          // uuid v4
  label: string;       // user-entered, 1–50 chars
  solarDate: string;   // 'YYYY-MM-DD'
  createdAt: string;   // ISO
}
```

### Storage keys

- `@lunarcal/birthProfile` — single JSON object or absent
- `@lunarcal/savedDates` — JSON array, default `[]`

### Validation

Zod schemas in `packages/shared/src/schemas/profile.ts` enforce shape on every read. Parse failures → treated as absent / filtered out.

### Migration strategy

`version: 1` field is the migration anchor. Future versions must include a migration step in `profileStorage.getProfile()` before consumers see the data.

## Bazi Engine

### `BaziChart` shape

```typescript
interface BaziPillar {
  gan: string;          // 天干
  zhi: string;          // 地支
  ganZhi: string;       // 天干地支 concatenated
  wuXing: string;       // gan wuxing + zhi wuxing
  hideGan: string[];    // 藏干
  naYin: string;        // 納音
  shiShenGan: string;   // 十神 (gan)
  shiShenZhi: string[]; // 十神 for each hide-gan
  diShi: string;        // 地勢 / 十二長生
}

interface DaYun {
  startAge: number;
  startYear: number;
  ganZhi: string;
}

interface BaziChart {
  source: BirthProfile;
  hasTime: boolean;
  year: BaziPillar;
  month: BaziPillar;
  day: BaziPillar;
  time: BaziPillar | null;
  dayMaster: string;                       // day.gan
  dayMasterWuXing: string;
  wuXingCounts: Record<string, number>;    // 金木水火土
  daYun: DaYun[] | null;                   // null if !hasTime || gender===null
  taiYuan: string;
  mingGong: string;
}
```

### `computeBazi(profile)` implementation outline

```typescript
import { Solar } from 'lunar-javascript';

export function computeBazi(profile: BirthProfile): BaziChart {
  const [y, m, d] = profile.solarDate.split('-').map(Number);
  if (!y || !m || !d || y < 1900 || y > 2100) {
    throw new BaziError('INVALID_DATE', `solarDate out of range: ${profile.solarDate}`);
  }
  const hasTime = profile.solarTime !== null;
  const [hh, mm] = hasTime
    ? profile.solarTime!.split(':').map(Number)
    : [12, 0];

  const solar = Solar.fromYmdHms(y, m, d, hh, mm, 0);
  const lunar = solar.getLunar();
  const ec = lunar.getEightChar();

  // build year/month/day/time pillars from ec
  // compute wuXingCounts by walking pillars
  // if hasTime && gender: yun = ec.getYun(gender === 'male' ? 1 : 0); daYun = yun.getDaYun().slice(0, 8).map(...)
  // else: daYun = null
}
```

### Wu Xing lookup tables

```typescript
const WUXING_OF_GAN = { 甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',
                       己:'土',庚:'金',辛:'金',壬:'水',癸:'水' };
const WUXING_OF_ZHI = { 子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',
                       午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水' };
```

### Spike during implementation

The earlier verification showed `dy.getStartAge` errored in lunar-javascript v1.7.7. Implementation phase must spike `getYun().getDaYun()[0]` actual method names and adjust. Fallback: derive `startAge` from `getStartSolar()` if necessary.

### Mobile re-export

`src/utils/bazi.ts` re-exports `computeBazi` and types from `@lunarcal/shared/bazi`, mirroring the existing `src/utils/lunar.ts` pattern.

## Compatibility Scoring

### Approach

Day-pillar (日柱) comparison only. Full 4-pillar 用神/喜神 analysis is intentionally out of scope — simpler scoring matches mass-market apps' UX and computes in <1ms.

### Public API

```typescript
export function computeCompat(
  userDayGanZhi: string,    // from BaziChart.day.ganZhi
  targetDayGanZhi: string,  // from lunar.getDayInGanZhi() of target date
): CompatScore;

interface CompatScore {
  stars: 1 | 2 | 3 | 4 | 5;
  reasonKey: CompatReason;
  reasonText: string;       // localised zh-Hant
  detail: {
    ganRelation: GanRelation;
    zhiRelation: ZhiRelation;
  };
}
```

### Scoring matrix

| Combination | Stars | Reason key |
|---|---|---|
| 干合 + 三合/六合 | 5 | `tianHe_diHe` |
| 干合 only | 4 | `tianHe` |
| 三合 only | 4 | `sanHe` |
| 六合 only | 4 | `liuHe` |
| 干生我 (target generates user) | 4 | `shengWo` |
| 比和 (same wuxing) | 3 | `biHe` |
| 無關係 | 3 | `neutral` |
| 干剋我 | 2 | `keWo` |
| 相刑 / 相破 / 相害 | 2 | `xiang` / `xiangPo` / `xiangHai` |
| 相沖 | 1 | `xiangChong` |

### Lookup tables (in `compat.ts`)

```typescript
const TIAN_HE: Record<string, string> = {
  甲:'己', 己:'甲', 乙:'庚', 庚:'乙', 丙:'辛', 辛:'丙',
  丁:'壬', 壬:'丁', 戊:'癸', 癸:'戊',
};

const DI_LIU_HE: Record<string, string> = {
  子:'丑', 丑:'子', 寅:'亥', 亥:'寅', 卯:'戌', 戌:'卯',
  辰:'酉', 酉:'辰', 巳:'申', 申:'巳', 午:'未', 未:'午',
};

const DI_SAN_HE: string[][] = [
  ['申','子','辰'], ['亥','卯','未'], ['寅','午','戌'], ['巳','酉','丑'],
];

const DI_CHONG: Record<string, string> = {
  子:'午', 午:'子', 丑:'未', 未:'丑', 寅:'申', 申:'寅',
  卯:'酉', 酉:'卯', 辰:'戌', 戌:'辰', 巳:'亥', 亥:'巳',
};

// 刑/害/破 tables: see compat.ts implementation
```

### Reason strings (`compatReasons.zh-Hant.ts`)

```typescript
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

Future i18n adds a sibling file per locale.

## UI Components

### `BottomTabBar`

Extracts existing inline tab logic into a reusable component. Three fixed tabs (`daily | calendar | me`), each with icon + label. Theme-aware via `useTheme()`.

```typescript
interface BottomTabBarProps {
  active: 'daily' | 'calendar' | 'me';
  onChange: (key: 'daily' | 'calendar' | 'me') => void;
}
```

### `MeScreen` layout

```
ScrollView
├─ Header — 我的
│
├─ IF no profile:
│   EmptyState — "輸入生辰看每日運勢" + [開始設定] button
│
└─ ELSE:
    ├─ ProfileHero — "1990 · 庚午年 · 屬馬", "日主 辛金", edit icon
    │
    ├─ SectionLabel — 八字四柱
    ├─ BaziChart — 4 pillars (3 if time null) + collapsible details
    │
    ├─ SectionLabel — 今日對你
    ├─ CompatStrip — full variant for today's date
    │
    ├─ SectionLabel — 已存日子 [+ 新增]
    ├─ SavedDatesList — rows of SavedDateRow
    │
    └─ Footer
        ├─ Disclaimer — "日柱對比僅作日常參考，非完整命理分析。"
        └─ [清除個人資料] destructive button
```

ScrollView (not FlatList — saved dates list is small, typically ≤20).

### `BaziChart`

4-cell horizontal grid (3 cells if `bazi.time === null`). Day pillar visually emphasised (border + 日主 label). Below grid: collapsible "更多" panel showing 藏干, 十神, 納音, 大運 timeline.

### `BaziPillarCell`

```typescript
interface Props {
  label: '年柱' | '月柱' | '日柱' | '時柱';
  pillar: BaziPillar;
  emphasize?: boolean;   // day pillar
  unknown?: boolean;     // time + hasTime=false → "時辰未知" placeholder
}
```

### `CompatStrip`

Reused on `MeScreen` (full variant) and `DailyDetailScreen` (compact variant).

```typescript
interface Props {
  profile: BirthProfile | null;
  targetSolarDate: string;
  onPress?: () => void;
  compact?: boolean;
}
```

- `profile === null` → component returns `null` (caller can skip rendering wrapper).
- `isLoading` from context → renders 32px skeleton.

Full variant: label "今日對你" + 5-star row + reason text.
Compact variant: single row, stars + reason inline; sits above Yi/Ji on DailyDetail.

### `ProfileForm`

Modal (presentationStyle="formSheet" on iOS). Fields:

1. **出生日期** — `DateTimePicker` (existing dep), default today.
2. **出生時辰 (選填)** — toggle "未知時辰" / pick time. Toggle on → `solarTime = null`.
3. **性別 (選填)** — segmented control: 男 / 女 / 不指定. 不指定 → `gender = null`.

Buttons: 儲存 (primary), 取消 (dismiss). Edit mode pre-fills from existing profile.

Validation: solarDate ≥ 1900-01-01 and ≤ today (no future birth dates).

### `SavedDateRow`

```
┌────────────────────────────────────┐
│ 婚禮                ★★★★★          │
│ 2026/10/20 · 農曆庚戌年九月初十      │
└────────────────────────────────────┘
```

Tap → app switches to `daily` tab with the saved date prefilled.
Long-press → action sheet: 編輯 / 刪除.

### "Clear profile" flow

Tap `[清除個人資料]` → `Alert.alert` with:
- Confirm / Cancel buttons
- Toggle "也清除已存日子" (default off)

Confirm → `clearProfile()` (and `clearSavedDates()` if toggle on) → context updates → MeScreen reverts to empty state.

## Error Handling

### Storage reads

All `profileStorage` read functions catch and swallow errors, returning `null` or `[]`. Bad JSON or unknown schema version → behave as absent data. Never throws upward.

### Storage writes

Write functions throw on AsyncStorage failure. `BirthProfileContext` catches in its action handlers and surfaces a toast: "儲存失敗，請重試". No partial state.

### `computeBazi`

Throws `BaziError` with codes `INVALID_DATE | INVALID_TIME | ENGINE_FAILURE`. `MeScreen` wraps the call in try/catch; on `BaziError` it shows an inline error card with an "edit profile" button.

```typescript
export class BaziError extends Error {
  constructor(public code: 'INVALID_DATE' | 'INVALID_TIME' | 'ENGINE_FAILURE', msg: string) {
    super(msg);
    this.name = 'BaziError';
  }
}
```

### `computeCompat`

Never throws. Invalid Ganzhi input → returns `neutral` with 3 stars and logs a warning.

### 大運 visibility matrix

| hasTime | gender | DaYun shown? |
|---------|--------|--------------|
| true    | set    | yes, 8 pillars |
| true    | null   | hidden + hint "選填性別可顯示大運" |
| false   | any    | hidden + hint "輸入時辰可顯示大運" |

### Pre-1900 dates

UI date picker capped at 1900-01-01 minimum, 2100-12-31 maximum. Matches Bazi engine range.

### DST / timezone

Profile time is interpreted as local civil time at birth location. The app does not collect location. Documented in the chart screen footnote disclaimer.

### Saved dates edge cases

- Duplicate labels allowed.
- Past dates allowed (retrospective compat).
- Empty label submit → inline validation "請輸入名稱", no save.
- Storage migration: partial parse failure → filter bad items, keep good ones, log a warning.

### Context hydration race

Provider's `isLoading` flag prevents UI flash. Consumers render skeletons during hydrate, never the "no profile" empty state.

### Accessibility

- All form fields have `accessibilityLabel`.
- Bazi cells: `accessibilityLabel="日柱 辛亥"`.
- Star rating: `accessibilityLabel="4 out of 5 stars, 日柱相合"`.
- Saved-date row long-press surfaced via `accessibilityActions` for screen reader users.

## Testing

### Pure-fn coverage (Vitest, `@lunarcal/shared` workspace)

**`compute.test.ts`:**
- Hand-verified fixtures for 3 birthdays (one boundary 立春 case).
- `hasTime=false` → `time === null` and `daYun === null`.
- `gender=null` + `hasTime=true` → `daYun === null`.
- `gender=male` + `hasTime=true` → `daYun` length 8, `startAge` ascending.
- `wuXingCounts` sums to 8 (6 if no time).
- Invalid dates (year 1850, 2200, malformed string) → throws `BaziError('INVALID_DATE')`.

**`compat.test.ts`:**
- One fixture per scoring-matrix row (10+ cases).
- Reverse calls — zhi-relation symmetry expected; gan-relation asymmetry (`shengWo` vs 我生) verified.
- Invalid Ganzhi input → `neutral` + 3 stars + console warn.
- Target: 100% branch coverage on `compat.ts`.

**`profileSchema.test.ts`:**
- `BirthProfileSchema` round-trip with all field combinations (time null, gender null, both null).
- Bad inputs (missing version, malformed date, gender as string other than enum) rejected.
- `SavedDatesArraySchema` filters out bad items while keeping good ones.

### Mobile manual QA checklist (in implementation plan)

1. Cold start, no profile → Me tab empty state.
2. Profile form: save with all fields / save with time null / save with gender null.
3. Edit existing profile → fields pre-fill correctly.
4. Bazi chart: 4 pillars (with time) / 3 pillars (no time).
5. 大運 panel: visible only when both time and gender set.
6. Compat strip on Me tab (today) and on DailyDetail (selected date).
7. Saved date: add / edit / delete / tap → switches to daily tab on correct date.
8. Theme: light and dark for all new screens.
9. Clear profile flow with "也清除已存日子" toggle on and off.
10. AsyncStorage corruption (manually edit value to bad JSON) → graceful fallback to empty state.
11. iOS and Android both build and render.

### CI

Add `npm test -w @lunarcal/shared` to test pipeline. Update root `package.json` test script to run both `@lunarcal/api` and `@lunarcal/shared` workspaces.

### Coverage target

Pure Bazi/compat code: ≥90% line coverage. UI components untested but type-checked under strict TypeScript.

## Open Items (resolve during implementation plan)

1. **lunar-javascript DaYun API** — `getYun().getDaYun()[0].getStartAge()` errored in spike. Plan must include 30-min spike to confirm actual method names and adjust `compute.ts`.
2. **Tab bar visual design** — confirm icon set during implementation (existing app uses emoji-ish placeholder in mockup; may want SVG icons).
3. **DateTimePicker time format** — existing settings uses compact iOS picker; verify same component works for birth time selection or need full picker.
4. **Profile context placement in App.tsx tree** — verify it nests correctly inside QueryClientProvider but outside ThemeProvider (or sibling — either works, document choice).
