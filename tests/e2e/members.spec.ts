import { test, expect } from '@playwright/test';
import { signIn } from './helpers';

test('open members page and check list', async ({ page }) => {
  await signIn(page);
  await page.goto('/members');
  await expect(page).toHaveURL(/\/members(?:\?|$)/);
  await expect(page.getByRole('heading', { name: /membres/i })).toBeVisible();
  await expect(page.locator('table')).toBeVisible();
});
