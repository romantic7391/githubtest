import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import pluginQuery from '@tanstack/eslint-plugin-query';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // 1. 무시할 파일 및 디렉토리 설정
  {
    ignores: [
      // node_modules 디렉토리 전체 제외
      'node_modules/',
      // ESLint가 package.json을 직접 린트하지 않도록 설정
      'package.json',
      // .next 디렉토리 전체 제외
      '.next/',
      // Next.js 자동 생성 파일 제외
      'next-env.d.ts',
      // jest 리포트 제외
      'jest-coverage/**',
      // 로그 파일 전체 제외
      '**/*.log',
      // 기타 캐시 파일 전체 제외
      '_/',
    ],
  },

  // 2. Next.js 기본 설정 (FlatCompat 사용)
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  // 3. Tanstack Query 설정
  // 참고: https://tanstack.com/query/latest/docs/eslint/eslint-plugin-query
  {
    plugins: {
      '@tanstack/query': pluginQuery,
    },
    rules: {
      '@tanstack/query/exhaustive-deps': 'error',
      '@tanstack/query/no-rest-destructuring': 'warn',
      '@tanstack/query/stable-query-client': 'error',
      '@tanstack/query/no-unstable-deps': 'warn',
      '@tanstack/query/infinite-query-property-order': 'warn',
      '@tanstack/query/no-void-query-fn': 'error',
    },
  },

  // 4. Prettier 설정 (가장 마지막에 추가)
  // 참고: https://github.com/prettier/eslint-plugin-prettier?tab=readme-ov-file#configuration-new-eslintconfigjs
  // - eslint-plugin-prettier 등록
  // - prettier/prettier 규칙 적용
  // - eslint-config-prettier 내용 적용
  eslintPluginPrettierRecommended,
];

export default eslintConfig;
