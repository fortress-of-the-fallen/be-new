// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
   {
      ignores: [
         'eslint.config.mjs',
         'node_modules',
         'dist',
         'coverage',
         'build',
         'lib',
         'out',
         'test',
         'tests',
         'tests-e2e',
         'tests/unit',
      ],
   },
   eslint.configs.recommended,
   ...tseslint.configs.recommendedTypeChecked,
   eslintPluginPrettierRecommended,
   {
      languageOptions: {
         globals: {
            ...globals.node,
            ...globals.jest,
         },
         sourceType: 'commonjs',
         parserOptions: {
            projectService: true,
            tsconfigRootDir: import.meta.dirname,
         },
      },
   },
   {
      rules: {
         'no-multiple-empty-lines': ['warn', { max: 1, maxEOF: 0 }],
         '@typescript-eslint/no-base-to-string': 'off',
         '@typescript-eslint/no-unsafe-assignment': 'off',
         '@typescript-eslint/no-unsafe-call': 'off',
         '@typescript-eslint/no-unsafe-member-access': 'off',
         '@typescript-eslint/no-unsafe-return': 'warn',
         '@typescript-eslint/no-unsafe-argument': 'off',
         '@typescript-eslint/restrict-template-expressions': 'off',
         '@typescript-eslint/no-redundant-type-constituents': 'off',
         '@typescript-eslint/require-await': 'off',
         '@typescript-eslint/no-unused-vars': 'off',
         '@typescript-eslint/no-explicit-any': 'off',
         '@typescript-eslint/no-floating-promises': 'error',
         'padding-line-between-statements': 'off',
         'prettier/prettier': [
            'warn',
            {
               tabWidth: 3,
               useTabs: false,
               endOfLine: 'auto',
               printWidth: 100,
               singleQuote: true,
               semi: true,
               trailingComma: 'all',
               bracketSpacing: true,
               arrowParens: 'avoid',
            },
         ],
      },
   },
);
