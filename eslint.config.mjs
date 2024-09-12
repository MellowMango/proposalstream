import globals from 'globals';
import pluginJs from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginJest from 'eslint-plugin-jest';

export default [
  {
    languageOptions: {
      ecmaVersion: 2021, // ECMAScript version
      sourceType: 'module', // Use ES Modules
      globals: {
        ...globals.browser, // Include browser globals
        ...globals.node, // Include Node.js globals if needed
        ...globals.jest, // Include Jest globals
      },
    },
    plugins: {
      prettier: pluginPrettier, // Prettier plugin for ESLint
      jest: pluginJest, // Jest plugin for ESLint
    },
    rules: {
      ...pluginJs.configs.recommended.rules, // Recommended rules from @eslint/js
      'prettier/prettier': 'error', // Integrate Prettier rules as ESLint errors
    },
    env: {
      'jest/globals': true, // Tell ESLint to recognize Jest global variables
    },
  },
  pluginJs.configs.recommended,
  prettierConfig, // Use Prettier config to disable conflicting ESLint rules
];
