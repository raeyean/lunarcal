const { withEntitlementsPlist } = require('@expo/config-plugins');

const APP_GROUP = 'group.com.raeyean.LunarCal';

/**
 * Adds the App Group entitlement to the main app so it can share a
 * UserDefaults suite with the LunarCalWidgetExtension. The widget's own
 * entitlements file (targets/widget/LunarCalWidgetExtension.entitlements)
 * already declares the same group.
 */
function withAppGroup(config) {
  return withEntitlementsPlist(config, (config) => {
    const key = 'com.apple.security.application-groups';
    const existing = config.modResults[key] || [];
    if (!existing.includes(APP_GROUP)) {
      config.modResults[key] = [...existing, APP_GROUP];
    }
    return config;
  });
}

module.exports = withAppGroup;
