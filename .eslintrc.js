module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    '@react-native-community',
    'prettier',
  ],
  plugins: ['react', '@typescript-eslint'],
  rules: {
    indent: ['error', 2, {SwitchCase: 1}],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
  },
  ignorePatterns: ['*.js'],
}
