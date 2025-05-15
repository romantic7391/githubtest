/**
 * @type {import('lint-staged').Configuration}
 */
const config = {
  '*.{js,jsx,ts,tsx,json,css,md,html}': ['pnpm run prettier'],
};

export default config;
