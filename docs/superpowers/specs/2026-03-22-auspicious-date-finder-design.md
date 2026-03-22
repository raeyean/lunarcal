# Auspicious Date Finder — Design Spec

## Overview

A dedicated screen allowing users to find upcoming auspicious dates for a specific activity (e.g., 嫁娶, 搬家, 開市), filtering out days that clash with their zodiac animal. Accessible via a header icon from the main app view.

## User Flow

1. User taps a compass/search icon in the app header bar
2. `AuspiciousFinderScreen` opens as a full-screen overlay with back navigation
3. User selects an activity from curated categories
4. User selects their zodiac animal (persisted across sessions via AsyncStorage)
5. User selects a scan range (30 / 60 / 90 / 180 days)
6. User taps "Search"
7. Results load in 30-day chunks with automatic pagination on scroll
8. User taps a result card → finder dismisses and Daily Detail navigates to that date

## Navigation

- **Entry point**: Header icon in `App.tsx`, placed next to the existing settings gear icon
- **Screen pattern**: Full-screen overlay rendered conditionally (same pattern as `SettingsModal` — no routing library)
- **Back button**: Top-left arrow dismisses the screen
- **Result tap**: Calls a callback that sets `year`, `month`, `day` state in `App.tsx`, switches to Daily Detail view, and dismisses the finder

## Activity Picker

Activities are grouped into curated categories. Each category is a collapsible row; tapping expands to show activities as chips. User selects exactly one activity.

| Category | Label | Activities |
|----------|-------|-----------|
| Life Events | 人生大事 | 嫁娶, 納采, 訂盟, 冠笄 |
| Home | 居家 | 搬家, 入宅, 修造, 動土, 安床, 安門 |
| Business | 商業 | 開市, 交易, 立券, 掛匾, 開倉 |
| Construction | 建築 | 上樑, 豎柱, 破土, 起基, 造屋 |
| Travel | 出行 | 出行, 移徙, 赴任 |
| Spiritual | 祭祀 | 祭祀, 祈福, 求嗣, 齋醮, 開光 |
| Burial | 喪葬 | 安葬, 啟鑽, 除服, 成服 |
| Agriculture | 農牧 | 栽種, 牧養, 納畜, 伐木 |

A "Show all" option at the bottom displays the complete uncategorized list for edge cases where an activity doesn't appear in the curated groups.

## Zodiac Picker

- A 4x3 grid of the 12 zodiac animals with emoji and Chinese label
- Animals: 鼠🐀, 牛🐂, 虎🐅, 兔🐇, 龍🐉, 蛇🐍, 馬🐴, 羊🐏, 猴🐒, 雞🐓, 狗🐕, 豬🐖
- Selected zodiac is persisted in AsyncStorage and pre-loaded on screen open
- User can change selection at any time

## Range Selector

Segmented control with four options: **30 / 60 / 90 / 180** days from today. Default: 90 days.

## Scan Engine

### Algorithm

1. Start from today's date
2. Iterate day-by-day in 30-day chunks
3. For each day, call `getDayData(year, month, day)`
4. **Include** if the selected activity appears in `dayData.yi`
5. **Exclude** if the day's clash animal matches the user's zodiac. Note: `dayData.clash.animal` is formatted as `"沖馬 (壬午)"`, so the scan engine should call `lunar.getDayChongShengXiao()` directly to get the bare animal name (e.g., `"馬"`) for matching
6. Collect matching dates with metadata into results array
7. When user scrolls near bottom, scan next 30-day chunk (up to range limit)

### Data Shape

```typescript
interface AuspiciousResult {
  date: { year: number; month: number; day: number }
  lunarDate: string        // e.g., "三月初五"
  ganzhiDay: string        // e.g., "甲子"
  weekDay: number          // 0-6
  yi: string[]             // full 宜 list for context
  ji: string[]             // full 忌 list for context
  tianShen: string          // deity name (e.g., "天德")
  tianShenType: string     // 吉/凶
}
```

### Chunked Loading

- Scan function accepts `startDate`, `chunkSize` (30), and `maxDate` (today + range)
- Returns `{ results: AuspiciousResult[], hasMore: boolean, nextStartDate: Date }`
- Screen calls scan on initial search and again on scroll-near-bottom
- Loading indicator shown at bottom of list while scanning

## Results UI

Compact card style per result:

- **Left**: Solar date (large) + weekday
- **Right**: Lunar date (primary color) + ganzhi day
- **Bottom row**: Yi activity chips — the matched activity is highlighted (bold, stronger background), other yi items shown as secondary chips
- **Footer**: TianShen luck indicator (吉/凶 with deity name, green/neutral color)
- **Tap action**: Dismiss finder, navigate main view to that date in Daily Detail

## Empty & Loading States

- **No results**: "No auspicious dates for [activity] in the next [range] days" with suggestion to try a longer range
- **Loading chunk**: Activity indicator at bottom of list with "Loading more..." text
- **Range exhausted**: "No more dates in range" footer when full range has been scanned

## Zodiac Persistence

- **Storage key**: `userZodiac` in AsyncStorage
- **Read**: On `AuspiciousFinderScreen` mount, load saved zodiac and pre-select
- **Write**: On zodiac selection change, save immediately to AsyncStorage
- **Utility**: `zodiacStorage.ts` with `getZodiac()` and `setZodiac(animal: string)` functions

## File Structure

### New Files

```
src/
├── screens/
│   └── AuspiciousFinderScreen.tsx    # Main finder screen
├── components/
│   ├── ActivityPicker.tsx            # Category-grouped activity selector
│   ├── ZodiacPicker.tsx              # 12-animal grid selector
│   └── AuspiciousResultCard.tsx      # Individual result card
├── utils/
│   ├── auspiciousScan.ts             # Scan engine (chunked iterator)
│   └── zodiacStorage.ts              # AsyncStorage for zodiac preference
└── constants/
    └── activities.ts                 # Activity category definitions
```

### Modified Files

- **`App.tsx`**: Add header icon (compass/search), state for showing finder screen, callback to navigate to a result date and switch to Daily Detail view

## Theme Support

All new components use the existing `ThemeContext` and `colors.ts` light/dark theme tokens. No new color constants needed — reuse `primary`, `surface`, `foreground`, `subtle`, etc.

## Out of Scope

- Multiple activity selection (search for one activity at a time)
- Saving/bookmarking favorite dates
- Sharing results
- Push notifications for upcoming auspicious dates
- Calendar view overlay of results
