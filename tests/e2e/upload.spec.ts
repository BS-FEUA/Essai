import { test, expect } from '@playwright/test';
import path from 'path';
import { signIn } from './helpers';

test('upload a small file in documents', async ({ page }) => {
  await signIn(page);
  await page.goto('/documents');
  await expect(page).toHaveURL(/\/documents(?:\?|$)/);
  await page.getByText('Ajouter un document', { exact: true }).first().click();
  const filePath = path.resolve('public', 'hero-banner.png');
  const fileInput = page.locator('input[type="file"]');
  await fileInput.waitFor({ state: 'visible', timeout: 10000 });
  await fileInput.setInputFiles(filePath);
  await page.getByLabel('Titre *').fill('Document de test');
  await page.getByLabel('Description et usage *').fill('Téléversement automatisé');
  await Promise.all([
    page.waitForResponse(resp => resp.url().includes('/api/upload') && resp.status() === 201, { timeout: 15000 }),
    page.getByRole('button', { name: /téléverser/i }).click(),
  ]);
  await expect(page.getByText('Document de test')).toBeVisible();
});
