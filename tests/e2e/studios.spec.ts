import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import ExcelJS from 'exceljs';
import { createHash } from 'node:crypto';

async function demo(page: Page) {
  await page.goto('/#/projects');
  await page.getByRole('button', { name: /^(Load|Open) demo project$/ }).click();
  await expect(page.getByLabel('Active project')).toContainText('Atlas customer portal');
}
const viewports = [
  [1920, 1080],
  [3440, 1440],
  [1440, 900],
  [1366, 768],
  [1024, 768],
  [768, 1024],
  [390, 844],
  [360, 800],
  [430, 932],
] as const;
for (const [width, height] of viewports) {
  test(`all tools remain usable at ${width}x${height} in EN and FR`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width, height });
    await demo(page);
    for (const language of ['en', 'fr']) {
      await page.goto('/#/settings');
      await page
        .getByLabel(language === 'en' ? 'Application language' : 'Application language', {
          exact: true,
        })
        .selectOption(language);
      for (const route of [
        '/',
        '/decisions',
        '/scope',
        '/stories',
        '/traceability',
        '/reports',
        '/brands',
        '/projects',
        '/settings',
      ]) {
        await page.goto(`/#${route}`);
        await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toBeVisible();
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          `${width} ${language} ${route}`,
        ).toBe(true);
        const main = await page.getByRole('main').boundingBox();
        expect(main!.x).toBeGreaterThanOrEqual(0);
        expect(main!.x + main!.width).toBeLessThanOrEqual(width + 1);
        if (route === '/') {
          const overlaps = await page.locator('.workspace-tool').evaluateAll(
            (cards) =>
              cards.filter((card) => {
                const counter = card.querySelector('.workspace-tool-count small'),
                  action = card.querySelector('.workspace-tool-action');
                if (!counter || !action) return false;
                const range = globalThis.document.createRange();
                range.selectNodeContents(counter);
                const a = range.getBoundingClientRect(),
                  b = action.getBoundingClientRect();
                return a.bottom > b.top && a.top < b.bottom && a.right > b.left && a.left < b.right;
              }).length,
          );
          expect(
            overlaps,
            `${width} ${language}: tool counters must not collide with actions`,
          ).toBe(0);
        }
        if (route === '/reports') await expect(page.locator('.report-page-preview')).toBeVisible();
        if (route === '/brands')
          await expect(
            page.getByRole('region', {
              name: language === 'fr' ? 'Aperçu du document en direct' : 'Live document preview',
            }),
          ).toBeVisible();
      }
      if (width <= 760) {
        const trigger = page.getByRole('button', {
          name: language === 'fr' ? 'Ouvrir la navigation' : 'Open navigation',
        });
        await trigger.click();
        await expect(page.locator('.mobile-close')).toBeFocused();
        const footer = page.locator('.sidebar-footer a').last();
        await footer.focus();
        await expect(footer).toBeFocused();
        const box = await footer.boundingBox();
        expect(box!.y + box!.height).toBeLessThanOrEqual(height + 1);
        await page.keyboard.press('Tab');
        await expect(page.locator('.sidebar .brand')).toBeFocused();
        await page.keyboard.press('Escape');
        await expect(trigger).toBeFocused();
        await trigger.click();
        await page.locator('.mobile-overlay').click({ position: { x: width - 8, y: 20 } });
        await expect(trigger).toBeFocused();
      } else {
        const footer = page.locator('.sidebar-footer a').last();
        await footer.scrollIntoViewIfNeeded();
        const box = await footer.boundingBox();
        expect(box!.y + box!.height).toBeLessThanOrEqual(height + 1);
      }
      await page.goto('/#/decisions');
      await page
        .getByRole('button', {
          name: language === 'fr' ? 'Nouvelle décision' : 'New decision',
          exact: true,
        })
        .click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect(
        page.getByLabel(language === 'fr' ? 'Titre de la décision' : 'Decision title'),
      ).toBeFocused();
      const submit = dialog.getByRole('button', {
        name: language === 'fr' ? 'Créer la décision' : 'Create decision',
        exact: true,
      });
      await submit.scrollIntoViewIfNeeded();
      const box = await submit.boundingBox();
      expect(box!.y + box!.height).toBeLessThanOrEqual(height + 1);
      await page.keyboard.press('Escape');
      if (language === 'en') {
        await page.goto('/#/settings');
        await page.getByLabel('Application language', { exact: true }).selectOption('en');
      }
    }
    await writeFile(
      `test-results/viewport-${width}x${height}.json`,
      JSON.stringify(
        {
          width,
          height,
          languages: ['en', 'fr'],
          routes: [
            '/',
            '/decisions',
            '/scope',
            '/stories',
            '/traceability',
            '/reports',
            '/brands',
            '/projects',
            '/settings',
          ],
          passed: true,
          checkedAt: new Date().toISOString(),
          buildHash: createHash('sha256')
            .update(await readFile('dist/index.html'))
            .digest('hex'),
        },
        null,
        2,
      ),
    );
  });
}

