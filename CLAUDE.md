# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LunarCal is a React Native lunar calendar app built with Expo (managed workflow). It targets iOS, Android, and Web. Core features: monthly calendar view, full-day lunar detail (Ganzhi 天干地支, Yi/Ji 宜忌, Tongshu 通書), auspicious date finder, and push notifications for lunar 初一/十五.

## Tech Stack

- **Expo 54** (managed workflow, no ejected native code)
- **React 19.1.0** / **React Native 0.81.5**
- **TypeScript** with strict mode (`tsconfig.json` extends `expo/tsconfig.base`)
- **React Native New Architecture** enabled (`newArchEnabled: true` in app.json)
- **lunar-javascript** v1.7.7 — core lunar calendar engine (Solar ↔ Lunar, Ganzhi, Jieqi, Yi/Ji)
- **expo-notifications** + **expo-background-fetch** — notification scheduling
- **AsyncStorage** — persists theme, notification settings, zodiac preference

## Common Commands

```bash
npm start          # Start Expo dev server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run web        # Run in web browser
npx expo lint      # Run ESLint (configured via eslint.config.js)
```

## Architecture

```
index.ts                      Entry point — registerRootComponent
App.tsx                       Root: font loading, ThemeProvider, AppContent
src/
├── screens/
│   ├── CalendarScreen.tsx    Monthly grid view with bottom Yi/Ji panel
│   ├── DailyDetailScreen.tsx Full-day detail: Ganzhi hero, Yi/Ji cards, Tongshu, Clash
│   └── AuspiciousFinderScreen.tsx  Smart date search with activity/zodiac picker
├── components/               20 UI components (CalendarCell, GanzhiHero, YiJiCard, etc.)
├── context/
│   └── ThemeContext.tsx      Light/Dark/System theme via Context + AsyncStorage
├── hooks/
│   └── useSwipeGesture.ts    PanResponder wrapper for left/right swipe navigation
├── utils/
│   ├── lunar.ts              lunar-javascript wrapper — Ganzhi, Yi/Ji, clash, Jieqi
│   ├── auspiciousScan.ts     Auspicious date scan logic (filters by activity + zodiac clash)
│   ├── lunarNotifications.ts Notification scheduling + permission handling
│   ├── notificationSettings.ts AsyncStorage read/write for notification prefs
│   └── zodiacStorage.ts      AsyncStorage read/write for zodiac selection
├── data/
│   ├── specialEvents.ts      Custom lunar event database
│   └── eventDescriptions.ts  Event detail text
├── constants/
│   ├── colors.ts             Light/Dark palette (primary: #f04324)
│   ├── typography.ts         Font family constants and text style presets
│   ├── activities.ts         Activity categories for auspicious finder
│   └── tasks.ts              Background task name constant
└── types/
    └── lunar-javascript.d.ts Type definitions for lunar-javascript
```

## Navigation Model

No navigation library. App.tsx manages screen state directly:
- `activeTab: 'daily' | 'calendar'` — switches between DailyDetailScreen and CalendarScreen
- `year/month/selectedDay` — shared date state passed as props
- AuspiciousFinderScreen and SettingsModal are modal overlays controlled by `visible` props

## Key Patterns

- **Theming**: `useTheme()` hook from ThemeContext provides `colors`, `isDark`, `toggleTheme`
- **Swipe navigation**: `useSwipeGesture(onPrev, onNext)` returns PanResponder props
- **Lunar data**: All lunar calculations go through `src/utils/lunar.ts`, which wraps lunar-javascript
- **Fonts**: Outfit (headings) and Inter (body) loaded in App.tsx via `useFonts`; all components assume fonts are loaded before rendering

## Platform Notes

- **iOS**: Tablet support enabled; uses compact DateTimePicker in settings
- **Android**: Edge-to-edge enabled, adaptive icon configured, predictive back gesture disabled
- **Web**: Favicon configured; layout is portrait-optimised (not responsive for desktop widths)

## Known Gaps / Future Work

- No test runner (Jest, Detox)
- Web layout not optimised for desktop/tablet widths
- Notification background fetch may be killed by Android battery optimisation; foreground fallback on app resume is in place via AppState listener
