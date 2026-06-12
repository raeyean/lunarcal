# watchOS App — Design Spec

**Date:** 2026-06-12
**Status:** Approved (user reviewed design + visual mockups)

## Goal

Native watchOS companion app for LunarCal: glance-first view of today's lunar
data, crown-scrollable to nearby days, personalised zodiac-clash warning synced
from the phone app.

## Scope (v1)

**In:**
- Single glance screen: solar date, lunar date (大字), Ganzhi line (年/月/日),
  top-3 宜 chips, top-3 忌 chips, clash footer (沖X(干支) 煞方)
- Crown/swipe vertical paging: today ±7 days, relative-day header label
  (今天/明天/昨天/MM月DD日), page-position dots
- Zodiac sync phone → watch; when user zodiac matches day's clash animal,
  clash footer is replaced by a warning card (今日沖X — 你屬X)
- Fully offline: all lunar data computed on-watch in Swift

**Out (explicit non-goals, future phases):**
- Watch-face complications
- Month browse, auspicious finder, notifications on watch
- Theme sync (watch is always dark, watchOS convention)

## Architecture

- **Target:** single-target watchOS SwiftUI app `LunarCalWatch`
  (watchOS 10+ deployment — `.verticalPage` crown paging requires 10; same
  hardware coverage as 9, Series 4+ — no separate WatchKit extension).
  Bundle ID `com.raeyean.LunarCal.watchkitapp`; Info.plist
  `WKCompanionAppBundleIdentifier = com.raeyean.LunarCal`,
  `WKApplication = true`.
- **Integration:** new config plugin `plugins/withWatch.js`, mirroring the
  proven `plugins/withWidget.js` pattern — copies `targets/watch/` sources
  into the prebuilt iOS project, adds the `watchapp` product-type target,
  wires Sources/Frameworks/Resources build phases, adds an
  "Embed Watch Content" copy phase to the iPhone app target, sets signing.
  Must survive `npx expo prebuild -p ios --clean`.
- **Shared lunar engine:** move `targets/widget/LunarCalculator.swift` to
  `targets/shared/LunarCalculator.swift`. Both `withWidget.js` and
  `withWatch.js` compile it into their respective targets. One source of
  truth; no duplication. The calculator already provides everything the
  watch needs (lunar date, Ganzhi, Yi/Ji, clash, sha, nayin, jieqi).
- **No React Native on watch.** All watch code is native SwiftUI.

## Components

| Unit | Purpose |
|------|---------|
| `targets/watch/LunarCalWatchApp.swift` | `@main` SwiftUI App entry |
| `targets/watch/DayPagerView.swift` | Vertical `TabView` pager, `.digitalCrownRotation`, today ±7 |
| `targets/watch/GlanceView.swift` | One day's screen: dates, Ganzhi, 宜/忌 chips, clash footer / warning card |
| `targets/watch/ConnectivityManager.swift` | `WCSessionDelegate`; receives `applicationContext["zodiac"]`, persists to `UserDefaults` |
| `targets/watch/Info.plist`, `.entitlements` | Watch app config |
| `targets/shared/LunarCalculator.swift` | Shared Swift lunar engine (moved from widget) |
| `modules/watch-sync/` | Local Expo module (Swift): wraps `WCSession.default.updateApplicationContext` |
| `src/utils/zodiacStorage.ts` | On zodiac write, also call watch-sync module (no-op on Android/Web) |
| `plugins/withWatch.js` | Config plugin injecting the watch target at prebuild |

## Data flow

1. Watch renders a date → `LunarCalculator.calculate(y,m,d)` locally.
   Offline, deterministic, instant.
2. User picks zodiac on phone → `zodiacStorage` writes AsyncStorage **and**
   calls watch-sync module → `updateApplicationContext(["zodiac": "豬"])`.
   Latest-value semantics; watchOS delivers when reachable, persists across
   launches.
3. Watch `ConnectivityManager` stores zodiac in `UserDefaults`; `GlanceView`
   reads it to decide clash-warning rendering.

## Error handling

- No network paths exist.
- `WCSession.isSupported() == false` / not paired / watch app not installed →
  phone module no-ops silently.
- Zodiac never synced → watch shows generic clash footer (still fully
  functional).
- Android/Web: watch-sync module absent → TS guard skips call (same pattern
  as existing expo-crypto fallback).

## Visual design (mockups approved 2026-06-12)

- Always-dark UI, app primary `#f04324` for accents (solar-date header,
  crown highlight, active page dot)
- 宜 chip green / 忌 chip coral, echoing phone app's Yi/Ji cards
- Clash warning card: dark red fill, `#f04324` border, ⚠ 今日沖X — 你屬X +
  諸事不宜 subtitle
- Traditional Chinese throughout (matches phone app)

## Testing / verification

- **Prebuild idempotency:** run `npx expo prebuild -p ios --clean` twice;
  watch target intact both times, project builds.
- **Manual sim QA:** paired iPhone+Watch simulators — glance renders correct
  data (cross-check against phone app for same date), crown paging works at
  ±7 bounds, zodiac round-trip (pick on phone → warning appears on watch).
- **EAS build:** verify managed credentials mint a provisioning profile for
  the watch bundle ID. **Biggest external risk — validate early** (Phase 1
  spike, before UI work).
- Swift calculator unchanged (already trusted from widget); move is
  compile-into-both, not a rewrite.

## Risks

1. **EAS multi-target credentials for watch** — validate with a skeleton
   watch target build before investing in UI.
2. **`xcode` npm lib watch-target support** — `watchapp2` product type and
   Embed Watch Content phase need hand-wiring in the plugin; budget ~1 day.
3. **WCSession timing** — applicationContext can lag; acceptable because
   zodiac changes are rare and latest-value semantics self-heal.
