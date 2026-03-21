# Today Widget Design

## Overview

A splash/overlay card that appears when the app opens, showing a brief "today at a glance" summary with Yi/Ji and Ganzhi date info. Users dismiss it by swiping down, with an option to suppress it for the rest of the day.

## Requirements

- **Trigger**: Appears every time the app cold-starts (component mount). Does not re-trigger on resume from background.
- **Dismiss**: Swipe down gesture (translate Y + fade)
- **Suppress**: "Don't show again today" text link at the bottom; stores today's date in AsyncStorage to skip on subsequent opens
- **Content**: Day Ganzhi (hero), year/month Ganzhi + lunar date (subtitle), Yi items (top 3), Ji items (top 3)
- **Style**: Gradient card (warm gradient background), Yi sub-card with warm accent border, Ji sub-card neutral. Follows existing ThemeContext (light/dark).

## Approach

**Modal overlay component** -- a new `TodayWidget` component rendered as a React Native `Modal` in `App.tsx`. Uses `Animated` + `PanResponder` for swipe-down dismiss. Stores dismiss state in AsyncStorage (existing dependency).

## Component: `src/components/TodayWidget.tsx`

### Props

```typescript
interface TodayWidgetProps {
  visible: boolean;
  onDismiss: () => void;
  onDismissToday: () => void;
}
```

### Behavior

- Calls `getDayData(year, month, day)` with today's date to get Ganzhi, Yi, Ji, and lunar date
- Shows available items if fewer than 3 Yi or Ji entries exist
- Renders a transparent full-screen `Modal` with a semi-transparent backdrop
- Card content:
  - "Today at a Glance" label (small uppercase)
  - Day Ganzhi as large hero text (e.g. "壬戌日")
  - Year/month Ganzhi + lunar date as subtitle (e.g. "丙寅年 辛卯月 | 農曆二月廿三")
  - Two sub-cards side by side:
    - Yi (宜): warm accent background/border, shows top 3 items
    - Ji (忌): neutral background, shows top 3 items
  - "Swipe down to dismiss" hint
  - "Don't show again today" text link

### Animation

- Card starts centered vertically
- `PanResponder` tracks vertical drag (downward only)
- Card translates Y following finger, opacity fades proportionally
- Release past 150px threshold: animate off-screen (translateY to screen height), then call `onDismiss`
- Release before threshold: spring back to center (translateY: 0, opacity: 1)

## Integration in `App.tsx`

### State

```typescript
const [showWidget, setShowWidget] = useState(false); // starts false, set true after check

useEffect(() => {
  AsyncStorage.getItem('todayWidgetDismissedDate').then(val => {
    const today = new Date().toISOString().split('T')[0];
    setShowWidget(val !== today);
  });
}, []);
```

### Handlers

- `handleWidgetDismiss`: sets `showWidget` to `false`
- `handleWidgetDismissToday`: writes today's date to AsyncStorage key `todayWidgetDismissedDate`, then sets `showWidget` to `false`

### Render

```tsx
<TodayWidget
  visible={showWidget}
  onDismiss={handleWidgetDismiss}
  onDismissToday={handleWidgetDismissToday}
/>
```

Rendered after existing content inside `AppContent`, no changes to existing screens.

## Files Changed

- **New**: `src/components/TodayWidget.tsx`
- **Modified**: `App.tsx` (add state, useEffect, handlers, render TodayWidget)

## Dependencies

- **New**: `expo-linear-gradient` -- required for the warm gradient card background. Standard Expo SDK package.
- **Existing**: `react-native` (Modal, Animated, PanResponder), `@react-native-async-storage/async-storage`, `ThemeContext`, `getDayData`.
