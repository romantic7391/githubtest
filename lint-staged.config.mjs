/**
 * @type {import('lint-staged').Configuration}
 */
const config = {
  // JavaScript, TypeScript 파일에 대해 Prettier 및 ESLint 실행
  '*.{js,jsx,ts,tsx}': ['pnpm run prettier', 'pnpm run lint'],
  // 그 외 파일에 대해 Prettier 실행
  '*.{json,css,scss,md,html}': ['pnpm run prettier'],
};

export default config;
