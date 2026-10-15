import { expect, Page } from '@playwright/test';

const DEMO_EMAIL = 'ceo@bslokossa.bj';
const DEMO_PW = 'demo1234';

export async function signIn(page: Page) {
  await page.goto('/login');
  // The form is a Client Component; wait for React to hydrate before filling
  // its controlled inputs, otherwise a fast test can submit empty state.
  await page.waitForTimeout(500);
  const email = page.locator('input[name="email"], input[type="email"], input#email, input[placeholder*="email"], input[placeholder*="Email"]');
  await email.first().waitFor({ timeout: 10000 });
  await email.first().fill(DEMO_EMAIL);
  const pass = page.locator('input[name="password"], input[type="password"], input#password, input[placeholder*="mot"], input[placeholder*="password"]');
  await pass.first().fill(DEMO_PW);
  await page.getByTestId('login-submit').click();
  await expect(page).toHaveURL(/\/dashboard(?:\?|$)/, { timeout: 15_000 });
}

