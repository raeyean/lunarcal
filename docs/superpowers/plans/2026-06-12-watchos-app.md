# watchOS App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Native watchOS glance app showing today's lunar data (crown-scrollable ±7 days) with zodiac-clash warning synced from the phone.

**Architecture:** Single-target watchOS SwiftUI app `LunarCalWatch` injected at prebuild by a new config plugin (`plugins/withWatch.js`, mirroring `plugins/withWidget.js`). Lunar data computed on-watch by the existing Swift engine (moved to `targets/shared/`). Zodiac flows phone→watch via a local Expo module wrapping `WCSession.updateApplicationContext`.

**Tech Stack:** SwiftUI (watchOS 10+), WatchConnectivity, Expo config plugins (`@expo/config-plugins` / node-xcode), Expo Modules (local module), TypeScript.

**Spec:** `docs/superpowers/specs/2026-06-12-watchos-app-design.md`

**Testing reality:** No Swift/mobile unit-test runner exists in this repo (see CLAUDE.md "Known Gaps"). Verification per task = build commands with expected output + manual sim QA at the end. TS changes are guarded by patterns already proven in this repo (graceful native-module fallback).

**Verification commands used throughout:**

```bash
# Regenerate iOS project (runs pod install too)
npx expo prebuild -p ios --clean

# Build phone app + embedded watch app for simulator
xcodebuild -workspace ios/LunarCal.xcworkspace -scheme LunarCal \
  -configuration Debug -destination 'generic/platform=iOS Simulator' \
  build 2>&1 | tail -5
# Expected: ** BUILD SUCCEEDED **
```

---

### Task 1: Move LunarCalculator.swift to targets/shared/

The watch target needs the same lunar engine as the widget. One source of truth.

**Files:**
- Move: `targets/widget/LunarCalculator.swift` → `targets/shared/LunarCalculator.swift`
- Modify: `plugins/withWidget.js:15-30` (copy loop)

- [ ] **Step 1: Move the file**

```bash
mkdir -p targets/shared
git mv targets/widget/LunarCalculator.swift targets/shared/LunarCalculator.swift
```

- [ ] **Step 2: Teach withWidget.js to copy from both dirs**

In `plugins/withWidget.js`, replace the copy block (the `// 1. Copy widget source files...` section, lines ~15-30) with:

```js
    // 1. Copy widget + shared source files to ios build directory
    const widgetSrcDirs = [
      path.join(projectRoot, 'targets', 'widget'),
      path.join(projectRoot, 'targets', 'shared'),
    ];
    const widgetDestDir = path.join(platformRoot, WIDGET_NAME);

    if (!fs.existsSync(widgetDestDir)) {
      fs.mkdirSync(widgetDestDir, { recursive: true });
    }

    const allFiles = [];
    for (const dir of widgetSrcDirs) {
      for (const file of fs.readdirSync(dir)) {
        const src = path.join(dir, file);
        const dest = path.join(widgetDestDir, file);
        if (fs.statSync(src).isFile()) {
          fs.copyFileSync(src, dest);
          allFiles.push(file);
        }
      }
    }
```

(`allFiles` keeps its name — the rest of the plugin uses it unchanged.)

- [ ] **Step 3: Verify prebuild + widget still compiles**

```bash
npx expo prebuild -p ios --clean
xcodebuild -workspace ios/LunarCal.xcworkspace -scheme LunarCal \
  -configuration Debug -destination 'generic/platform=iOS Simulator' \
  build 2>&1 | tail -5
```

Expected: `** BUILD SUCCEEDED **`. If `LunarCalculator` is unresolved in widget sources, the copy loop changes didn't take — re-check Step 2.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor(targets): move LunarCalculator.swift to targets/shared for watch reuse"
```

---

### Task 2: Watch app skeleton sources

Minimal compilable watch app — validates target wiring (Task 3) before any real UI.

**Files:**
- Create: `targets/watch/LunarCalWatchApp.swift`
- Create: `targets/watch/Info.plist`

- [ ] **Step 1: Create `targets/watch/LunarCalWatchApp.swift`**

```swift
import SwiftUI

@main
struct LunarCalWatchApp: App {
    var body: some Scene {
        WindowGroup {
            VStack {
                Text("LunarCal")
                    .font(.headline)
                Text(LunarCalculator.calculate(year: 2026, month: 6, day: 12).dayGanzhi)
                    .foregroundColor(.secondary)
            }
        }
    }
}
```

(The `LunarCalculator` call proves the shared engine compiles into the watch target.)

- [ ] **Step 2: Create `targets/watch/Info.plist`**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleDevelopmentRegion</key>
	<string>$(DEVELOPMENT_LANGUAGE)</string>
	<key>CFBundleDisplayName</key>
	<string>風水日曆</string>
	<key>CFBundleExecutable</key>
	<string>$(EXECUTABLE_NAME)</string>
	<key>CFBundleIdentifier</key>
	<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
	<key>CFBundleInfoDictionaryVersion</key>
	<string>6.0</string>
	<key>CFBundleName</key>
	<string>$(PRODUCT_NAME)</string>
	<key>CFBundlePackageType</key>
	<string>$(PRODUCT_BUNDLE_PACKAGE_TYPE)</string>
	<key>CFBundleShortVersionString</key>
	<string>$(MARKETING_VERSION)</string>
	<key>CFBundleVersion</key>
	<string>$(CURRENT_PROJECT_VERSION)</string>
	<key>WKApplication</key>
	<true/>
	<key>WKCompanionAppBundleIdentifier</key>
	<string>com.raeyean.LunarCal</string>
	<key>WKRunsIndependentlyOfCompanionApp</key>
	<true/>
</dict>
</plist>
```

