// ESLint: correctness rules only. Formatting belongs to Prettier (`npm run format`), so every
// stylistic rule is switched off by eslint-config-prettier at the end.
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    { ignores: ['dist/', 'node_modules/', 'material/', 'claude_resume/', '.claude/'] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.ts'],
        languageOptions: {
            globals: { ...globals.browser, ...globals.node },
        },
        rules: {
            // Types that are only used as types must be imported as types: Node runs these files by
            // stripping types, and a value import of a type fails at runtime.
            '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' }],
            '@typescript-eslint/no-non-null-assertion': 'off',
            'no-empty': ['error', { allowEmptyCatch: true }],
        },
    },
    {
        // The preview runtime handles arbitrary learner values and patches browser globals.
        files: ['src/utils/renderer/runtimeBridgeRuntime.ts'],
        rules: { 'no-console': 'off' },
    },
    prettier,
);
