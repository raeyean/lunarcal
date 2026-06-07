# LunarCal — Next Phase Candidates

**Last updated:** 2026-05-23
**Status:** backlog / planning reference

This document captures candidate phases for LunarCal after the **Bazi Profile + "Me" tab** phase shipped (merged to `main`, commit `f73599e`). Each entry is detailed enough to start a `brainstorming → writing-plans → subagent-driven-development` cycle without re-deriving context.

Effort key: **S** ≈ 1–2 days · **M** ≈ 3–5 days · **L** ≈ 1–2 weeks.

---

## 1. Share Card (design-ready, deferred from Bazi phase)

**Priority:** High — most-requested social loop, design already validated.
**Effort:** S–M
**Status:** Designed + mocked during the Bazi brainstorm, then cut to keep that phase focused. Mockup lives in `.superpowers/brainstorm/lunarcal-layouts.html` (share-card preview at bottom).

### Goal
Let a user share any day as a polished image card via the OS share sheet (Messages, WhatsApp, IG, Threads, etc.). Drives organic growth.

### Scope (in)
- Share button on `DailyDetailScreen` header.
- Offscreen-rendered card → captured to PNG → native share sheet.
- Card content:
  - Day Ganzhi hero (e.g. 壬戌日)
  - Lunar date subtitle (丙寅年 辛卯月 · 農曆二月廿三)
  - Top Yi/Ji items (宜 簽約·會親友·祭祀 / 忌 動土·安葬)
  - **Optional** personal compat line (★★★★☆ · 日柱相合) — only when a `BirthProfile` exists (reuses `computeCompat` from `@lunarcal/shared/bazi`)
  - App branding footer
