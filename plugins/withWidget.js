const { withXcodeProject } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

const WIDGET_NAME = 'LunarCalWidgetExtension';

function withWidget(config) {
  config = withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;
    const projectRoot = config.modRequest.projectRoot;
    const platformRoot = config.modRequest.platformProjectRoot;
    const bundleId = config.ios?.bundleIdentifier || 'com.lunarcal';
    const widgetBundleId = `${bundleId}.widget`;

    // 1. Copy widget source files to ios build directory
    const widgetSrcDir = path.join(projectRoot, 'targets', 'widget');
    const widgetDestDir = path.join(platformRoot, WIDGET_NAME);

    if (!fs.existsSync(widgetDestDir)) {
      fs.mkdirSync(widgetDestDir, { recursive: true });
    }

    const allFiles = fs.readdirSync(widgetSrcDir);
    for (const file of allFiles) {
      const src = path.join(widgetSrcDir, file);
      const dest = path.join(widgetDestDir, file);
      if (fs.statSync(src).isFile()) {
        fs.copyFileSync(src, dest);
      }
    }

    // 2. Create a PBXGroup for the widget extension
    const widgetGroupKey = xcodeProject.pbxCreateGroup(WIDGET_NAME, WIDGET_NAME);

    // Add the group to the main project group
    const projectSection = xcodeProject.pbxProjectSection();
    const mainProjectKey = Object.keys(projectSection).find(
      k => !k.endsWith('_comment') && projectSection[k].mainGroup
    );
    const mainGroupId = projectSection[mainProjectKey].mainGroup;
    xcodeProject.addToPbxGroup(widgetGroupKey, mainGroupId);

    // 3. Add widget target
    const target = xcodeProject.addTarget(
      WIDGET_NAME,
      'app_extension',
      WIDGET_NAME,
      widgetBundleId
    );

    if (!target) {
      console.error('Failed to create widget target');
      return config;
    }

    // 4. Add build phases to the target
    xcodeProject.addBuildPhase([], 'PBXSourcesBuildPhase', 'Sources', target.uuid);
    xcodeProject.addBuildPhase([], 'PBXFrameworksBuildPhase', 'Frameworks', target.uuid);
    xcodeProject.addBuildPhase([], 'PBXResourcesBuildPhase', 'Resources', target.uuid);

    // 5. Add Swift source files to the sources build phase
    // Use just filename since the group already has the path set
    const swiftFiles = allFiles.filter(f => f.endsWith('.swift'));
    for (const file of swiftFiles) {
      xcodeProject.addSourceFile(
        file,
        { target: target.uuid },
        widgetGroupKey
      );
    }

    // 6. Add Info.plist and entitlements as file references (not source)
    xcodeProject.addFile(
      'Info.plist',
      widgetGroupKey
    );
    xcodeProject.addFile(
      'LunarCalWidgetExtension.entitlements',
      widgetGroupKey
    );

    // 7. Configure build settings for the widget target
    const configurations = xcodeProject.pbxXCBuildConfigurationSection();
    for (const key in configurations) {
      if (key.endsWith('_comment')) continue;
      const buildConfig = configurations[key];
      if (!buildConfig.buildSettings) continue;

      const bs = buildConfig.buildSettings;

      // Identify widget target configs by bundle identifier or product name
      if (
        bs.PRODUCT_BUNDLE_IDENTIFIER === widgetBundleId ||
        bs.PRODUCT_BUNDLE_IDENTIFIER === `"${widgetBundleId}"` ||
        bs.PRODUCT_NAME === `"${WIDGET_NAME}"` ||
        bs.PRODUCT_NAME === WIDGET_NAME
      ) {
        Object.assign(bs, {
          SWIFT_VERSION: '5.0',
          TARGETED_DEVICE_FAMILY: '"1,2"',
          IPHONEOS_DEPLOYMENT_TARGET: '17.0',
          CODE_SIGN_STYLE: 'Automatic',
          INFOPLIST_FILE: `${WIDGET_NAME}/Info.plist`,
          CODE_SIGN_ENTITLEMENTS: `${WIDGET_NAME}/LunarCalWidgetExtension.entitlements`,
          GENERATE_INFOPLIST_FILE: 'YES',
          CURRENT_PROJECT_VERSION: '1',
          MARKETING_VERSION: '1.0',
          SWIFT_EMIT_LOC_STRINGS: 'YES',
          SKIP_INSTALL: 'YES',
          LD_RUNPATH_SEARCH_PATHS: '"$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks"',
        });

        // Inherit DEVELOPMENT_TEAM from main app target
        if (!bs.DEVELOPMENT_TEAM) {
          for (const k2 in configurations) {
            if (k2.endsWith('_comment')) continue;
            const c2 = configurations[k2];
            if (c2.buildSettings?.DEVELOPMENT_TEAM && c2.buildSettings?.PRODUCT_NAME !== `"${WIDGET_NAME}"`) {
              bs.DEVELOPMENT_TEAM = c2.buildSettings.DEVELOPMENT_TEAM;
              break;
            }
          }
        }
      }
    }

    // 8. Add target dependency from main app to widget
    const mainTarget = xcodeProject.getFirstTarget().firstTarget;
    xcodeProject.addTargetDependency(mainTarget.uuid, [target.uuid]);

    // 9. Add "Embed App Extensions" copy files build phase
    const embedPhase = xcodeProject.addBuildPhase(
      [],
      'PBXCopyFilesBuildPhase',
      'Embed App Extensions',
      mainTarget.uuid,
      'app_extension'
    );

    if (embedPhase && embedPhase.buildPhase) {
      embedPhase.buildPhase.dstSubfolderSpec = 13; // PlugIns folder
      embedPhase.buildPhase.dstPath = '""';
    }

    console.log(`✅ Added ${WIDGET_NAME} extension target`);
    return config;
  });

  return config;
}

module.exports = withWidget;
