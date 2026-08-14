import { test, expect } from '@playwright/test';
import { signIn } from './helpers';

test('login with demo CEO account', async ({ page }) => {
  await signIn(page);
  await expect(page).toHaveURL(/\/dashboard(?:\?|$)/);
});
