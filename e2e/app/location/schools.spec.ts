import { test, expect } from '@playwright/test';

test('학교 목록 제목' , async ({ page }) => {
  const baseURL = `${process.env.NEXT_PUBLIC_URL}:${process.env.PORT}`;

  await page.goto(`${baseURL}/location/schools`);

  await expect(page.getByRole('heading', { name: '학교 목록' })).toBeVisible();
});