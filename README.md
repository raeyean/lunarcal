# LunarCal

React Native lunar calendar app (Expo managed workflow). iOS + Android + Web. Monthly grid, full daily detail (Ganzhi, Yi/Ji, Tongshu), auspicious date finder, lunar 初一/十五 push notifications.

## Run locally

### Dev server

```bash
npm start          # Expo dev server
npm run ios        # iOS simulator
npm run android    # Android emulator
npm run web        # Web browser
```

### Release build on physical iOS device

```bash
npx expo run:ios --configuration Release --device 00008130-000650A114F9001C
```

Replace device UDID with your own. Find UDIDs via `xcrun xctrace list devices`.

### Lint

```bash
npx expo lint
```

## Architecture

See [CLAUDE.md](CLAUDE.md) for tech stack, file layout, navigation model, and known gaps.

## Backlog

[tasks/ui-ux-followup.md](tasks/ui-ux-followup.md) — UI/UX audit deferred items.
