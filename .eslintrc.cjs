module.exports = {
  env: { browser: true, es2020: true },
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  root: true,
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  settings: { react: { version: '18.3' } },
  plugins: ['react-refresh'],
  rules: { 'no-underscore-dangle': ['error', { allow: ['_count'] }] },

  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'airbnb-base',
    'prettier',
  ],
};
