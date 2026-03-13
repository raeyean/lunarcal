# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LunarCal is a React Native calendar app built with Expo (managed workflow). It targets iOS, Android, and Web.

## Tech Stack

- **Expo 54** (managed workflow, no ejected native code)
- **React 19.1.0** / **React Native 0.81.5**
- **TypeScript** with strict mode (`tsconfig.json` extends `expo/tsconfig.base`)
- **React Native New Architecture** enabled (`newArchEnabled: true` in app.json)

## Common Commands

```bash
npm start          # Start Expo dev server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run web        # Run in web browser
```

All commands use `expo start` under the hood. No test runner, linter, or formatter is configured yet.

## Architecture

Currently at boilerplate stage:
- `index.ts` — Entry point, registers root component via `registerRootComponent`
- `App.tsx` — Root component
- `app.json` — Expo configuration (portrait orientation, light UI style)
- `assets/` — App icons and splash screen images

No navigation, state management, or API layers are set up yet. No `src/` directory structure exists.

## Platform Notes

- **iOS**: Tablet support enabled
- **Android**: Edge-to-edge enabled, adaptive icon configured, predictive back gesture disabled
- **Web**: Favicon configured
