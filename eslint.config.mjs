import path from 'node:path';
import { fileURLToPath } from 'node:url';

import js from '@eslint/js';
import globals from 'globals';
import { FlatCompat } from '@eslint/eslintrc';
import perfectionist from 'eslint-plugin-perfectionist';
import unusedImports from 'eslint-plugin-unused-imports';

import tsParser from '@typescript-eslint/parser';
import tsEslintPlugin from '@typescript-eslint/eslint-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.extends('plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'),
  {
    plugins: {
      '@typescript-eslint': tsEslintPlugin,
      'unused-imports': unusedImports,
      perfectionist: perfectionist,
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: 'module',
      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error'],
      'require-await': 'off',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'CallExpression[callee.object.name=configService][callee.property.name=/^(get|getOrThrow)$/]:not(:has([arguments.1] Property[key.name=infer][value.value=true])), CallExpression[callee.object.property.name=configService][callee.property.name=/^(get|getOrThrow)$/]:not(:has([arguments.1] Property[key.name=infer][value.value=true]))',
          message:
            'Add "{ infer: true }" to configService.get() for correct typechecking. Example: configService.get("database.port", { infer: true })',
        },
        {
          selector: 'CallExpression[callee.name=it][arguments.0.value!=/^should/]',
          message: '"it" should start with "should"',
        },
      ],
      // Report unused imports
      'unused-imports/no-unused-imports': 'error',

      // Report unused variables, but ignore those starting with _
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      // Example: sort imports
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'line-length',
          order: 'asc',
          groups: [
            'builtin',
            'external',
            'project',
            'config',
            'mt5_mapper',
            'tl_mapper',
            'ct_mapper',
            'dx_mapper',
            'models',
            'types',
            'services',
            'dtos',
          ],
          customGroups: [
            {
              groupName: 'project',
              elementNamePattern: ['@crm/.+'],
            },
            {
              groupName: 'config',
              elementNamePattern: ['.+\\.config'],
            },
            {
              groupName: 'services',
              elementNamePattern: ['.+\\.service'],
            },
            {
              groupName: 'mt5_mapper',
              elementNamePattern: ['.+mt5.+\\.mapper'],
            },
            {
              groupName: 'tl_mapper',
              elementNamePattern: ['.+tl.+\\.mapper'],
            },
            {
              groupName: 'ct_mapper',
              elementNamePattern: ['.+ct.+\\.mapper'],
            },
            {
              groupName: 'dx_mapper',
              elementNamePattern: ['.+dx.+\\.mapper'],
            },
            {
              groupName: 'models',
              elementNamePattern: ['.+models.?'],
            },
            {
              groupName: 'types',
              elementNamePattern: ['.+types.+'],
            },
            {
              groupName: 'dtos',
              elementNamePattern: ['.+\\.dto'],
            },
          ],
          newlinesBetween: 1,
        },
      ],
      'perfectionist/sort-named-imports': [
        'error',
        {
          type: 'line-length',
          order: 'asc',
        },
      ],
    },
  },
];
