import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function settings(page: Page) {
  await page.goto('/#/settings');
  await expect(page.getByRole('heading', { name: 'Your workspace, your control.' })).toBeVisible();
}
async function noOverflow(page: Page) {
  const measurement = await page.evaluate(() => ({
    textOutside: (() => {
      const result: unknown[] = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const range = document.createRange();
        range.selectNodeContents(node);
        if (range.getBoundingClientRect().right > innerWidth + 1)
          result.push({
            text: node.textContent?.slice(0, 60),
            parent: node.parentElement?.className,
            right: range.getBoundingClientRect().right,
          });
      }
      return result.slice(0, 10);
    })(),
    route: location.hash,
    viewport: innerWidth,
    width: document.documentElement.scrollWidth,
    outside: [...document.querySelectorAll('body *')]
      .filter((node) => node.getBoundingClientRect().right > innerWidth + 1)
      .slice(0, 10)
      .map((node) => ({
        tag: node.tagName,
        class: node.className,
        text: node.textContent?.slice(0, 50),
        right: node.getBoundingClientRect().right,
      })),
  }));
  expect(measurement.width, JSON.stringify(measurement)).toBeLessThanOrEqual(measurement.viewport);
}
test('custom themes persist, update, switch modes and synchronize across tabs', async ({
  page,
  context,
}) => {
  await settings(page);
  await page.getByRole('button', { name: 'Create a custom theme' }).click();
  await page.getByLabel('Theme name', { exact: true }).fill('Warm paper');
  await page.getByLabel('Accent color', { exact: true }).fill('#fff9e0');
  await page.getByLabel('Page background', { exact: true }).fill('#fff9ef');
  await page.getByLabel('Text color', { exact: true }).fill('#242020');
  await page.getByRole('button', { name: 'Save and apply theme' }).click();
  await expect(page.getByText('Active theme: Warm paper', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('Active theme: Warm paper', { exact: true })).toBeVisible();
  expect(await page.locator('html').evaluate((node) => node.style.getPropertyValue('--bg'))).toBe(
    '#fff9ef',
  );
  const second = await context.newPage();
  await settings(second);
  await page.getByRole('button', { name: 'Edit theme Warm paper' }).click();
  await page.getByLabel('Theme name', { exact: true }).fill('Warm paper revised');
  await page.getByRole('button', { name: 'Save and apply theme' }).click();
  await expect(second.getByText('Active theme: Warm paper revised', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Dark', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('button', { name: 'Indigo', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Warm paper revised', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Delete theme Warm paper revised' }).click();
  await expect(second.getByText('Active theme: Warm paper revised', { exact: true })).toHaveCount(
    0,
  );
  await expect(page.getByRole('button', { name: 'Indigo', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('settings import is validated atomically and reset preserves projects and saved themes', async ({
  page,
}) => {
  await page.goto('/#/projects');
  await page.getByRole('button', { name: 'Load demo project', exact: true }).click();
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  await page.getByRole('button', { name: 'Create a custom theme' }).click();
  await page.getByLabel('Theme name', { exact: true }).fill('Saved workspace');
  await page.getByRole('button', { name: 'Save and apply theme' }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export settings' }).click();
  const exported = await download;
  const path = await exported.path();
  await page.getByRole('button', { name: 'Reset preferences' }).click();
  await expect(page.getByRole('button', { name: 'Saved workspace', exact: true })).toBeVisible();
  await expect(page.getByLabel('Active project')).toContainText('Atlas customer portal');
  await page.getByLabel('Import settings', { exact: true }).setInputFiles(path!);
  await expect(page.getByText('Active theme: Saved workspace', { exact: true })).toBeVisible();
  const before = await page.evaluate(() => localStorage.getItem('toolbox.appearance'));
  await page.getByLabel('Import settings', { exact: true }).setInputFiles({
    name: 'bad-settings.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"version":1,"themeId":"missing"}'),
  });
  await expect(page.getByRole('alert')).toContainText('This settings file is invalid.');
  expect(await page.evaluate(() => localStorage.getItem('toolbox.appearance'))).toBe(before);
  await page.getByRole('button', { name: 'Edit theme Saved workspace' }).click();
  await page.getByLabel('Text color', { exact: true }).fill('#ffffff');
  await page.getByRole('button', { name: 'Save and apply theme' }).click();
  expect(await page.evaluate(() => localStorage.getItem('toolbox.appearance'))).toBe(before);
});

test('large text and accessibility controls reflow at desktop, tablet and mobile sizes in both languages', async ({
  page,
}) => {
  await settings(page);
  await page.getByRole('slider', { name: 'Text size' }).fill('200');
  await page.getByLabel('Interface font').selectOption('sans');
  await page.getByLabel('Contrast', { exact: true }).selectOption('high');
  await page.getByLabel('Motion', { exact: true }).selectOption('reduce');
  await page.getByLabel('Relaxed text spacing').check();
  await page.getByLabel('Larger controls').check();
  await page.getByLabel('Underline links', { exact: true }).check();
  await page.getByLabel('Stronger keyboard focus').check();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduce');
  await expect(page.locator('html')).toHaveAttribute('data-contrast', 'high');
  expect(await page.locator('body').evaluate((node) => getComputedStyle(node).fontSize)).toBe(
    '28px',
  );
  for (const language of ['en', 'fr']) {
    await page
      .getByLabel(language === 'en' ? 'Application language' : 'Application language')
      .selectOption(language);
    for (const [width, height] of [
      [1920, 1080],
      [1024, 768],
      [768, 1024],
      [390, 844],
      [360, 800],
      [430, 932],
      [320, 568],
    ]) {
      await page.setViewportSize({ width: width!, height: height! });
      await noOverflow(page);
    }
    await page.reload();
  }
  await expect(page.locator('html')).toHaveAttribute('data-large-text', 'true');
  await page.getByLabel('Langue de l’application', { exact: true }).selectOption('en');
  await page.goto('/#/projects');
  await page.getByRole('button', { name: 'Load demo project', exact: true }).click();
  for (const width of [1024, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of [
      '/',
      '/decisions',
      '/scope',
      '/stories',
      '/traceability',
      '/reports',
      '/brands',
      '/settings',
    ]) {
      await page.goto(`/#${route}`);
      await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toBeVisible();
      await noOverflow(page);
    }
  }
  await page.goto('/#/decisions');
  await page.getByRole('button', { name: 'New decision', exact: true }).click();
  const dialogSize = await page
    .getByRole('dialog')
    .evaluate((node) => ({ width: node.clientWidth, scrollWidth: node.scrollWidth }));
  expect(dialogSize.scrollWidth).toBeLessThanOrEqual(dialogSize.width);
  await page.keyboard.press('Escape');
  await page.goto('/#/settings');
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(result.violations).toEqual([]);
});

test('device settings and the generated raster identity work without remote assets', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await settings(page);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduce');
  await expect(page.locator('.brand-mark')).toHaveAttribute('src', /\.webp$/);
  expect(
    await page
      .locator('.brand-mark')
      .evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth === 128),
  ).toBe(true);
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  for (const mode of ['Light', 'Dark']) {
    await page.getByRole('button', { name: mode, exact: true }).click();
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(result.violations).toEqual([]);
  }
});
