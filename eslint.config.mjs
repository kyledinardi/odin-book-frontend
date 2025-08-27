import path from 'node:path';

import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import { globalIgnores } from 'eslint/config';
import { configs, plugins, rules } from 'eslint-config-airbnb-extended';
import { rules as prettierConfigRules } from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import tseslint from 'typescript-eslint';

const gitignorePath = path.resolve('.', '.gitignore');

const jsConfig = [
  { name: 'js/config', ...js.configs.recommended },
  plugins.stylistic,
  plugins.importX,
  ...configs.base.recommended,
  rules.base.importsStrict,
];

const reactConfig = [
  plugins.react,
  plugins.reactHooks,
  plugins.reactA11y,
  ...configs.react.recommended,
  rules.react.strict,
];

const typescriptConfig = [
  plugins.typescriptEslint,
  ...configs.base.typescript,

  ...tseslint.config(tseslint.configs.recommendedTypeChecked, {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  }),
];

const prettierConfig = [
  { name: 'prettier/plugin/config', plugins: { prettier: prettierPlugin } },
  { name: 'prettier/config', rules: { ...prettierConfigRules } },
];

const extraRules = {
  'react/jsx-filename-extension': 'off',
  'react/react-in-jsx-scope': 'off',

  'jsx-a11y/label-has-associated-control': [
    2,

    {
      labelComponents: [],
      labelAttributes: [],
      controlComponents: ['ThemeSwitch'],
      assert: 'both',
      depth: 25,
    },
  ],

  '@typescript-eslint/naming-convention': [
    'error',
    { selector: 'function', format: ['camelCase', 'PascalCase'] },
    { selector: 'typeLike', format: ['PascalCase'] },

    {
      selector: 'variable',
      format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
      leadingUnderscore: 'allow',
    },
  ],
};

export default [
  globalIgnores(['build', 'eslint.config.mjs']),
  includeIgnoreFile(gitignorePath),
  ...jsConfig,
  ...reactConfig,
  ...typescriptConfig,
  ...prettierConfig,
  { rules: extraRules },
];
