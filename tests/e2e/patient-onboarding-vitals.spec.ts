import { test, expect } from '@playwright/test';

test('patient registration to first vital log', async ({ page }) => {
  const uniqueId = Date.now();
  const email = `patient+${uniqueId}@example.com`;
  const password = 'StrongPass123!';

  await page.goto('/register');
  await page.getByLabel('First name').fill('Asha');
  await page.getByLabel('Last name').fill('Patel');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByLabel('Confirm password').fill(password);
  await page.getByRole('button', { name: 'Create account' }).click();

  await page.waitForURL('**/onboarding');

  await page.getByLabel('Date of birth').fill('1990-12-31');
  await page.getByLabel('Phone number').fill('5551234567');
  await page.getByLabel('Timezone').fill('America/New_York');
  await page.getByLabel('Primary condition').fill('type2_diabetes');
  await page.getByRole('button', { name: 'Finish onboarding' }).click();

  await page.waitForURL('**/dashboard');

  await page.goto('/dashboard/vitals');
  await page.getByLabel('Value').fill('120');
  await page.getByLabel('Notes (optional)').fill('After breakfast');
  await page.getByRole('button', { name: 'Log vital' }).click();

  await expect(page.getByText('After breakfast')).toBeVisible();
});