async function createBrand(page: Page) {
  await page.goto('/#/brands');
  await page.getByLabel('Profile name', { exact: true }).fill('Atlas brand');
  await page.getByLabel('Company name', { exact: true }).fill('Atlas Example');
  const png = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 80;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#4338ca';
    ctx.fillRect(0, 0, 300, 80);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.fillText('ATLAS', 24, 54);
    return canvas.toDataURL('image/png').split(',')[1]!;
  });
  await page.getByLabel('Company logo', { exact: true }).setInputFiles({
    name: 'atlas.png',
    mimeType: 'image/png',
    buffer: Buffer.from(png, 'base64'),
  });
  await expect(page.locator('.document-logo')).toBeVisible();
  await page.getByLabel('Palette applies to').selectOption('accent');
  await page.getByRole('button', { name: 'Use color #0f766e', exact: true }).click();
  await page.getByLabel('Visual picker: Primary color', { exact: true }).fill('#1d4ed8');
  await page.getByRole('combobox', { name: 'Heading font', exact: true }).selectOption('Georgia');
  await page.getByRole('combobox', { name: 'Subtitle font', exact: true }).selectOption('Arial');
  await page
    .getByRole('combobox', { name: 'Document template', exact: true })
    .selectOption('executive');
  await page.getByRole('button', { name: 'Save brand profile', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Brand profile saved.');
}
test('brand profiles persist, duplicate, delete, validate logos and survive backup restoration', async ({
  page,
}) => {
  await demo(page);
  await createBrand(page);
  await page.reload();
  await expect(page.getByLabel('Profile name', { exact: true })).toHaveValue('Atlas brand');
  await page.getByLabel('Profile name', { exact: true }).fill('');
  await page.getByRole('button', { name: 'Save brand profile', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Check the profile name');
  await page.getByLabel('Profile name', { exact: true }).fill('Atlas brand');
  await page.getByLabel('Company logo', { exact: true }).setInputFiles({
    name: 'forged.png',
    mimeType: 'image/png',
    buffer: Buffer.from('<svg onload="alert(1)"/>'),
  });
  await expect(page.getByRole('alert')).toContainText('Choose a real PNG');
  await page.getByRole('button', { name: 'Duplicate profile', exact: true }).click();
  await page.getByRole('button', { name: 'Save brand profile', exact: true }).click();
  await expect(page.getByLabel('Saved profiles').locator('option')).toHaveCount(3);
  await page.getByRole('button', { name: 'Delete profile', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(page.getByLabel('Saved profiles').locator('option')).toHaveCount(2);
  await page.goto('/#/settings');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Back up all projects', exact: true }).click();
  const download = await downloadPromise;
  const text = await readFile((await download.path())!, 'utf8');
  expect(JSON.parse(text).projects[0].brands[0].name).toBe('Atlas brand');
  await page.getByLabel('Restore from JSON', { exact: true }).setInputFiles({
    name: 'backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(text),
  });
  await page.getByRole('button', { name: 'Restore as new copies', exact: true }).click();
  await page.goto('/#/brands');
  await expect(page.getByLabel('Profile name', { exact: true })).toHaveValue('Atlas brand');
  await expect(page.locator('.document-logo')).toBeVisible();
});

test('Report Studio produces real local PDF, editable PPTX, XLSX, Markdown, JSON and CSV', async ({
  page,
}, testInfo) => {
  test.setTimeout(120_000);
  await demo(page);
  await createBrand(page);
  const external: string[] = [];
  page.on('request', (r) => {
    if (
      !r.url().startsWith('http://127.0.0.1:4173/') &&
      !r.url().startsWith('blob:') &&
      !r.url().startsWith('data:')
    )
      external.push(r.url());
  });
  await page.goto('/#/reports');
  await page.getByRole('button', { name: '4. Customize', exact: true }).click();
  await page
    .getByLabel('Report title', { exact: true })
    .fill('Atlas review · décisions et impacts');
  await page
    .getByLabel('Introduction', { exact: true })
    .fill('A traceable review of the fictional Atlas project.');
  await page.getByRole('button', { name: '5. Preview', exact: true }).click();
  await page.getByRole('button', { name: 'Preview actual PDF', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Open rendered PDF' })).toBeVisible({
    timeout: 30_000,
  });
  const artifacts = 'test-results/document-artifacts';
  await mkdir(artifacts, { recursive: true });
  for (const format of ['pdf', 'pptx', 'xlsx', 'markdown', 'json', 'csv']) {
    await page.getByRole('button', { name: '3. Choose document', exact: true }).click();
    await page.getByRole('combobox', { name: 'Export format', exact: true }).selectOption(format);
    await page.getByRole('button', { name: '6. Generate', exact: true }).click();
    const pending = page.waitForEvent('download');
    await page
      .getByRole('button', { name: `Download ${format.toUpperCase()}`, exact: true })
      .click();
    const download = await pending;
    const bytes = await readFile((await download.path())!);
    const path = `${artifacts}/atlas.${format === 'markdown' ? 'md' : format}`;
    await writeFile(path, bytes);
    await testInfo.attach(format, { path });
    if (format === 'pdf') {
      const pdf = await PDFDocument.load(bytes);
      expect(pdf.getPageCount()).toBeGreaterThan(3);
      expect(pdf.getTitle()).toContain('décisions');
      const objects = pdf.context
        .enumerateIndirectObjects()
        .map(([, o]) => o.toString())
        .join('');
      expect(objects).toContain('/Subtype /Image');
    }
    if (format === 'pptx') {
      const zip = await JSZip.loadAsync(bytes);
      const slides = Object.keys(zip.files).filter((p) => /^ppt\/slides\/slide\d+\.xml$/.test(p));
      expect(slides.length).toBeGreaterThan(3);
      const xml = (await Promise.all(slides.map((p) => zip.file(p)!.async('string')))).join('');
      const text = [...xml.matchAll(/<a:t>(.*?)<\/a:t>/gs)].map((m) => m[1]).join(' ');
      expect(text.includes('décisions et impacts')).toBe(true);
      expect(xml).toContain('<a:t>');
      expect(xml).toContain('1D4ED8');
      expect(Object.keys(zip.files).some((p) => p.startsWith('ppt/media/'))).toBe(true);
    }
    if (format === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(bytes as never);
      expect(workbook.worksheets[0]!.getCell('A1').value).toContain('Atlas review');
      expect(workbook.worksheets[0]!.rowCount).toBeGreaterThan(10);
    }
    if (format === 'json') {
      const data = JSON.parse(bytes.toString());
      expect(data.sections.some((s: { key: string }) => s.key === 'scope')).toBe(true);
      expect(data.projectId).toMatch(/-/);
    }
    if (format === 'markdown') expect(bytes.toString()).toContain('Sources:');
    if (format === 'csv') expect(bytes.toString()).toContain('"Sources"');
  }
  expect(external).toEqual([]);
  await page.getByRole('button', { name: '3. Choose document', exact: true }).click();
  await page.getByRole('combobox', { name: 'Report language', exact: true }).selectOption('fr');
  await page.getByRole('button', { name: '4. Customize', exact: true }).click();
  await page.getByLabel('Report title', { exact: true }).fill('Synthèse du projet Atlas');
  for (const format of ['pdf', 'pptx']) {
    await page.getByRole('button', { name: '3. Choose document', exact: true }).click();
    await page.getByRole('combobox', { name: 'Export format', exact: true }).selectOption(format);
    await page.getByRole('button', { name: '6. Generate', exact: true }).click();
    const pending = page.waitForEvent('download');
    await page
      .getByRole('button', { name: `Download ${format.toUpperCase()}`, exact: true })
      .click();
    const bytes = await readFile((await (await pending).path())!);
    const path = `${artifacts}/atlas-fr.${format}`;
    await writeFile(path, bytes);
    await testInfo.attach(`${format}-fr`, { path });
    if (format === 'pdf')
      expect((await PDFDocument.load(bytes)).getTitle()).toBe('Synthèse du projet Atlas');
    else {
      const zip = await JSZip.loadAsync(bytes);
      const slides = Object.keys(zip.files).filter((p) => /^ppt\/slides\/slide\d+\.xml$/.test(p));
      const xml = (await Promise.all(slides.map((p) => zip.file(p)!.async('string')))).join('');
      expect(xml.includes('Synthèse exécutive')).toBe(true);
    }
  }
});

test('quick capture preserves a draft and duplicates require explicit review', async ({ page }) => {
  await demo(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Quick capture', exact: true }).click();
  await page.getByLabel('Title', { exact: true }).fill('Meeting capture');
  await page
    .getByLabel('Source notes', { exact: true })
    .fill('We discussed a possible replacement. Agreement remains open.');
  await page.getByRole('button', { name: 'Save capture draft', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Draft saved');
  await page.keyboard.press('Escape');
  await page.reload();
  await page.getByRole('button', { name: 'Resume capture draft', exact: true }).click();
  await expect(page.getByLabel('Source notes', { exact: true })).toHaveValue(
    'We discussed a possible replacement. Agreement remains open.',
  );
  await page.getByRole('button', { name: 'Create for review', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Meeting capture', exact: true })).toBeVisible();
  await expect(page.locator('.record-meta').first()).toContainText('Proposed');
  await page.getByRole('button', { name: 'Duplicate as proposal', exact: true }).click();
  await page.getByRole('button', { name: 'Create decision', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Meeting capture (copy)', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.related-section')).toContainText('0');
});

test('explicit acceptance scenarios cover requirements and remain linked after reload', async ({
  page,
}) => {
  await demo(page);
  await page.goto('/#/stories');
  await page.getByRole('button', { name: /Story 01/ }).click();
  await page.getByLabel('Requirement to verify').fill('Only authorized records are exported.');
  await page.getByRole('button', { name: 'Add requirement', exact: true }).click();
  await expect(page.getByText('No complete scenario linked', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Add scenario', exact: true }).click();
  await page.getByLabel('Scenario category').selectOption('permission');
  await page.getByLabel('Given').fill('An authenticated account owner');
  await page.getByLabel('When').fill('They request an export');
  await page.getByLabel('Then').fill('Only their authorized records are returned');
  await page
    .getByRole('checkbox', { name: 'Only authorized records are exported.', exact: true })
    .check();
  await page.getByRole('button', { name: 'Save scenario', exact: true }).click();
  await expect(page.getByText('Linked to 1 complete scenario', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('Linked to 1 complete scenario', { exact: true })).toBeVisible();
  await page.getByLabel('Requirement to verify').fill('The export contains column headings.');
  await page.getByRole('button', { name: 'Add requirement', exact: true }).click();
  await expect(page.getByLabel('Requirement to verify')).toHaveValue('');
  await page.getByLabel('Requirement to verify').fill('An empty account is handled explicitly.');
  await page.getByRole('button', { name: 'Add requirement', exact: true }).click();
  await expect(
    page.getByText('An empty account is handled explicitly.', { exact: true }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Prepare Refinement Pack', exact: true }).click();
  await expect(page.getByLabel('Report type')).toHaveValue('story');
});

test('studios pass selected automated WCAG rules in both languages and themes', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await demo(page);
  for (const language of ['en', 'fr']) {
    await page.goto('/#/settings');
    await page
      .getByLabel(language === 'en' ? 'Application language' : 'Application language', {
        exact: true,
      })
      .selectOption(language);
    for (const theme of ['light', 'dark']) {
      if ((await page.locator('html').getAttribute('data-theme')) !== theme)
        await page
          .getByRole('button', {
            name: language === 'fr' ? 'Changer le thème de couleur' : 'Toggle color theme',
          })
          .click();
      for (const route of ['/reports', '/brands']) {
        await page.goto(`/#${route}`);
        await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toBeVisible();
        const result = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze();
        expect(
          result.violations,
          `${language} ${theme} ${route}: ${JSON.stringify(result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })))}`,
        ).toEqual([]);
      }
    }
    if (language === 'en') {
      await page.goto('/#/settings');
      await page.getByLabel('Application language', { exact: true }).selectOption('en');
    }
  }
});
