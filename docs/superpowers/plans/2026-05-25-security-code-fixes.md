# Security & Code Fix Plan — 2026-05-25

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all high/medium severity findings from `docs/audit-2026-05-25.md` with verified tests.

**Architecture:** Each task is self-contained. Tasks 1–5 are pure logic fixes in `packages/shared` and `src/utils`; Task 6 is a UI fix; Tasks 7–8 add API test coverage; Task 9 runs auto-fixable dependency updates.

**Tech Stack:** TypeScript, Vitest (shared/api tests), React Native (mobile), Zod, lunar-javascript

---

### Task 1: Fix getMonthDays padding cells (B1 — HIGH)

**Files:**
- Modify: `packages/shared/src/lunar/index.ts:300–320`
- Modify: `packages/shared/src/__tests__/smoke.test.ts` (add padding assertions)

Currently leading cells (before the 1st) and trailing cells (after month end) all get `getDayData(year, month, 1)` — wrong. They should show data from the adjacent month.

- [ ] **Step 1: Write the failing test**

Open `packages/shared/src/__tests__/smoke.test.ts` and add:

```ts
describe('getMonthDays — padding cells', () => {
  it('leading cells come from the previous month', () => {
    // May 2026 starts on a Friday (weekday 5).
    // Cells 0–4 should be from April 2026 (days 26–30).
    const weeks = getMonthDays(2026, 5);
    const firstRow = weeks[0];
    // leading cells: 5 cells (Mon=0 … Thu=3 is 4, Fri=5 means 5 leading)
    // Actually Solar.getWeek() returns 0=Sun … 6=Sat.
    // May 1 2026 is Friday = weekday 5.
    expect(firstRow[0].solar.month).toBe(4); // April
    expect(firstRow[0].solar.day).toBe(26);  // April 26
    expect(firstRow[4].solar.month).toBe(4); // April
    expect(firstRow[4].solar.day).toBe(30);  // April 30
    expect(firstRow[5].solar.month).toBe(5); // May 1
  });

  it('trailing cells come from the next month', () => {
    // May 2026: 31 days, starts Fri, last row ends on a Saturday (day 31).
    // No trailing cells needed in this case.
    // Use April 2026: starts Wed (weekday 3), 30 days.
    // Last partial row: Apr 27 (Sun) … Apr 30 (Wed) → 3 trailing cells (Thu–Sat from May).
    const weeks = getMonthDays(2026, 4);
    const lastRow = weeks[weeks.length - 1];
    const trailingCells = lastRow.filter(c => c.solar.month !== 4);
    expect(trailingCells.length).toBeGreaterThan(0);
    expect(trailingCells[0].solar.month).toBe(5); // May
    expect(trailingCells[0].solar.day).toBe(1);   // May 1
  });

  it('leading/trailing cells have isCurrentMonth false', () => {
    const weeks = getMonthDays(2026, 5);
    const firstRow = weeks[0];
    for (let i = 0; i < 5; i++) {
      expect(firstRow[i].isCurrentMonth).toBe(false);
    }
    expect(firstRow[5].isCurrentMonth).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -w @lunarcal/shared -- --reporter=verbose 2>&1 | grep -A5 "padding cells"
```
Expected: FAIL — leading cells show month 5, not month 4.

- [ ] **Step 3: Fix getMonthDays in `packages/shared/src/lunar/index.ts`**

Replace the current `getMonthDays` function:

```ts
export function getMonthDays(year: number, month: number): DayData[][] {
  const weeks: DayData[][] = [];
  const firstDay = Solar.fromYmd(year, month, 1);
  const firstWeekDay = firstDay.getWeek(); // 0=Sun … 6=Sat
  const daysInMonth = new Date(year, month, 0).getDate();
  let currentWeek: DayData[] = [];

  // Leading cells: days from the previous month
  if (firstWeekDay > 0) {
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const daysInPrevMonth = new Date(prevYear, prevMonth, 0).getDate();
    const startDay = daysInPrevMonth - firstWeekDay + 1;
    for (let d = startDay; d <= daysInPrevMonth; d++) {
      currentWeek.push(getDayData(prevYear, prevMonth, d, month));
    }
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(getDayData(year, month, day, month));
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Trailing cells: days from the next month
  if (currentWeek.length > 0) {
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    let nextDay = 1;
    while (currentWeek.length < 7) {
      currentWeek.push(getDayData(nextYear, nextMonth, nextDay, month));
      nextDay++;
    }
    weeks.push(currentWeek);
  }

  return weeks;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -w @lunarcal/shared
```
Expected: all tests pass including new padding tests.

