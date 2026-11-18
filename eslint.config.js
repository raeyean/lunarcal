const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  ...expoConfig,
  {
    ignores: ['node_modules/**', '.expo/**'],
  },
  {
    // eslint-config-expo 56 turned on the React Compiler rules from
    // eslint-plugin-react-hooks v7 as errors. The existing code predates them
    // (for example `useRef(new Animated.Value(0)).current` and syncing state
    // in effects), so they are warnings until that code is migrated.
    rules: {
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
    },
  },
]);
