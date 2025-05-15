import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import pluginQuery from '@tanstack/eslint-plugin-query';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // ignores 설정 추가
  {
    ignores: [
      // node_modules 디렉토리 전체 제외
      'node_modules/',
      // .next 디렉토리 전체 제외
      '.next/',
      // 로그 파일 전체 제외
      '**/*.log',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
  ...pluginQuery.configs['flat/recommended'],
];

export default eslintConfig;
