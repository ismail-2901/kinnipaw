import { test, expect } from '@playwright/test';

test.describe('KINNIPAW Web Smoke & Responsive Suite', () => {
  test('home page renders core branding and tagline', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /KINNIPAW/i })).toBeVisible();
    await expect(
      page.getByText(/One Platform\. Every Animal\. One Connected Ecosystem\./i)
    ).toBeVisible();
  });

  test('care assistant renders emergency banner and disclaimer', async ({ page }) => {
    await page.goto('/care-assistant');
    await expect(page.getByText(/Non-Diagnostic Pet Care Companion/i)).toBeVisible();
    await expect(page.getByText(/Emergency Veterinary Care Warning/i)).toBeVisible();
  });

  test('lost and found directory loads with dual toggle', async ({ page }) => {
    await page.goto('/lost-found');
    await expect(page.getByText(/Lost & Found Animals/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Lost Pets/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Found Animals/i })).toBeVisible();
  });

  test('rescue coordination page displays emergency hotline 10603', async ({ page }) => {
    await page.goto('/rescue');
    await expect(page.getByText(/Hotline 10603/i)).toBeVisible();
  });

  test('responsive 320px small screen has zero horizontal scroll overflow', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 600 });
    await page.goto('/');
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });
});
