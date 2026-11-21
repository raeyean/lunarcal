# 1. The watch computes the almanac on-device from a Swift port of lunar-javascript

Date: 2026-11-21
Status: Accepted
Issue: #41 (follow-up to #16)

## Context

The phone app computes every almanac value, including Month Pillar and Yi / Ji (宜/忌), with lunar-javascript. The iOS widget gets the same values because the app writes them into the shared App Group. The widget's own Swift engine (`targets/shared/LunarCalculator.swift`) is only a fallback for the window before the app first runs.

The watchOS app (#16) can't read that App Group. Its only link to the phone is WatchConnectivity, which needs the phone app to have run and to be reachable. So the watch always fell back to the Swift engine, whose 宜/忌 came from a placeholder table keyed only on the day's heavenly stem. Every day disagreed with the phone.

## Decision

The watch computes the almanac on-device. The Swift engine ports lunar-javascript's 宜/忌 derivation (`LunarUtil.getDayYi` / `getDayJi`) along with its rule data, rather than receiving computed days from the phone.

- `scripts/verify-swift-almanac/generate-data.js` generates the rule data (`DAY_YI_JI`, `YI_JI`) and the Sectional Term dates from the installed lunar-javascript into `targets/shared/AlmanacData.swift`, unchanged. Strings stay as lunar-javascript returns them (simplified), so the watch and the phone always show identical 宜/忌 (#42 tracks showing them in traditional characters).
- Month Pillars, and so 宜/忌, are computed only within the generated Sectional Term table (2020–2060). Outside it the engine returns no 宜/忌 and the UI hides them rather than guess.

## Alternatives considered

- **Push computed days from the phone over WatchConnectivity.** This keeps a single engine. But the watch shows nothing useful until the phone app has run and synced, the data goes stale while the phone is away, and the crown's ±7-day window needs a rolling sync.
- **Hide 宜/忌 on the watch.** Simple, but it drops one of the glance view's three main facts.

## Consequences

- The watch works offline and on first launch, with no dependency on the phone.
- There are now two engines that must agree. `scripts/verify-swift-almanac/verify.sh` compares Month Pillar, 宜 and 忌 for every day from 2020 to 2060 and must report 0 mismatches. Rerun `generate-data.js` and `verify.sh` after any lunar-javascript upgrade.
- About 35 KB of generated data ships in the widget and the watch app.
- The table ends in 2060. Extending it means changing `LAST_YEAR` in the generator and regenerating.

## Update (2026-11-21, #42 / #45)

The phone now shows Activity names in traditional characters through a shared table (`activityNamesTraditional.json` in `@lunarcal/shared`). The generator applies the same table, so the watch still shows exactly the phone's strings, now in traditional characters. The verify script compares against the converted names.
