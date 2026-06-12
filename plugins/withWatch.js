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
      if (!fs.existsSync(dir)) {
        console.warn('[withWatch] source dir not found, watch target will be empty:', dir);
        continue;
      }
      for (const entry of fs.readdirSync(dir)) {
        const src = path.join(dir, entry);
        const dest = path.join(destDir, entry);
        if (fs.statSync(src).isDirectory()) {
          if (copiedDirs.includes(entry)) {
            console.warn(`[withWatch] directory collision: "${entry}". Later dir wins.`);
          }
          copyRecursive(src, dest);
          copiedDirs.push(entry);
        } else {
          if (copiedFiles.includes(entry)) {
            console.warn(`[withWatch] filename collision: "${entry}". Later dir wins.`);
          }
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

    // 3. Watch target. 'watch2_app' drives node-xcode's watch handling, which
    //    ALSO auto-creates the "Embed Watch Content" copy phase on the first
    //    target AND attempts to wire the main->watch target dependency (see
    //    node-xcode pbxProject.js addTarget). We must NOT duplicate those below.
    //    (The dependency only actually lands because we pre-create the dependency
    //    sections just below — see the node-xcode quirk note.)
    //
    //    The legacy watchapp2 product type
    //    ("com.apple.product-type.application.watchapp2") builds as a "Watch-Only
    //    Application Stub" that expects a separate WatchKit *extension* to supply
    //    the executable. With our Swift sources compiled directly into the app
    //    target, xcodebuild then errors with "Multiple commands produce
    //    .../LunarCalWatch.app/LunarCalWatch". So after letting node-xcode create
    //    the watch2_app scaffolding (group, copy phase, dependency), we patch the
    //    product type to the modern single-target watchOS application type. Paired
    //    with SDKROOT=watchos below (and the real target dependency, see quirk
    //    note) xcodebuild builds it for the watchOS SDK into Debug-watchsimulator,
    //    which is where the Embed Watch Content phase copies it from.
    //
    //    IMPORTANT node-xcode quirk: addTargetDependency() (called internally by
    //    addTarget, and again by us below) only writes anything when BOTH the
    //    PBXTargetDependency and PBXContainerItemProxy sections already exist in
    //    hash.project.objects (see node-xcode pbxProject.js line ~860). A fresh
    //    Expo prebuild pbxproj has neither, so the main->watch dependency is
    //    SILENTLY dropped. Without it, xcodebuild never builds the watch app for
    //    the watchOS SDK, and the Embed Watch Content copy phase fails with
    //    "Debug-watchsimulator/LunarCalWatch.app: No such file or directory".
    //    The widget extension gets away without a real dependency because it
    //    builds into the same iphonesimulator products dir; the watch is
    //    cross-SDK (watchsimulator) so the dependency is mandatory. We
    //    pre-create the sections so the dependency actually lands.
    //    These sections may already exist if withWidget ran first; the guards
    //    cover the standalone case too. (withWidget's own addTargetDependency
    //    silently no-ops without them — same node-xcode bug, unnoticed because
    //    the widget is same-SDK.)
    // Idempotency guard: skip if the watch target already exists in pbxproj.
    // CAVEAT: sources were already copied above, but a NEW file added to
    // targets/watch/ or targets/shared/ will NOT be registered in the pbxproj
    // on this skip path — run `expo prebuild -p ios --clean` after adding files.
    const existingTargets = xcodeProject.pbxNativeTargetSection();
    const alreadyAdded = Object.values(existingTargets).some(
      t => t && typeof t === 'object' && (t.name === WATCH_NAME || t.name === `"${WATCH_NAME}"`)
    );
    if (alreadyAdded) {
      console.log(`[withWatch] ${WATCH_NAME} target already exists, skipping pbxproj registration (new files need --clean)`);
      return config;
    }

    const objects = xcodeProject.hash.project.objects;
    if (!objects.PBXTargetDependency) objects.PBXTargetDependency = {};
    if (!objects.PBXContainerItemProxy) objects.PBXContainerItemProxy = {};

    const target = xcodeProject.addTarget(WATCH_NAME, 'watch2_app', WATCH_NAME, watchBundleId);
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

    // 5. Sources + files.
    //    node-xcode dedupes PBXFileReferences by `file.path` (see hasFile()).
    //    The widget plugin already registered a bare-path "LunarCalculator.swift"
    //    fileRef from targets/shared. If we add the watch's copy with the same
    //    bare path, addFile() returns null AND the existing fileRef gets pulled
    //    into the watch group — stealing the shared source from the widget
    //    target and breaking its build. So we register the watch's files with a
    //    GROUP-QUALIFIED relative path ("LunarCalWatch/<file>") to guarantee a
    //    distinct fileRef. The group itself has no path set in that case, but
    //    the per-file relative path keeps Xcode pointing at the right file on
    //    disk. We therefore create the group WITHOUT a path (above) is not an
    //    option since addTarget settings expect it — instead we pass the
    //    qualified path and clear the group's path so paths don't double up.
    const groupRelPrefix = `${WATCH_NAME}/`;
    for (const file of copiedFiles.filter(f => f.endsWith('.swift'))) {
      xcodeProject.addSourceFile(groupRelPrefix + file, { target: target.uuid }, groupKey);
    }
    xcodeProject.addFile(groupRelPrefix + 'Info.plist', groupKey);
    for (const dir of copiedDirs.filter(d => d.endsWith('.xcassets'))) {
      xcodeProject.addResourceFile(groupRelPrefix + dir, { target: target.uuid }, groupKey);
    }
    // The group's `path` (set by pbxCreateGroup to WATCH_NAME) would now double
    // up with the qualified file paths (LunarCalWatch/LunarCalWatch/<file>).
    // Drop the group path so the qualified file paths resolve from the project
    // root, matching where we physically copied the files.
    const watchGroup = xcodeProject.getPBXGroupByKey(groupKey);
    if (watchGroup && watchGroup.path) {
      delete watchGroup.path;
    }

    // 6. Build settings
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
          // Pin platforms to watchOS. Without this, a
          // com.apple.product-type.application target gets speculatively built
          // for the parent's iOS SDK (landing in Debug-iphonesimulator) which
          // breaks the Embed Watch Content copy that reads from
          // Debug-watchsimulator.
          SUPPORTED_PLATFORMS: '"watchsimulator watchos"',
          WATCHOS_DEPLOYMENT_TARGET: '10.0',
          TARGETED_DEVICE_FAMILY: '4',
          SWIFT_VERSION: '5.0',
          GENERATE_INFOPLIST_FILE: 'YES',
          INFOPLIST_FILE: `${WATCH_NAME}/Info.plist`,
          // WKApplication=YES lives in targets/watch/Info.plist (single-target
          // watchOS marker). Setting INFOPLIST_KEY_WKApplication here too is
          // redundant and can conflict with the explicit INFOPLIST_FILE, so it
          // is intentionally omitted.
          ASSETCATALOG_COMPILER_APPICON_NAME: 'AppIcon',
          CODE_SIGN_STYLE: 'Automatic',
          CURRENT_PROJECT_VERSION: '1',
          MARKETING_VERSION: '1.0',
          SKIP_INSTALL: 'YES',
          ENABLE_PREVIEWS: 'YES',
          LD_RUNPATH_SEARCH_PATHS: '"$(inherited) @executable_path/Frameworks"',
        });
        // Assumes all targets share one team; picks first non-watch config
        // (same pattern/weakness as withWidget).
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

    // NOTE: target dependency (main -> watch) and the "Embed Watch Content"
    // copy phase are BOTH created by addTarget('watch2_app') above. Adding
    // them again here would produce duplicate phases / dependencies, so we
    // deliberately do not.

    console.log(`✅ Added ${WATCH_NAME} watch app target`);
    return config;
  });

  return config;
}

module.exports = withWatch;
