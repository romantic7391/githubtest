import { test, expect } from '@playwright/test';

test('제목 확인', async ({ page }) => {
  const baseURL = `${process.env.NEXT_PUBLIC_URL}:${process.env.PORT}`;

  await page.goto(`${baseURL}`);

  await expect(page.getByRole('heading', { name: '공기질 관리자페이지' })).toBeVisible();
});