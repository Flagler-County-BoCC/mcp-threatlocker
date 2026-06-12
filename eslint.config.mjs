import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  eslint.configs.recommended,
  {
    files: ['src/**/*.ts', 'tests/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: { project: './tsconfig.json', ecmaVersion: 2022, sourceType: 'module' },
      globals: { ...globals.node },
    },
    plugins: { '@typescript-eslint': tseslint },
    rules: {
      ...tseslint.configs['recommended-type-checked'].rules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      'no-console': 'error',
      'no-debugger': 'error',
      'no-eval': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }],
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
    },
  },
  {
    // Relax rules for test files
    files: ['**/*.spec.ts', '**/*.test.ts', 'tests/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/require-await': 'off',
    },
  },
  {
    // Allow console.log in CLI action handlers
    files: ['src/commands/**/*.command.ts'],
    rules: { 'no-console': 'off' },
  },
  { ignores: ['dist/', 'coverage/', 'node_modules/', 'src/index.ts', 'tests/helpers/*.d.ts'] },
  prettier,
];
