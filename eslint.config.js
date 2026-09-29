const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      'dist/**',
      '.expo/**',
      '.next/**',
      'apps/web/**',
      'packages/**',
      'supabase/**',
    ],
  },
]);
