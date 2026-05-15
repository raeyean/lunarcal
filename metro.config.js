const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Let Metro watch the packages/ directory so workspace symlinks resolve.
config.watchFolders = [
  ...(config.watchFolders ?? []),
  path.resolve(__dirname, 'packages'),
];

// Ensure node_modules at repo root are searched for workspace packages.
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

module.exports = config;