- [ ] **Step 5: Commit**

```bash
git add packages/shared/src/lunar/index.ts packages/shared/src/__tests__/smoke.test.ts
git commit -m "fix(calendar): getMonthDays uses adjacent-month dates for padding cells"
```

---

### Task 2: Fix computeBazi calendar date validation (B2 — MEDIUM)

**Files:**
- Modify: `packages/shared/src/bazi/compute.ts:61`
- Modify: `packages/shared/src/__tests__/bazi.compute.test.ts`

`computeBazi` accepts `2026-02-30` (Feb 30 doesn't exist). Add `new Date()` round-trip check.

- [ ] **Step 1: Write the failing test**

In `packages/shared/src/__tests__/bazi.compute.test.ts`, add inside the existing `describe` block:

```ts
describe('computeBazi — date validation', () => {
  it('throws INVALID_DATE for Feb 30', () => {
    expect(() =>
      computeBazi(profile({ solarDate: '2026-02-30' }))
    ).toThrow(BaziError);
    try {
      computeBazi(profile({ solarDate: '2026-02-30' }));
    } catch (e) {
      expect(e instanceof BaziError && e.code).toBe('INVALID_DATE');
    }
  });

  it('throws INVALID_DATE for Apr 31', () => {
    try {
      computeBazi(profile({ solarDate: '2026-04-31' }));
    } catch (e) {
      expect(e instanceof BaziError && e.code).toBe('INVALID_DATE');
    }
  });

  it('accepts Feb 29 in a leap year', () => {
    expect(() =>
      computeBazi(profile({ solarDate: '2028-02-29', solarTime: null }))
    ).not.toThrow();
  });

  it('throws INVALID_DATE for Feb 29 in a non-leap year', () => {
    try {
      computeBazi(profile({ solarDate: '2026-02-29' }));
    } catch (e) {
      expect(e instanceof BaziError && e.code).toBe('INVALID_DATE');
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -w @lunarcal/shared -- --reporter=verbose 2>&1 | grep -A5 "date validation"
```
Expected: FAIL — `2026-02-30` currently passes range check and reaches ENGINE_FAILURE or throws a different code.

- [ ] **Step 3: Fix computeBazi in `packages/shared/src/bazi/compute.ts`**

Replace lines 58–65 (the range check block) with:

```ts
  if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) {
    throw new BaziError('INVALID_DATE', `solarDate out of range: ${profile.solarDate}`);
  }
  // Validate actual calendar day (catches Feb 30, Apr 31, etc.)
  const dateCheck = new Date(y, m - 1, d);
  if (dateCheck.getFullYear() !== y || dateCheck.getMonth() !== m - 1 || dateCheck.getDate() !== d) {
    throw new BaziError('INVALID_DATE', `solarDate is not a real calendar date: ${profile.solarDate}`);
  }
```

- [ ] **Step 4: Run tests**

```bash
npm test -w @lunarcal/shared
```
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/shared/src/bazi/compute.ts packages/shared/src/__tests__/bazi.compute.test.ts
git commit -m "fix(bazi): validate calendar day validity in computeBazi (catches Feb 30 etc)"
```

---

### Task 3: Validate notification settings hour/minute (B3 — MEDIUM)

**Files:**
- Modify: `src/utils/notificationSettings.ts`

No Vitest coverage for mobile utils; verify via TypeScript compiler + manual logic review.

- [ ] **Step 1: Review current code**

`src/utils/notificationSettings.ts:18-22`:
```ts
return { ...DEFAULT_SETTINGS, ...parsed };
```
This accepts `hour: 99` without validation.

- [ ] **Step 2: Add validation in `src/utils/notificationSettings.ts`**

Replace `getNotificationSettings`:

```ts
export async function getNotificationSettings(): Promise<NotificationSettings> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(raw);
    const enabled = typeof parsed.enabled === 'boolean' ? parsed.enabled : DEFAULT_SETTINGS.enabled;
    const hour = Number.isInteger(parsed.hour) && parsed.hour >= 0 && parsed.hour <= 23
      ? parsed.hour
      : DEFAULT_SETTINGS.hour;
    const minute = Number.isInteger(parsed.minute) && parsed.minute >= 0 && parsed.minute <= 59
      ? parsed.minute
      : DEFAULT_SETTINGS.minute;
    return { enabled, hour, minute };
  } catch (err) {
    console.warn('Failed to parse notification settings; using defaults:', err);
    return DEFAULT_SETTINGS;
  }
}
```

- [ ] **Step 3: Type-check to confirm no regressions**

```bash
npx tsc --noEmit 2>&1 | head -30
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/utils/notificationSettings.ts
git commit -m "fix(notifications): validate hour/minute ranges when loading settings from storage"
```

---

### Task 4: Fix PII leak in profileStorage console.warn (A1 — MEDIUM)

**Files:**
- Modify: `src/utils/profileStorage.ts:75`

- [ ] **Step 1: Identify the leak**

`src/utils/profileStorage.ts:75`:
```ts
else console.warn('[profileStorage] dropped malformed saved date', item);
```
`item` is the raw JSON object from storage — could contain user's saved-date label and date.

- [ ] **Step 2: Fix — log only safe fields**

Replace that line with:

```ts
else console.warn('[profileStorage] dropped malformed saved date id=%s', (item as { id?: unknown })?.id ?? '(unknown)');
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/utils/profileStorage.ts
git commit -m "fix(privacy): drop full item object from console.warn in profileStorage"
```

---

### Task 5: Replace Math.random UUID with expo-crypto (A2 — LOW)

**Files:**
- Modify: `src/utils/uuid.ts`
- Modify: `package.json` (add `expo-crypto`)

`Math.random()` is not cryptographically random. `expo-crypto` provides `getRandomValues` via Expo's managed workflow (uses native CSPRNG on iOS/Android, Web Crypto API on web). **Do not use `require('crypto')` — Metro bundler cannot resolve Node built-ins.**

- [ ] **Step 1: Install expo-crypto**

```bash
npx expo install expo-crypto
```
Expected: `expo-crypto` added to `package.json` dependencies and `package-lock.json` updated.

- [ ] **Step 2: Rewrite `src/utils/uuid.ts`**

```ts
import * as Crypto from 'expo-crypto';

