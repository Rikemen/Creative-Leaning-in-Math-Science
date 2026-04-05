import js from '@eslint/js';
import globals from 'globals';
import { p5Globals } from './p5-globals.mjs';

export default [
  // 1. まずESLintの推奨設定を読み込む
  js.configs.recommended,

  {
    files: ['src/**/*.{js,mjs,cjs}', '**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...p5Globals
      }
    },
    rules: {
      // 2. 個別のルール設定（警告ではなく「エラー」にしたい場合）
      'no-unused-vars': 'error',
      'no-console': 'warn'
    }
  }
];
