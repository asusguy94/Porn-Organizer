module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  parserOptions: { project: true },
  plugins: ['react-refresh'],
  rules: {
    // Common eslint
    'import/no-anonymous-default-export': 'off',
    eqeqeq: 'warn',
    'no-duplicate-imports': 'warn',

    // Typescript Eslint
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-confusing-void-expression': 'off',
    '@typescript-eslint/unified-signatures': 'off',
    '@typescript-eslint/no-unnecessary-condition': 'error',

    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }]
  }
}
