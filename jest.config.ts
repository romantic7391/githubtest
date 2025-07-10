/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from 'jest';
import nextJest from 'next/jest.js';

/**
 * @see https://nextjs.org/docs/app/guides/testing/jest
 */
const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'jest-coverage',
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js',
    '^next/font/(.*)$': require.resolve('next/dist/build/jest/__mocks__/nextFontMock.js'),
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(test).[jt]s?(x)'],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/dist/', // 빌드 결과물 제외
    '<rootDir>/build/', // 빌드 결과물 제외
  ],
  // 모델 테스트를 위한 환경 변수 설정
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
};

export default createJestConfig(config);