- Warm gradient styling matching app palette (`colors.primary` #f04324), light/dark aware.

### Scope (out)
- Sharing saved dates from the Me tab (could be a fast follow — same `shareDay` fn).
- Custom card themes / templates.
- Server-side OG-image generation.

### Tech
- `react-native-view-shot` — capture an offscreen `<View>` to PNG.
- `expo-sharing` — `shareAsync(uri)` opens native share sheet.
- New files:
  - `src/components/ShareCard.tsx` — the offscreen render target (absolute-positioned offscreen or `collapsable={false}` ref).
  - `src/utils/shareDay.ts` — `shareDay(year, month, day, profile?)`: builds day data via `getDayData`, renders ShareCard, captures, shares.
- Reuses: `getDayData` (lunar), `computeBazi`/`computeCompat` (bazi), `useTheme`.

### Dependencies / risks
- **Expo Go caveat:** `react-native-view-shot` is a native module — same Expo-Go-vs-dev-build issue we hit with `expo-crypto`. Either build a dev client or guard the share button when the native module is absent. Document clearly.
- Font embedding in captured image — confirm Outfit/Inter render in the snapshot (view-shot uses the live view, so should be fine if fonts are loaded).
- Image dimensions / DPI — render at 2–3x for crisp output.

### Open questions
- Watermark/branding always on, or toggle in settings?
- Include a QR / deep link back to the app on the card? (ties into candidate #6)

---

## 2. Saved-Date Reminders (extends shipped saved-dates)

**Priority:** High — saved dates already exist; reminders make them sticky.
**Effort:** M
**Status:** Saved-dates CRUD shipped in Bazi phase. Reminders not started. App already has `expo-notifications` wired for 初一/十五 lunar notifications — infrastructure exists.

### Goal
Let users get a push notification ahead of a saved date (e.g. "婚禮 in 3 days · 今日宜 嫁娶").

### Scope (in)
- Per-saved-date reminder toggle + lead-time picker (same day / 1 day / 3 days / 1 week before).
- Schedule local notifications via existing `expo-notifications` setup.
- Notification body includes the date's Yi/Ji or compat score.
- Reschedule on add/edit/delete of saved dates; reconcile on app resume.

### Scope (out)
- Recurring reminders (annual anniversaries) — could be fast follow.
- Server push (local notifications only, matches current privacy stance).

### Tech
- Extend `SavedDate` type: add `reminderLeadDays: number | null`.
- New `src/utils/savedDateNotifications.ts` mirroring `lunarNotifications.ts`.
- Bump `BirthProfile`/`SavedDate` schema `version` for migration (already have the `version` anchor).
- UI: add reminder row to `SavedDateForm`.

### Dependencies / risks
- Android battery optimisation can kill scheduled notifications (known gap — foreground reconcile on AppState already in place for lunar notifications; reuse the pattern).
- Notification permission already requested for lunar 初一/十五 — reuse, don't re-prompt.

### Open questions
- Default lead time?
- Annual recurrence for birthdays/anniversaries in v1 or v2?

---

## 3. Hourly Shichen (時辰) Depth

**Priority:** Medium — deepens the core almanac value prop.
**Effort:** M
**Status:** `ShichenSheet` component + `day.shichen` data already exist (lucky-hours strip on Daily). This expands it into a full hourly view.

### Goal
Full 12 two-hour-block (時辰) breakdown for a day: each shichen's auspicious/inauspicious activities, lucky direction, clash.

### Scope (in)
- Dedicated Shichen detail screen or expanded sheet.
- Per-shichen: 吉/凶 rating, recommended activities, 沖煞, lucky direction.
- Optional: personal compat per shichen if Bazi profile exists (hour-pillar vs current).
- "Best hour today" highlight.

### Scope (out)
- Hour-by-hour push notifications.

### Tech
- `lunar-javascript` already exposes per-時辰 data (`Lunar.getTimeGanZhi`, shichen 吉凶). Extend `@lunarcal/shared/lunar` wrapper.
- Reuse `ShichenSheet`; may promote to a screen.

### Open questions
- Standalone screen vs expanded bottom sheet?
- How much detail before it overwhelms casual users?

---

## 4. AI Chat for Cultural Meanings

**Priority:** Medium — high "wow", higher cost + complexity.
**Effort:** L
**Status:** Not started. Net-new subsystem.

### Goal
Conversational assistant that explains almanac concepts in plain language: "為什麼今天忌動土?", "什麼是日柱相沖?", "我的八字適合什麼工作?".

### Scope (in)
- Chat UI (new tab or modal).
- Backend route on existing Hono API (`apps/api`) proxying to an LLM (Claude API).
- Context injection: current day data, user Bazi profile (with explicit consent — breaks the local-only privacy stance, must be opt-in).
- Guardrails: scope to almanac/cultural topics, disclaimer it's not professional fortune-telling.

### Scope (out)
- Persistent chat history sync.
- Voice.

### Tech
- New Hono route `apps/api/src/routes/chat.ts` (streaming).
- Claude API via Anthropic SDK (use the `claude-api` skill for caching + setup).
- Mobile: streaming chat client + UI.
- Zod schemas in `packages/shared/src/schemas/chat.ts`.

### Dependencies / risks
- **Privacy:** sending Bazi/birth data to a server breaks the current local-only contract. Must be explicit opt-in with clear copy. Big product decision.
- **Cost:** per-message LLM cost — consider caching common questions, rate limits.
- Prompt-injection / off-topic abuse handling.

### Open questions
- Free tier limits? Monetisation?
- How much user data to include in context, and how to make consent legible?

---

## 5. Platform Polish (web desktop · i18n · a11y · perf)

**Priority:** Medium — broadens reach, no new core features.
**Effort:** M–L (can be split per axis)
**Status:** Known gaps documented in CLAUDE.md. Each axis is independent — could be 3–4 small phases.

### Axes
- **Web desktop layout** — app is portrait-optimised; not responsive for desktop widths. Add breakpoints, max-width container, multi-column where it helps.
- **i18n** — currently zh-Hant only. Add English + Simplified Chinese. The Bazi compat reasons already isolate locale strings (`compatReasons.zh-Hant.ts`) — establish the same pattern app-wide. Pick an i18n lib (i18next / expo-localization).
- **Accessibility sweep** — extend the per-component a11y work (roles, labels, contrast) across older screens (Calendar, Settings).
- **Performance** — profile calendar grid + day swipes; memoise hot paths (already did `computeBazi` hoist); check re-render counts.

### Tech
- i18n: `expo-localization` + `i18next` or lightweight custom. Extract all hardcoded zh-Hant strings to message catalogs.
- Web: responsive styles, test in `npm run web`.

### Open questions
- Which locales first — EN or Simplified?
- Is web a real target or iOS/Android first?

---

## 6. Deep Links + Home Screen Widgets

**Priority:** Medium-low — nice retention/engagement, platform-specific work.
**Effort:** M (deep links) + L (native widgets)
**Status:** Not started.

### Goal
- Deep link `lunarcal://date/2026-05-17` opens a specific day. Enables share-card links (ties to #1) and notification taps landing on the right day.
- iOS/Android home-screen widget showing today's Ganzhi + Yi/Ji at a glance.

### Scope (in)
- Expo Router or `Linking` config for deep links.
- Widget: iOS WidgetKit / Android App Widget — requires native code (config plugin or dev build; not Expo Go).

### Tech
- Deep links: `expo-linking` + URL scheme in `app.json` (scheme likely already set).
- Widgets: `@bittingz/expo-widgets` or hand-rolled config plugin + native widget code. Heavy.

### Dependencies / risks
- Widgets need a dev/standalone build and native maintenance per platform.
- Navigation model is currently prop-driven (no nav library) — deep links may justify adopting Expo Router.

### Open questions
- Adopt Expo Router now (bigger refactor) or bolt on `Linking` handlers?
- Widget worth the native maintenance cost?

---

## 7. Bazi Cloud Sync + Accounts

**Priority:** Low (for now) — only once there's data worth syncing across devices.
**Effort:** L
**Status:** Designed-around in the Bazi phase — `BirthProfile` has a `version` field and storage is abstracted behind `profileStorage.ts`, so a sync layer can slot in without rewriting consumers.

### Goal
Optional account login to sync birth profile + saved dates across devices.

### Scope (in)
- Firebase Auth (project already on Firebase Functions Gen 2).
- Sync `birthProfile` + `savedDates` to Firestore per user.
- Conflict resolution (last-write-wins or merge).
- Stays opt-in; local-only remains the default.

### Tech
- Firebase Auth + Firestore.
- Sync adapter behind existing `profileStorage` interface.

### Dependencies / risks
- **Privacy:** breaks local-only default — must be explicit opt-in (same concern as #4).
- Auth UX, account recovery, GDPR/data-deletion obligations.

### Open questions
- Is cross-device demand real yet? Probably wait for user signal.

---

## 8. Quality Infrastructure (mobile tests · CI · monitoring)

**Priority:** Medium — pays compound interest, invisible to users.
**Effort:** M
**Status:** `@lunarcal/shared` + `apps/api` have Vitest. Mobile UI has **no** test runner — screens rely on manual QA (as just done for the Bazi phase).

### Scope (in)
- Mobile component tests: Jest + React Native Testing Library for pure-ish components (CompatStrip, BaziChart, forms).
- E2E smoke: Detox or Maestro for critical flows (create profile → see chart, add saved date).
- CI pipeline (GitHub Actions): run all workspace tests + typecheck + lint on PR.
- Error monitoring: Sentry (catch the kind of runtime crashes we hit manually — expo-crypto, etc.).

### Tech
- Jest + `@testing-library/react-native`.
- Maestro (lighter than Detox) for E2E.
- `@sentry/react-native`.
- GitHub Actions workflow.

### Dependencies / risks
- RN test setup has sharp edges (mocking native modules, fonts, AsyncStorage).
- CI minutes / cost.

### Open questions
- Detox vs Maestro?
- Gate merges on CI or advisory only?

---

## Quick Prioritisation Snapshot

| # | Candidate | Priority | Effort | Notes |
|---|-----------|----------|--------|-------|
| 1 | Share Card | High | S–M | Design-ready, growth loop, needs dev build for view-shot |
| 2 | Saved-Date Reminders | High | M | Builds on shipped saved-dates + existing notifications |
| 3 | Shichen Depth | Medium | M | Deepens core almanac, data already available |
| 8 | Quality Infra | Medium | M | Compound value; mobile has zero UI tests today |
| 5 | Platform Polish | Medium | M–L | Splittable per axis (web / i18n / a11y / perf) |
| 4 | AI Chat | Medium | L | High wow, privacy + cost decisions required |
| 6 | Deep Links + Widgets | Med-low | M+L | Deep links cheap; widgets expensive native work |
| 7 | Cloud Sync + Accounts | Low | L | Wait for cross-device demand signal |

**Suggested next:** #1 Share Card (fast, design-ready, growth) or #2 Reminders (leverages just-shipped saved dates). Pair well — share + reminders both make the Me tab stickier.

---

## How to start a phase from this doc

1. `superpowers:brainstorming` — refine the chosen candidate's open questions into a design.
2. `superpowers:writing-plans` — turn the design into a task-by-task plan under `docs/superpowers/plans/`.
3. `superpowers:subagent-driven-development` — execute with per-task spec + code-quality review.
4. Manual sim QA pass (per-item checklist), then merge + push.