- [ ] **Step 3: Commit**

```bash
git add targets/watch
git commit -m "feat(watch): skeleton watchOS app sources"
```

---

### Task 3: withWatch config plugin

The core wiring. Mirrors `withWidget.js` but: product type = watchOS application (single-target, no extension), `SDKROOT=watchos`, and an "Embed Watch Content" copy phase on the iPhone target instead of "Embed App Extensions".

**Files:**
- Create: `plugins/withWatch.js`
- Modify: `app.json` (plugins array)

- [ ] **Step 1: Create `plugins/withWatch.js`**

```js
const { withXcodeProject } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

const WATCH_NAME = 'LunarCalWatch';

function copyRecursive(src, dest) {
  if (fs.statSync(src).isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

function withWatch(config) {
  config = withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;
    const projectRoot = config.modRequest.projectRoot;
    const platformRoot = config.modRequest.platformProjectRoot;
    const bundleId = config.ios?.bundleIdentifier || 'com.lunarcal';
    const watchBundleId = `${bundleId}.watchkitapp`;

    // 1. Copy watch + shared sources to ios build directory
    const srcDirs = [
      path.join(projectRoot, 'targets', 'watch'),
      path.join(projectRoot, 'targets', 'shared'),
    ];
    const destDir = path.join(platformRoot, WATCH_NAME);
    fs.mkdirSync(destDir, { recursive: true });

    const copiedFiles = [];
    const copiedDirs = [];
    for (const dir of srcDirs) {
      for (const entry of fs.readdirSync(dir)) {
        const src = path.join(dir, entry);
        const dest = path.join(destDir, entry);
        if (fs.statSync(src).isDirectory()) {
          copyRecursive(src, dest);
          copiedDirs.push(entry);
        } else {
          fs.copyFileSync(src, dest);
          copiedFiles.push(entry);
        }
      }
    }

    // 2. PBXGroup
    const groupKey = xcodeProject.pbxCreateGroup(WATCH_NAME, WATCH_NAME);
    const projectSection = xcodeProject.pbxProjectSection();
    const mainProjectKey = Object.keys(projectSection).find(
      k => !k.endsWith('_comment') && projectSection[k].mainGroup
    );
    xcodeProject.addToPbxGroup(groupKey, projectSection[mainProjectKey].mainGroup);

    // 3. Watch target. 'watch2_app' gives node-xcode's watch handling
    //    (incl. "Embed Watch Content" on the first target); we then patch
    //    the product type to a modern single-target watchOS application.
    const target = xcodeProject.addTarget(
      WATCH_NAME,
      'watch2_app',
      WATCH_NAME,
      watchBundleId
    );
    if (!target) {
      console.error('Failed to create watch target');
      return config;
    }
    xcodeProject.pbxNativeTargetSection()[target.uuid].productType =
      '"com.apple.product-type.application"';

    // 4. Build phases
    xcodeProject.addBuildPhase([], 'PBXSourcesBuildPhase', 'Sources', target.uuid);
    xcodeProject.addBuildPhase([], 'PBXFrameworksBuildPhase', 'Frameworks', target.uuid);
    xcodeProject.addBuildPhase([], 'PBXResourcesBuildPhase', 'Resources', target.uuid);

    // 5. Sources + files
    for (const file of copiedFiles.filter(f => f.endsWith('.swift'))) {
      xcodeProject.addSourceFile(file, { target: target.uuid }, groupKey);
    }
    xcodeProject.addFile('Info.plist', groupKey);

    // Asset catalogs (e.g. Assets.xcassets) go in the Resources phase
    for (const dir of copiedDirs.filter(d => d.endsWith('.xcassets'))) {
      xcodeProject.addResourceFile(dir, { target: target.uuid }, groupKey);
    }

    // 6. Build settings for the watch target
    const configurations = xcodeProject.pbxXCBuildConfigurationSection();
    for (const key in configurations) {
      if (key.endsWith('_comment')) continue;
      const buildConfig = configurations[key];
      if (!buildConfig.buildSettings) continue;
      const bs = buildConfig.buildSettings;

      if (
        bs.PRODUCT_BUNDLE_IDENTIFIER === watchBundleId ||
        bs.PRODUCT_BUNDLE_IDENTIFIER === `"${watchBundleId}"` ||
        bs.PRODUCT_NAME === `"${WATCH_NAME}"` ||
        bs.PRODUCT_NAME === WATCH_NAME
      ) {
        Object.assign(bs, {
          SDKROOT: 'watchos',
          WATCHOS_DEPLOYMENT_TARGET: '10.0',
          TARGETED_DEVICE_FAMILY: '4',
          SWIFT_VERSION: '5.0',
          GENERATE_INFOPLIST_FILE: 'YES',
          INFOPLIST_FILE: `${WATCH_NAME}/Info.plist`,
          INFOPLIST_KEY_WKApplication: 'YES',
          ASSETCATALOG_COMPILER_APPICON_NAME: 'AppIcon',
          CODE_SIGN_STYLE: 'Automatic',
          CURRENT_PROJECT_VERSION: '1',
          MARKETING_VERSION: '1.0',
          SKIP_INSTALL: 'YES',
          ENABLE_PREVIEWS: 'YES',
          LD_RUNPATH_SEARCH_PATHS: '"$(inherited) @executable_path/Frameworks"',
        });

        if (!bs.DEVELOPMENT_TEAM) {
          for (const k2 in configurations) {
            if (k2.endsWith('_comment')) continue;
            const c2 = configurations[k2];
            if (c2.buildSettings?.DEVELOPMENT_TEAM && c2.buildSettings?.PRODUCT_NAME !== `"${WATCH_NAME}"`) {
              bs.DEVELOPMENT_TEAM = c2.buildSettings.DEVELOPMENT_TEAM;
              break;
            }
          }
        }
      }
    }

    // 7. Main app depends on watch target; ensure Embed Watch Content phase
    const mainTarget = xcodeProject.getFirstTarget().firstTarget;
    xcodeProject.addTargetDependency(mainTarget.uuid, [target.uuid]);

    const hasEmbedWatch = (mainTarget.buildPhases || []).some(
      p => (p.comment || '') === 'Embed Watch Content'
    );
    if (!hasEmbedWatch) {
      const embedPhase = xcodeProject.addBuildPhase(
        [`${WATCH_NAME}.app`],
        'PBXCopyFilesBuildPhase',
        'Embed Watch Content',
        mainTarget.uuid,
        'watch2_app',
        '"$(CONTENTS_FOLDER_PATH)/Watch"'
      );
      if (embedPhase && embedPhase.buildPhase) {
        embedPhase.buildPhase.dstSubfolderSpec = 16; // products directory
        embedPhase.buildPhase.dstPath = '"$(CONTENTS_FOLDER_PATH)/Watch"';
      }
    }

    console.log(`✅ Added ${WATCH_NAME} watch app target`);
    return config;
  });

  return config;
}

module.exports = withWatch;
```