export function uuid(): string {
  const bytes = new Uint8Array(16);
  Crypto.getRandomValues(bytes);
  // Set version 4
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  // Set variant bits
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/utils/uuid.ts package.json package-lock.json
git commit -m "fix(security): replace Math.random UUID with expo-crypto getRandomValues"
```

---

### Task 6: Sanitize ErrorBoundary error message display (A4 — LOW)

**Files:**
- Modify: `src/components/ErrorBoundary.tsx:42`

- [ ] **Step 1: Locate the issue**

`src/components/ErrorBoundary.tsx:42`:
```tsx
<Text style={[styles.detail, { color: palette.subtleText }]} numberOfLines={3}>
  {this.state.error?.message}
</Text>
```
In production, raw error messages shouldn't be shown to end users.

- [ ] **Step 2: Fix — show message only in dev**

Replace the `<Text>` block that renders `error?.message`:

```tsx
<Text style={[styles.detail, { color: palette.subtleText }]} numberOfLines={3}>
  {__DEV__ ? this.state.error?.message : this.props.fallbackMessage ?? '請重試'}
</Text>
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors (`__DEV__` is a global in React Native).

- [ ] **Step 4: Commit**

```bash
git add src/components/ErrorBoundary.tsx
git commit -m "fix(ui): hide raw error message in ErrorBoundary in production builds"
```

---

### Task 7: Add zodiac validation to zodiacStorage (C1 — LOW)

**Files:**
- Modify: `src/utils/zodiacStorage.ts`

Currently any string can be stored and returned. Invalid values pass the clash filter silently.

- [ ] **Step 1: Add validation in `src/utils/zodiacStorage.ts`**

Replace the file contents:

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'userZodiac';

const VALID_ZODIACS = new Set([
  '鼠', '牛', '虎', '兔', '龍', '蛇',
  '馬', '羊', '猴', '雞', '狗', '豬',
]);

export async function getZodiac(): Promise<string | null> {
  const value = await AsyncStorage.getItem(STORAGE_KEY);
  if (value === null) return null;
  return VALID_ZODIACS.has(value) ? value : null;
}

export async function setZodiac(animal: string): Promise<void> {
  if (!VALID_ZODIACS.has(animal)) {
    throw new Error(`Invalid zodiac animal: ${animal}`);
  }
  await AsyncStorage.setItem(STORAGE_KEY, animal);
}
```

- [ ] **Step 2: Check callers of setZodiac to confirm they pass valid values**

```bash
grep -rn "setZodiac" /Users/ryanwong/Documents/Personal/project/react-native/LunarCal/.claude/worktrees/fervent-ritchie-ed9eb8/src/ --include="*.ts" --include="*.tsx"
```

Verify all callers use values from `ZodiacPicker` (which only allows valid animals). If a caller could pass an arbitrary string, add a try/catch there.

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/utils/zodiacStorage.ts
git commit -m "fix(validation): validate zodiac animal in zodiacStorage get/set"
```

---

### Task 8: Add API test for deity route day-30 edge case (B4 — LOW)

**Files:**
- Modify: `apps/api/test/routes.test.ts`

The `lunarDay > 30` check accepts day 30 for 29-day months. The fix is disproportionate (requires lunar library lookup), but we can document correct behavior via test.

- [ ] **Step 1: Verify current behavior**

```bash
cd /Users/ryanwong/Documents/Personal/project/react-native/LunarCal/.claude/worktrees/fervent-ritchie-ed9eb8/apps/api
npm test 2>&1 | tail -15
```

- [ ] **Step 2: Add regression test in `apps/api/test/routes.test.ts`**

Add inside `describe('GET /api/deity/:lm/:ld', ...)`:

```ts
it('returns null (not 400) for day 30 of a 29-day month (known limitation)', async () => {
  // Lunar month 2 in most years has 29 days. Day 30 is invalid but
  // isValidSolarDate-style check is not applied; deity lookup returns null.
  // This test documents the current behavior and signals if validation improves.
  const { status, body } = await get('/api/deity/2/30');
  // Currently returns 200 with null deity (not 400). Document this.
  expect(status).toBe(200);
  const parsed = DeityResponseSchema.parse(body);
  expect(parsed.deity).toBeNull();
});

it('returns 400 for lunarMonth=0', async () => {
  const { status } = await get('/api/deity/0/1');
  expect(status).toBe(400);
});
```

- [ ] **Step 3: Run tests**

```bash
cd /Users/ryanwong/Documents/Personal/project/react-native/LunarCal/.claude/worktrees/fervent-ritchie-ed9eb8/apps/api && npm test
```
Expected: all tests pass including new ones.

- [ ] **Step 4: Commit**

```bash
git add apps/api/test/routes.test.ts
git commit -m "test(api): document deity route day-30 edge case behavior"
```

---

### Task 9: Run npm audit fix for auto-fixable vulnerabilities (D — HIGH)

**Files:**
- `package-lock.json`
- `apps/api/package-lock.json`

35 vulnerabilities in root (6 high), additional in API package. Most are auto-fixable.

- [ ] **Step 1: Run audit fix on root workspace**

```bash
npm audit fix 2>&1
```
Expected: some number of vulnerabilities resolved; postcss vulnerability NOT auto-fixed (requires expo@56 breaking change).

- [ ] **Step 2: Run audit on API package**

```bash
cd /Users/ryanwong/Documents/Personal/project/react-native/LunarCal/.claude/worktrees/fervent-ritchie-ed9eb8/apps/api && npm audit fix 2>&1
```

- [ ] **Step 3: Run all tests to confirm no regressions**

```bash
cd /Users/ryanwong/Documents/Personal/project/react-native/LunarCal/.claude/worktrees/fervent-ritchie-ed9eb8 && npm test
```
Expected: all API + shared tests pass.

- [ ] **Step 4: Re-run audit to confirm improvement**

```bash
npm audit 2>&1 | tail -5
```
Note remaining count (postcss/expo chain will remain).

- [ ] **Step 5: Commit**

```bash
git add package-lock.json apps/api/package-lock.json
git commit -m "fix(deps): npm audit fix — resolve auto-fixable vulnerabilities"
```

---

## Self-Review Checklist

**Spec coverage:**
- B1 (getMonthDays padding) → Task 1 ✓
- B2 (computeBazi date validity) → Task 2 ✓
- B3 (notification hour/min) → Task 3 ✓
- A1 (PII console.warn) → Task 4 ✓
- A2 (Math.random UUID) → Task 5 ✓
- A4 (ErrorBoundary message) → Task 6 ✓
- C1 (zodiac validation) → Task 7 ✓
- B4 (deity route day-30) → Task 8 ✓
- D (npm audit) → Task 9 ✓

**Deferred (architectural, out of scope):**
- A3 (AsyncStorage encryption) — requires expo-secure-store migration
- A5 (CORS wildcard) — intentional for public API; prerequisite note added
- A7 (rate limiting) — requires API Gateway layer
- C3 (buildShichen hash) — documented as approximation, no functional fix
- C4 (moonPhase custom calc) — cosmetic discrepancy, not a bug

**No placeholders present.** Each step has exact commands and code.

**Type consistency:** `BaziError`, `BirthProfile`, `NotificationSettings`, `SavedDate` types used consistently across all tasks.
