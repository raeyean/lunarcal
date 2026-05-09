# UI/UX Audit — Follow-Up Backlog

Items deferred from the 2026-05-07 audit. Audit closed P0+P1 (crash, safe area, scroll indicator, touch targets, error UI) plus four P2 wins (WeekHeader a11y, CompassRose a11y, legend persistence, DailyDetail safe-area padding). What's below is the parking lot — none are bugs, none block users, all worth picking up when the schedule allows.

---

## A. Cleanup Sweeps (low ROI individually, worth batching)

### A1. Hardcoded `fontSize` → `Typography` constants
~15 components hardcode `fontSize` instead of using a `Typography.*` preset. Some sizes don't have an exact preset and would need a new one added.

Affected files:
- [src/components/EditorialDaily.tsx](src/components/EditorialDaily.tsx) — `fontSize: 76, 28, 11, 9` (display, heading, badge, caption sizes)
- [src/components/ShichenSheet.tsx](src/components/ShichenSheet.tsx) — 5 hardcoded
- [src/components/BottomPanel.tsx](src/components/BottomPanel.tsx) — multiple
- [src/components/TongshuSection.tsx](src/components/TongshuSection.tsx) — several
- [src/components/AuspiciousResultCard.tsx](src/components/AuspiciousResultCard.tsx) — 4
- [src/components/DeityCard.tsx](src/components/DeityCard.tsx) — 5
- [src/components/GanzhiHero.tsx](src/components/GanzhiHero.tsx) — 3
- [src/components/SettingsModal.tsx](src/components/SettingsModal.tsx) — 4
- [src/components/Moon.tsx](src/components/Moon.tsx) — 1 (SVG `fontSize`)
- [src/components/CompassRose.tsx](src/components/CompassRose.tsx) — 1 (SVG `fontSize`, geometric)
- [App.tsx](App.tsx) — `themeIcon: { fontSize: 20 }` (one-off icon size)

**Approach when ready:** audit each unique fontSize across the codebase; merge near-duplicates; add 2-3 new presets if needed (e.g. `displayHero` for 76px, `iconGlyph` for 20px); migrate all callers in one PR.

### A2. Hardcoded `lineHeight` and `letterSpacing` magic values
- LineHeights `20, 22, 24` appear inline rather than from `Typography.*`.
- LetterSpacing values `1.2, 1.5, 1.6, 2` appear as magic numbers.

Add to `Typography` presets where they cluster.

### A3. Mixed `Spacing.*` vs raw px in component styles
~10 components mix `Spacing.*` constants with raw pixel values in the same StyleSheet.

Worst offenders:
- [src/components/ClashInfo.tsx](src/components/ClashInfo.tsx) — `paddingVertical: 6` next to `paddingHorizontal: Spacing.md`
- [src/components/DeityCard.tsx](src/components/DeityCard.tsx) — `Spacing.md, Spacing.xs` mixed with `marginTop: 3, 2`, `width: 48`, `borderRadius: 24`
- [src/components/HelpIcon.tsx](src/components/HelpIcon.tsx) — inline style calculations + hardcoded `fontWeight: '700'` fallback
- [src/components/CalendarCell.tsx](src/components/CalendarCell.tsx) — absolute positions `top: 4, left: 6, right: 4, width: 5, height: 5, borderRadius: 3` (deity dot)

**Note:** some raw values are geometric (deity dot positions, SVG radii, calendar-cell layout). Don't force these into `Spacing` — they're not spacing tokens.

### A4. Add missing palette tokens

Currently no `colors.white` was problematic — already added at [colors.ts:50](src/constants/colors.ts). Other gaps surfaced by the audit:

- [src/components/DeityCard.tsx](src/components/DeityCard.tsx) — `'#fff'` hardcoded for badge → use `colors.white`
- No celestial/moon-specific tokens; Moon uses its own internal hex set (intentional, see B1)

---

## B. Intentional Skips (do NOT change without re-design)

### B1. `Moon.tsx` `theme` prop is **not** a theme bug
Caller pattern proves intent:
- [EditorialDaily.tsx:60](src/components/EditorialDaily.tsx) — `theme={isDark ? 'dark' : 'light'}` (matches global theme)
- [CalendarCell.tsx:90](src/components/CalendarCell.tsx) — `theme={isActive || isDark ? 'dark' : 'light'}` (**inverts** for contrast on active vermilion background)