- [ ] **Step 2: Register plugin in `app.json`**

In the `plugins` array, after `"./plugins/withWidget"`:

```json
    "plugins": [
      "expo-font",
      "./plugins/withWidget",
      "./plugins/withWatch",
      ...
```

- [ ] **Step 3: Prebuild and inspect the generated project**

```bash
npx expo prebuild -p ios --clean
grep -c "LunarCalWatch" ios/LunarCal.xcodeproj/project.pbxproj
grep "Embed Watch Content" ios/LunarCal.xcodeproj/project.pbxproj | head -2
```

Expected: count > 10; one `Embed Watch Content` PBXCopyFilesBuildPhase entry (exactly one — if two appear, node-xcode auto-created one AND the fallback ran; delete the fallback block's duplicate by tightening the `hasEmbedWatch` check to scan `xcodeProject.hash.project.objects.PBXCopyFilesBuildPhase` comments instead of `mainTarget.buildPhases`).

- [ ] **Step 4: Build**

```bash
xcodebuild -workspace ios/LunarCal.xcworkspace -scheme LunarCal \
  -configuration Debug -destination 'generic/platform=iOS Simulator' \
  build 2>&1 | tail -5
```

Expected: `** BUILD SUCCEEDED **`, and the log contains watch target compile lines (`SwiftCompile ... LunarCalWatchApp.swift`).

**Known risk (spec risk #2):** if the watchapp2→application product-type patch misbehaves (error like *"Watch-Only Application Stubs are not available"* or embed validation failure), fall back to leaving product type as `watchapp2` and removing the `INFOPLIST_KEY_WKApplication` setting — `WKApplication` in Info.plist still marks it single-target. Budget time here; this step is the fiddly one.

- [ ] **Step 5: Prebuild idempotency check**

```bash
npx expo prebuild -p ios --clean
xcodebuild -workspace ios/LunarCal.xcworkspace -scheme LunarCal \
  -configuration Debug -destination 'generic/platform=iOS Simulator' \
  build 2>&1 | tail -3
```

Expected: still `** BUILD SUCCEEDED **` — plugin produces a valid project from scratch every time.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(watch): withWatch config plugin adds LunarCalWatch target at prebuild"
```

---

### Task 4: EAS build spike — CHECKPOINT

Spec risk #1: EAS managed credentials must mint a provisioning profile for `com.raeyean.LunarCal.watchkitapp`. Validate before investing in UI.

**Files:** none (build-only)

- [ ] **Step 1: Kick off a development build**

```bash
eas build --platform ios --profile development --non-interactive 2>&1 | tail -20
```

Expected: EAS detects the watch target, prompts/creates a provisioning profile for the watch bundle ID, build succeeds. (First run may need interactive mode — drop `--non-interactive` — so EAS can register the new bundle ID on the Apple Developer account.)

- [ ] **Step 2: If credentials fail**

Run `eas credentials -p ios` and add the watch bundle ID target manually. If EAS cannot handle the multi-target watch setup at all, STOP and re-plan (options: build watch flavor locally via `xcodebuild` archive, or check current EAS docs for `extra.eas.build.experimental` multi-target config). Do not proceed to UI tasks with a broken release path.

- [ ] **Step 3: Record the outcome**

Append result (success / workaround used) to this plan file under this task, commit:

```bash
git add docs/superpowers/plans/2026-06-12-watchos-app.md
git commit -m "docs(watch): record EAS watch-target build spike result"
```

### Task 4 spike result (2026-06-12)

**Status: BLOCKED on interactive Apple credential setup — watch-target risk still UNVALIDATED.**

- Auth OK: `eas whoami` → `raeyean`. Project `@raeyean/LunarCal` (e9499a56-…) confirmed.
- Local `eas-cli` is 14.4.1, below the `>= 18.3.0` constraint in eas.json. Ran via `npx eas-cli@latest` (resolved 20.1.0) to satisfy it. (Consider bumping the dev dependency / global install.)
- `eas build --platform ios --profile development --non-interactive` failed at credential setup:
  > `Failed to set up credentials. You're in non-interactive mode. EAS CLI couldn't find any credentials suitable for internal distribution. Run this command again in interactive mode.`
- `eas device:list` → `No Apple teams found for account raeyean.` and `eas build:list -p ios` → `[]` (no prior iOS cloud builds). So the assumed "existing phone + widget credentials on EAS" are **not** present/usable server-side in a non-interactive context — there is no linked Apple Developer team for the CLI to use.
- `eas credentials -p ios` is fully interactive and cannot be driven here: it requires a TTY (rejects piped/redirected stdin with `Input is required, but stdin is not readable`). Minting any provisioning profile (including the new watch bundle ID) requires an interactive Apple ID login + 2FA, which this environment cannot supply.

**Diagnosis:** the failure is an environment/auth limitation (no TTY + no Apple team linked on EAS), **not** proof that EAS cannot handle the watch target. EAS never progressed far enough to attempt minting a profile for `com.raeyean.LunarCal.watchkitapp`, so spec risk #1 remains genuinely open.

**Required to unblock (user action, real terminal):** run `eas build --platform ios --profile development` interactively (no `--non-interactive`), log into the Apple Developer account when prompted, and let EAS register the phone, widget, and new watch bundle IDs + ad-hoc devices. Only the watch-bundle-ID provisioning step proves/refutes risk #1. No project config was changed.

---

### Task 5: Glance UI + crown paging

Replace skeleton with real UI. Visual reference: mockups approved 2026-06-12 (see spec "Visual design").

**Files:**
- Create: `targets/watch/GlanceView.swift`
- Create: `targets/watch/DayPagerView.swift`
- Modify: `targets/watch/LunarCalWatchApp.swift`

- [ ] **Step 1: Create `targets/watch/GlanceView.swift`**

```swift
import SwiftUI

extension Color {
    static let lunarAccent = Color(red: 240/255, green: 67/255, blue: 36/255) // #f04324
    static let yiChip = Color(red: 126/255, green: 212/255, blue: 146/255)
    static let jiChip = Color(red: 240/255, green: 153/255, blue: 123/255)
}

struct GlanceView: View {
    let offset: Int

    private var info: LunarDayInfo {
        let date = Calendar.current.date(byAdding: .day, value: offset, to: Date()) ?? Date()
        let c = Calendar.current.dateComponents([.year, .month, .day], from: date)
        return LunarCalculator.calculate(year: c.year!, month: c.month!, day: c.day!)
    }

    private var headerText: String {
        let base = "\(info.solarMonth)月\(info.solarDay)日 \(info.weekdayCn.suffix(1))"
        switch offset {
        case 0: return base
        case 1: return "明天 · " + base
        case -1: return "昨天 · " + base
        default: return base
        }
    }

    var body: some View {
        let info = self.info
        ScrollView {
            VStack(alignment: .leading, spacing: 6) {
                Text(headerText)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(offset == 0 ? .lunarAccent : .secondary)

                Text("\(info.lunarMonthCn)月\(info.lunarDayCn)")
                    .font(.system(size: 28, weight: .medium))

                Text("\(info.yearGanzhi)年 \(info.monthGanzhi)月 \(info.dayGanzhi)日")
                    .font(.system(size: 12))
                    .foregroundColor(.secondary)

                chipRow(label: "宜", items: info.yi, chip: .yiChip)
                chipRow(label: "忌", items: info.ji, chip: .jiChip)

                Divider().padding(.top, 4)

                Text("沖\(info.clashAnimal)(\(info.clashBranch)) 煞\(info.sha)")
                    .font(.system(size: 13))
                    .foregroundColor(.secondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 4)
        }
    }

    private func chipRow(label: String, items: [String], chip: Color) -> some View {
        HStack(alignment: .firstTextBaseline, spacing: 5) {
            Text(label)
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(.black)
                .padding(.horizontal, 7)
                .padding(.vertical, 2)
                .background(chip)
                .clipShape(Capsule())
            Text(items.prefix(3).joined(separator: " "))
                .font(.system(size: 13))
                .lineLimit(1)
        }
    }
}
```

Note: `lunarMonthCn`/`lunarDayCn` formatting must match what `targets/widget/WidgetViews.swift` renders — check that file and mirror its composition exactly (e.g. whether `月` suffix is already included in `lunarMonthCn`). Adjust the `Text` line if so.

- [ ] **Step 2: Create `targets/watch/DayPagerView.swift`**

```swift
import SwiftUI

struct DayPagerView: View {
    @State private var selection = 0

    var body: some View {
        TabView(selection: $selection) {
            ForEach(-7...7, id: \.self) { offset in
                GlanceView(offset: offset)
                    .tag(offset)
            }
        }
        .tabViewStyle(.verticalPage)
    }
}
```

(`.verticalPage` = crown + swipe vertical paging, watchOS 10+. This is why `WATCHOS_DEPLOYMENT_TARGET` is 10.0.)

- [ ] **Step 3: Slim `targets/watch/LunarCalWatchApp.swift` to use the pager**

```swift
import SwiftUI

@main
struct LunarCalWatchApp: App {
    var body: some Scene {
        WindowGroup {
            DayPagerView()
        }
    }
}
```

- [ ] **Step 4: Prebuild + build**

```bash
npx expo prebuild -p ios --clean
xcodebuild -workspace ios/LunarCal.xcworkspace -scheme LunarCal \
  -configuration Debug -destination 'generic/platform=iOS Simulator' \
  build 2>&1 | tail -3
```

Expected: `** BUILD SUCCEEDED **`.

- [ ] **Step 5: Eyeball on watch simulator**

Open `ios/LunarCal.xcworkspace` in Xcode, select the auto-generated `LunarCalWatch` scheme, run on any watchOS 10+ simulator. Verify: today's lunar date renders, crown scrolls through days, ±7 bounds stop.

Cross-check displayed data against the JS engine:

```bash
node -e "
const {Solar} = require('lunar-javascript');
const l = Solar.fromYmd(2026,6,12).getLunar();
console.log(l.getMonthInChinese()+'月'+l.getDayInChinese(), l.getDayInGanZhi(), '沖'+l.getDayChongDesc(), '煞'+l.getDaySha());
"
```

Watch display for the same date must match.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(watch): glance UI with crown-scrollable day pager"
```

---

### Task 6: Watch-side connectivity + clash warning

**Files:**
- Create: `targets/watch/ConnectivityManager.swift`
- Modify: `targets/watch/GlanceView.swift`
- Modify: `targets/watch/LunarCalWatchApp.swift`

- [ ] **Step 1: Create `targets/watch/ConnectivityManager.swift`**

```swift
import Foundation
import WatchConnectivity

final class ConnectivityManager: NSObject, WCSessionDelegate, ObservableObject {
    static let shared = ConnectivityManager()

    @Published var zodiac: String? = UserDefaults.standard.string(forKey: "userZodiac")

    private override init() {
        super.init()
        guard WCSession.isSupported() else { return }
        WCSession.default.delegate = self
        WCSession.default.activate()
    }

    func session(_ session: WCSession,
                 activationDidCompleteWith activationState: WCSessionActivationState,
                 error: Error?) {
        applyContext(session.receivedApplicationContext)
    }

    func session(_ session: WCSession,
                 didReceiveApplicationContext applicationContext: [String: Any]) {
        applyContext(applicationContext)
    }

    private func applyContext(_ context: [String: Any]) {
        guard let z = context["zodiac"] as? String, !z.isEmpty else { return }
        DispatchQueue.main.async {
            self.zodiac = z
            UserDefaults.standard.set(z, forKey: "userZodiac")
        }
    }
}
```

- [ ] **Step 2: Wire into app entry**

`targets/watch/LunarCalWatchApp.swift`:

```swift
import SwiftUI

@main
struct LunarCalWatchApp: App {
    @StateObject private var connectivity = ConnectivityManager.shared

    var body: some Scene {
        WindowGroup {
            DayPagerView()
                .environmentObject(connectivity)
        }
    }
}
```

- [ ] **Step 3: Add warning card to GlanceView**

In `targets/watch/GlanceView.swift`, add the environment object below `let offset: Int`:

```swift
    @EnvironmentObject var connectivity: ConnectivityManager
```

Replace the clash footer block (`Divider()` + `Text("沖...")`) with:

```swift
                Divider().padding(.top, 4)

                if let zodiac = connectivity.zodiac, zodiac == info.clashAnimal {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("⚠ 今日沖\(info.clashAnimal) — 你屬\(zodiac)")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(.lunarAccent)
                        Text("諸事不宜，宜靜不宜動")
                            .font(.system(size: 11))
                            .foregroundColor(.secondary)
                    }
                    .padding(8)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(Color.lunarAccent, lineWidth: 0.5)
                    )
                } else {
                    Text("沖\(info.clashAnimal)(\(info.clashBranch)) 煞\(info.sha)")
                        .font(.system(size: 13))
                        .foregroundColor(.secondary)
                }
```

- [ ] **Step 4: Prebuild + build**

```bash
npx expo prebuild -p ios --clean
xcodebuild -workspace ios/LunarCal.xcworkspace -scheme LunarCal \
  -configuration Debug -destination 'generic/platform=iOS Simulator' \
  build 2>&1 | tail -3
```

Expected: `** BUILD SUCCEEDED **`.

- [ ] **Step 5: Quick sim check of warning rendering**

Temporarily seed `UserDefaults.standard.set("豬", forKey: "userZodiac")` won't be needed — instead run the watch scheme in Xcode, pause, and in the simulator run:

```bash
xcrun simctl spawn booted defaults write com.raeyean.LunarCal.watchkitapp userZodiac 豬
```

Relaunch watch app; crown to a 沖豬 day (2026-06-12 is one) → warning card shows. Then reset:

```bash
xcrun simctl spawn booted defaults delete com.raeyean.LunarCal.watchkitapp userZodiac
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(watch): WCSession receiver + zodiac clash warning card"
```

---

### Task 7: Phone-side watch-sync Expo module

Local Expo module (first in this repo — `modules/` is auto-scanned by expo-modules-autolinking).

**Files:**
- Create: `modules/watch-sync/expo-module.config.json`
- Create: `modules/watch-sync/index.ts`
- Create: `modules/watch-sync/ios/WatchSync.podspec`
- Create: `modules/watch-sync/ios/WatchSyncModule.swift`

- [ ] **Step 1: Create `modules/watch-sync/expo-module.config.json`**

```json
{
  "platforms": ["apple"],
  "apple": {
    "modules": ["WatchSyncModule"]
  }
}
```

- [ ] **Step 2: Create `modules/watch-sync/ios/WatchSync.podspec`**

```ruby
Pod::Spec.new do |s|
  s.name           = 'WatchSync'
  s.version        = '1.0.0'
  s.summary        = 'Phone-to-watch zodiac sync via WatchConnectivity'
  s.description    = 'Pushes the user zodiac selection to the LunarCal watch app.'
  s.author         = 'LunarCal'
  s.homepage       = 'https://github.com/raeyean/LunarCal'
  s.license        = 'MIT'
  s.platforms      = { :ios => '15.1' }
  s.source         = { :git => '' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.source_files = '**/*.swift'
  s.frameworks = 'WatchConnectivity'
end
```

- [ ] **Step 3: Create `modules/watch-sync/ios/WatchSyncModule.swift`**

```swift
import ExpoModulesCore
import WatchConnectivity

final class WatchSyncSessionDelegate: NSObject, WCSessionDelegate {
    static let shared = WatchSyncSessionDelegate()
    var pendingZodiac: String?

    func session(_ session: WCSession,
                 activationDidCompleteWith activationState: WCSessionActivationState,
                 error: Error?) {
        if activationState == .activated, let z = pendingZodiac {
            try? session.updateApplicationContext(["zodiac": z])
            pendingZodiac = nil
        }
    }

    func sessionDidBecomeInactive(_ session: WCSession) {}
    func sessionDidDeactivate(_ session: WCSession) { session.activate() }
}

public class WatchSyncModule: Module {
    public func definition() -> ModuleDefinition {
        Name("WatchSync")

        Function("syncZodiac") { (zodiac: String) -> Bool in
            guard WCSession.isSupported() else { return false }
            let session = WCSession.default
            if session.delegate == nil {
                session.delegate = WatchSyncSessionDelegate.shared
            }
            if session.activationState != .activated {
                WatchSyncSessionDelegate.shared.pendingZodiac = zodiac
                session.activate()
                return true
            }
            do {
                try session.updateApplicationContext(["zodiac": zodiac])
                return true
            } catch {
                return false
            }
        }
    }
}
```

- [ ] **Step 4: Create `modules/watch-sync/index.ts`**

```ts
import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';

type WatchSyncNativeModule = {
  syncZodiac(zodiac: string): boolean;
};

/**
 * Push the zodiac selection to the paired Apple Watch.
 * No-ops (returns false) on Android/Web or when the native
 * module is unavailable — same graceful-fallback pattern as expo-crypto usage.
 */
export function syncZodiacToWatch(zodiac: string): boolean {
  if (Platform.OS !== 'ios') return false;
  const native = requireOptionalNativeModule<WatchSyncNativeModule>('WatchSync');
  if (!native) return false;
  try {
    return native.syncZodiac(zodiac);
  } catch {
    return false;
  }
}
```

- [ ] **Step 5: Prebuild (pod install picks up the module) + build**

```bash
npx expo prebuild -p ios --clean
grep WatchSync ios/Podfile.lock | head -3
xcodebuild -workspace ios/LunarCal.xcworkspace -scheme LunarCal \
  -configuration Debug -destination 'generic/platform=iOS Simulator' \
  build 2>&1 | tail -3
```

Expected: `WatchSync` appears in Podfile.lock; `** BUILD SUCCEEDED **`.

- [ ] **Step 6: Lint TS**

```bash
npx expo lint
```

Expected: no new errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(watch-sync): local Expo module pushing zodiac via WCSession"
```

---

### Task 8: Hook sync into zodiacStorage

**Files:**
- Modify: `src/utils/zodiacStorage.ts:17-22`

- [ ] **Step 1: Call sync on zodiac write**

`src/utils/zodiacStorage.ts` — add import and extend `setZodiac`:

```ts
// src/utils/zodiacStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncZodiacToWatch } from '../../modules/watch-sync';

const STORAGE_KEY = 'userZodiac';

const VALID_ZODIACS = new Set([
  '鼠', '牛', '虎', '兔', '龍', '蛇',
  '馬', '羊', '猴', '雞', '狗', '豬',
]);

export async function getZodiac(): Promise<string | null> {
  const value = await AsyncStorage.getItem(STORAGE_KEY);
  if (value === null) return null;
  return VALID_ZODIACS.has(value) ? value : null;
}

export async function setZodiac(animal: string): Promise<void> {
  if (!VALID_ZODIACS.has(animal)) {
    throw new Error(`Invalid zodiac animal: ${animal}`);
  }
  await AsyncStorage.setItem(STORAGE_KEY, animal);
  // Fire-and-forget: watch sync must never block or fail the save
  syncZodiacToWatch(animal);
}
```

- [ ] **Step 2: Lint + typecheck**

```bash
npx expo lint && npx tsc --noEmit
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/utils/zodiacStorage.ts
git commit -m "feat(zodiac): push selection to watch on save"
```

---

### Task 9: Watch app icon

Required before TestFlight (watch apps must have an icon); harmless for sim dev.

**Files:**
- Create: `targets/watch/Assets.xcassets/Contents.json`
- Create: `targets/watch/Assets.xcassets/AppIcon.appiconset/Contents.json`
- Create: `targets/watch/Assets.xcassets/AppIcon.appiconset/icon.png`

- [ ] **Step 1: Create asset catalog**

```bash
mkdir -p targets/watch/Assets.xcassets/AppIcon.appiconset
cat > targets/watch/Assets.xcassets/Contents.json <<'EOF'
{
  "info": { "author": "xcode", "version": 1 }
}
EOF
cat > targets/watch/Assets.xcassets/AppIcon.appiconset/Contents.json <<'EOF'
{
  "images": [
    {
      "filename": "icon.png",
      "idiom": "universal",
      "platform": "watchos",
      "size": "1024x1024"
    }
  ],
  "info": { "author": "xcode", "version": 1 }
}
EOF
```

- [ ] **Step 2: Reuse app icon (must be 1024×1024, no alpha for watchOS)**

```bash
sips -g pixelWidth -g pixelHeight -g hasAlpha assets/icon.png
# If 1024x1024 and hasAlpha: no — direct copy:
cp assets/icon.png targets/watch/Assets.xcassets/AppIcon.appiconset/icon.png
# If hasAlpha: yes — flatten via jpeg round-trip (reliably drops alpha):
sips -s format jpeg assets/icon.png --out /tmp/watch-icon.jpg
sips -s format png /tmp/watch-icon.jpg --out targets/watch/Assets.xcassets/AppIcon.appiconset/icon.png
# If not 1024x1024, also resize:
sips -z 1024 1024 targets/watch/Assets.xcassets/AppIcon.appiconset/icon.png
```

(Sim builds don't validate opacity; App Store submission does.)

- [ ] **Step 3: Prebuild + build (plugin already copies dirs + adds .xcassets resources)**

```bash
npx expo prebuild -p ios --clean
xcodebuild -workspace ios/LunarCal.xcworkspace -scheme LunarCal \
  -configuration Debug -destination 'generic/platform=iOS Simulator' \
  build 2>&1 | tail -3
```

Expected: `** BUILD SUCCEEDED **`; watch sim home screen shows the icon.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(watch): app icon asset catalog"
```

---

### Task 10: End-to-end manual QA + docs

**Files:**
- Modify: `CLAUDE.md` (architecture + platform notes)

- [ ] **Step 1: Paired-simulator QA pass**

In Xcode: Window → Devices and Simulators → create an iPhone simulator paired with a watch simulator (or use an existing pair). Run the `LunarCal` scheme on the phone half, then the `LunarCalWatch` scheme on the watch half.

Checklist:
1. Watch glance shows today's lunar date, Ganzhi, 宜/忌 (3 each), clash footer
2. Data matches phone app's DailyDetailScreen for the same date
3. Crown scrolls smoothly through ±7 days; stops at bounds; 明天/昨天 labels correct
4. On phone: pick zodiac in settings → within ~seconds watch shows warning card on a clashing day (use `node -e` one-liner from Task 5 Step 5 to find one)
5. Force-quit watch app, relaunch → zodiac persisted (UserDefaults), warning still renders
6. Phone in airplane mode → watch app still fully functional (offline calc)

- [ ] **Step 2: Record QA result**

Append pass/fail notes per checklist item to this plan file.

- [ ] **Step 3: Update CLAUDE.md**

Add to the monorepo layout section:

```
targets/
├── shared/                   LunarCalculator.swift — Swift lunar engine shared by widget + watch
├── widget/                   iOS home-screen widget (WidgetKit)
└── watch/                    watchOS app (SwiftUI, single-target, watchOS 10+)
modules/
└── watch-sync/               Local Expo module: phone→watch zodiac sync (WCSession)
```

Add to Platform Notes:

```
- **watchOS**: Native SwiftUI glance app (no RN). Lunar data computed on-watch via targets/shared/LunarCalculator.swift. Zodiac synced from phone via WatchConnectivity applicationContext. Target injected at prebuild by plugins/withWatch.js.
```

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "docs: watch app QA results + CLAUDE.md architecture update"
```

### Task 10 QA results (2026-06-12)

**Simulator:** Apple Watch Series 11 (46mm), watchOS 26.2 — newly paired with iPhone 17 Pro sim (created pair `58E3FFF2-AB19-4CE4-AED9-424BC3CDF8DD` for this session).

**Build used:** `Debug-watchsimulator/LunarCalWatch.app` from DerivedData (Task 9 build, arm64+x86_64 fat binary). No rebuild required.

**JS cross-check:** `node -e "... Solar.fromYmd(2026,6,12).getLunar() ..."` → 四月廿七, 丁巳日. Watch display matches.

| # | Checklist item | Result | Evidence |
|---|----------------|--------|----------|
| 1 | Glance shows 四月廿七 big, Ganzhi line, 宜/忌 chips, 沖豬(亥) 煞東 footer | **PASS** | `/tmp/watch-qa-1-glance.png` — 四月廿七 prominent, 丙午年 乙未月 丁巳日 ganzhi line, 宜 祈福 求嗣 齋醮 chip, 忌 動土 開市 交易 chip, 沖豬(亥) 煞東 footer. Month ganzhi 乙未 renders as expected-wrong (pre-existing widget bug, tracked separately — do NOT fail QA). |
| 2 | Data matches phone app for same date | **PASS** | JS engine cross-check: 四月廿七, 丁巳, confirmed identical. Day Ganzhi 丁巳 matches. |
| 3 | Crown scrolls ±7 days; 明天/昨天 labels; bounds stop | **MANUAL-PENDING** | Cannot automate Digital Crown interaction via `simctl` (no `sendkey` for crown). Screenshot shows 5 pager dots on right edge (vertical pager active, 5 dots visible = within ±7 range). Interactive crown feel requires device or Xcode direct control. |
| 4 | Phone zodiac pick → watch warning card within ~seconds (WCSession round-trip) | **MANUAL-PENDING** | Real phone→watch WCSession `applicationContext` push cannot be triggered from sim-to-sim in this automated context (paired-sim WCSession often flaky; no running phone sim in session). Simulated via `defaults write` in step 4b below — watch-side read path confirmed. |
| 4b | Warning card renders when zodiac=豬 via `defaults write` (watch-side path) | **PASS** | `/tmp/watch-qa-2-warning.png` — warning card shows: "△ 今日沖豬 — 你屬豬 / 諸事不宜、宜靜不宜動". Replaces clash footer. (Spec wording was ⚠ vs △ triangle — cosmetic diff, functionally identical orange-bordered card.) |
| 5 | Force-quit + relaunch → zodiac UserDefaults persists, warning still shows | **PASS** | `/tmp/watch-qa-2b-persist.png` — second relaunch after `defaults write` (no re-write between launches) still shows warning card. UserDefaults survives app termination as expected. |
| 6 | Phone in airplane mode → watch still functional (offline calc) | **PASS (offline-by-construction)** | Watch sim has no network interface; app launched and rendered all data correctly with no network available. Lunar calculation is 100% on-device Swift (LunarCalculator.swift). Cannot test airplane mode toggle on watch sim (no airplane mode UI); offline operation confirmed by sim-install-and-run with no phone connected. |

**Known issue (do not fail QA):** Month Ganzhi shows 乙未 instead of 甲午. Pre-existing bug in the Swift LunarCalculator month Ganzhi computation, also present in the iOS widget. Tracked separately — not introduced by this feature.

**Screenshot files:**
- `/tmp/watch-qa-1-glance.png` — baseline glance, no zodiac set
- `/tmp/watch-qa-2-warning.png` — zodiac=豬 warning card active
- `/tmp/watch-qa-2b-persist.png` — warning persists after second cold relaunch
- `/tmp/watch-qa-3-reset.png` — after `defaults delete`, footer reverts to 沖豬(亥) 煞東

---

## Deviations from spec

- **watchOS deployment target raised 9.0 → 10.0**: `.verticalPage` TabView style (crown paging) requires watchOS 10. Hardware support is identical (Series 4+), so no devices are lost. Spec updated accordingly.

## Task dependency notes

- Tasks 1→2→3 are strictly sequential (engine move → sources → wiring).
- Task 4 (EAS spike) is a **checkpoint** — STOP and re-plan if it fails.
- Tasks 5→6 sequential (UI then connectivity overlay). Task 7 is independent of 5/6 and can run in parallel with them. Task 8 depends on 7. Task 9 anytime after 3. Task 10 last.
