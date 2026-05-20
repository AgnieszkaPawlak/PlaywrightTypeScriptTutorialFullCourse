import { test, expect } from '@playwright/test';
import { truncate } from 'fs/promises';

/**
 * Author Testers Talk
 * @PlaywrightWithJenkins — stable site for CI (YouTube blocks headless Firefox/Chrome with cookies/camera).
 * For YouTube codegen practice, run without --grep or use Chapter02 tests.
 */
test('Codegen test case', { tag: ['@PlaywrightWithJenkins'] }, async ({ page }) => {
  await page.goto('https://bakkappan.github.io/Testers-Talk-Practice-Site', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
  await expect(page.locator('#siteHeader')).toContainText(
    'Testers Talk: A Practice Space for Passionate QA Minds'
  );
});

/**
 * Author Testers Talk
 */
test('Test 2 will fail', { tag: ['@PlaywrightWithJenkins'] }, async ({ page }) => {
  // await page.goto('https://www.youtube.com/@testerstalk', { waitUntil: 'domcontentloaded', timeout: 30000 });
  expect(true).toBe(false);
});
