module.exports = {
  env: { browser: true, es2020: true },
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  root: true,
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],

  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'airbnb-base',
    'prettier',
  ],

  rules: {
    'react/jsx-no-target-blank': 'off',
    'no-underscore-dangle': ['error', { allow: ['_count'] }],

    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
};
