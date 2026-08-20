import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Legitimate on-mount data fetching (loading state updated asynchronously)
      // and conditional-mount dialog state are valid patterns for this app.
      'react-hooks/set-state-in-effect': 'off',
      // Auth context intentionally exports a component and a hook together.
      'react-refresh/only-export-components': 'off',
    },
  },
])