The `theme` prop is a contrast-inversion API, not a global-theme bridge. Replacing it with `useTheme()` would break the active-cell case.

If you want to clean it up later: rename the prop to `appearance` or `surface` to make the contrast-inversion intent explicit, but keep the API.

### B2. `AuspiciousFinderScreen` `paddingBottom: 80 + insets.bottom`
The 80 is the sticky-footer height. Replacing with `onLayout`-measured height is more correct but adds layout-thrash risk and async state for marginal benefit. Current value works on every form factor tested.

### B3. `ShichenSheet` luck chip `minWidth: 36`
The chip is a decorative badge inside an already-tappable row, not an isolated control. iOS 44pt rule applies to the row, not the chip.

---

## C. Feature Work (not bugs — separate planning needed)

### C1. Toast / snackbar for async operations
AsyncStorage writes (theme change, notification time, zodiac selection) succeed silently. A 1.5s toast confirming "已儲存" would close the loop.

### C2. Haptic feedback on swipe threshold
[useSwipeGesture.ts](src/hooks/useSwipeGesture.ts) currently has no haptic feedback when the swipe threshold is crossed. Native iOS/Android calendars buzz lightly — would feel premium.

Implementation: `expo-haptics` `impactAsync(Light)` at the threshold-cross line.

### C3. Glossary search
[GlossarySheet.tsx](src/components/GlossarySheet.tsx) has 67 activity entries — currently scroll-only. Search box at top would help when looking up a specific 宜/忌 term.

### C4. Date range selection in Auspicious Finder
Today the finder takes a number of days from "now". Real-world use case: planning a wedding 3 months out → user wants `2026-08-01 to 2026-08-31`. Add an explicit "from / to" picker mode.

### C5. Deep linking
No URL handling. Use case: share `lunarcal://daily/2026-08-15` from a friend → opens that day's detail. Useful for sharing auspicious dates.

### C6. Notification permission denial recovery
[lunarNotifications.ts](src/utils/lunarNotifications.ts) prompts and handles denial with an `Alert`, but offers no path back. If denied, surface a persistent banner in `SettingsModal` with a "Open System Settings" button.

### C7. Web layout for desktop/tablet
Per [CLAUDE.md](CLAUDE.md), web layout is portrait-optimised. Needs a max-width container + responsive font sizing + landscape-aware nav for desktop browsers.

### C8. No test runner
Jest/Detox not set up. Lunar utility functions ([src/utils/lunar.ts](src/utils/lunar.ts), [src/utils/auspiciousScan.ts](src/utils/auspiciousScan.ts)) are pure and would benefit most from unit tests.

---

## D. Architecture Concerns (revisit when scaling)

### D1. Three-panel rendering memory cost
Both [CalendarScreen.tsx](src/screens/CalendarScreen.tsx) and [DailyDetailScreen.tsx](src/screens/DailyDetailScreen.tsx) render `prev / current / next` panels off-screen for swipe smoothness. On long sessions with many month/day transitions, this could leak memory if any child component holds references.

Investigate: profile with React DevTools, confirm panels unmount cleanly. Consider `removeClippedSubviews` on the wrapping `Animated.View`.

### D2. Calendar cell touch target audit
Suspected sub-44pt cells when month grid is rendered on small phones (iPhone SE 2nd gen). Verify with rulers in sim. If cells dip below 44pt, add `minHeight: 44` to `CalendarCell`.

---

## E. Manual Verification Still Owed (from audit plan)

These were not run during the audit fix session — owner should run on a sim before declaring done.

1. iPhone 14/15 Pro sim — FAB sits above home indicator
2. Daily Detail scroll → vertical scroll thumb appears
3. ActivityPicker chips visibly ≥44pt; rapid taps don't cross-fire
4. Range chips visibly ≥44pt
5. Inject `throw new Error('test')` at top of `scanChunk` in [src/utils/auspiciousScan.ts](src/utils/auspiciousScan.ts) → confirm `搜索失敗` block + retry button → remove throw
6. After error, retry → results render → `修改` → re-search → no stale error state
7. Existing empty state (`找不到吉日`) still appears for legitimate zero-result searches
8. VoiceOver: WeekHeader reads `星期日` etc.; CompassRose reads direction summary
9. Kill app + reopen → calendar legend stays in last expanded/collapsed state

---

_Last updated: 2026-05-07 by audit fix session._
