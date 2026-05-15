# LunarCal

React Native lunar calendar app (Expo managed workflow). iOS + Android + Web. Monthly grid, full daily detail (Ganzhi, Yi/Ji, Tongshu), auspicious date finder, lunar 初一/十五 push notifications.

## Monorepo layout

```
apps/api/          Hono REST API — Firebase Functions Gen 2 (asia-east1)
packages/shared/   Shared Zod schemas + lunar logic (re-exported by mobile)
src/               Expo mobile app
```

## Run locally

### Mobile dev server

```bash
npm start          # Expo dev server
npm run ios        # iOS simulator
npm run android    # Android emulator
npm run web        # Web browser
```

### API emulator

```bash
npm run emulator   # Firebase emulator + esbuild watch
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

### API tests

```bash
npm test -w @lunarcal/api   # 14 Vitest tests (routes, schemas, CORS)
```

## REST API

Deployed: `https://api-oi2eku5jpq-de.a.run.app`

| Endpoint | Description |
|---|---|
| `GET /api/yiji/:y/:m/:d` | 宜/忌 with glossary descriptions |
| `GET /api/directions/:y/:m/:d` | 5-key 方位 map (財神/喜神/福神/陽貴/陰貴) |
| `GET /api/deity[/:lm/:ld]` | Single deity day or all 36 |
| `GET /api/openapi.json` | OpenAPI spec |
| `GET /api/docs` | Swagger UI |

Mobile queries via TanStack Query (`src/api/hooks.ts`) with `staleTime=Infinity` — data is deterministic per date.

## Architecture

See [CLAUDE.md](CLAUDE.md) for tech stack, file layout, navigation model, and known gaps.

## Backlog

[tasks/ui-ux-followup.md](tasks/ui-ux-followup.md) — UI/UX audit deferred items.
