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
            // Unused parameters stay: they document the signature that callers rely on.
            '@typescript-eslint/no-unused-vars': [
                'error',
                { args: 'none', varsIgnorePattern: '^_', caughtErrors: 'none' },
            ],
            '@typescript-eslint/no-non-null-assertion': 'off',
            // `interface Dialog extends BorrowedMethods {}` is how a class adopts mixin methods.
            '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'with-single-extends' }],
            'no-empty': ['error', { allowEmptyCatch: true }],
            // `let value = null; try { value = … } catch { … }` is used on purpose where the fallback matters.
            'no-useless-assignment': 'off',
            // Escapes such as `<\/script>` and `\/` in patterns are kept as written: several of them are
            // inside template data and regular expressions that have been verified against the course.
            'no-useless-escape': 'off',
        },
    },
    {
        // Classes whose methods are spread over mixin objects merge the mixin types into the class
        // with a same-named interface (see docs/DEVELOPMENT.md, "Mixins").
        files: ['src/components/Editor.ts', 'src/components/Preview.ts', 'src/components/TheoryExerciseDialog.ts'],
        rules: { '@typescript-eslint/no-unsafe-declaration-merging': 'off' },
    },
    {
        // The preview runtime patches browser globals and wraps arbitrary learner functions.
        files: ['src/utils/renderer/runtimeBridgeRuntime.ts'],
        rules: { '@typescript-eslint/no-unsafe-function-type': 'off' },
    },
    prettier,
);
