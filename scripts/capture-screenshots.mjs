import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const sizes = [
  [1920, 1080],
  [3440, 1440],
  [1440, 900],
  [1366, 768],
  [1024, 768],
  [768, 1024],
  [390, 844],
  [360, 800],
  [430, 932],
];
const hash = (data) => createHash('sha256').update(data).digest('hex');
const buildHash = hash(await readFile('dist/index.html'));
const acceptance = JSON.parse(await readFile('test-results/results.json', 'utf8'));
assert(
  acceptance.stats.unexpected === 0 &&
    acceptance.stats.skipped === 0 &&
    acceptance.errors.length === 0,
  'Browser acceptance must pass before reference capture.',
);
assert(
  acceptance.suites.some((s) => s.file.endsWith('workflows.spec.ts')) &&
    acceptance.suites.some((s) => s.file.endsWith('studios.spec.ts')),
  'Run the complete browser suite before reference capture.',
);
for (const [width, height] of sizes) {
  const receipt = JSON.parse(
    await readFile(`test-results/viewport-${width}x${height}.json`, 'utf8').catch(() => {
      throw new Error('Run pnpm test:e2e successfully before creating reference screenshots.');
    }),
  );
  assert(
    receipt.passed &&
      receipt.buildHash === buildHash &&
      receipt.languages.includes('fr') &&
      receipt.languages.includes('en'),
    'Responsive receipts must match the current production build.',
  );
}
const port = 4174,
  base = `http://127.0.0.1:${port}`,
  directory = 'docs/assets/screenshots';
const server = spawn(
  process.execPath,
  [
    'node_modules/vite/bin/vite.js',
    'preview',
    '--host',
    '127.0.0.1',
    '--port',
    String(port),
    '--strictPort',
  ],
  { windowsHide: true, stdio: 'pipe' },
);
let browser;
const manifest = {
  capturedAt: new Date().toISOString(),
  buildHash,
  deviceScaleFactor: 1,
  fullPage: false,
  fictional: true,
  browser: '',
  captures: [],
};
try {
  let ready = false;
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      if ((await fetch(base)).ok) {
        ready = true;
        break;
      }
    } catch {
      /* Wait for our server. */
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  assert(ready, 'Production preview must start.');
  browser = await chromium.launch();
  manifest.browser = browser.version();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    colorScheme: 'light',
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto(`${base}/#/projects`);
  await page.getByRole('button', { name: 'Load demo project', exact: true }).click();
  await page
    .getByLabel('Active project')
    .getByText('Atlas customer portal · demo')
    .waitFor({ state: 'attached' });
  await mkdir(directory, { recursive: true });
  async function capture(name, route, language = 'en', theme = 'light') {
    await page.goto(`${base}/#${route}`);
    await page.getByRole('main').getByRole('heading', { level: 1 }).waitFor();
    await page.evaluate(() => globalThis.document.fonts.ready);
    assert(
      await page.evaluate(
        () => globalThis.document.documentElement.scrollWidth <= globalThis.innerWidth,
      ),
      `Global overflow on ${name}`,
    );
    const viewport = page.viewportSize();
    const path = `${directory}/${name}.png`;
    await page.screenshot({ path, fullPage: false, animations: 'disabled' });
    const png = await readFile(path);
    assert.equal(png.readUInt32BE(16), viewport.width);
    assert.equal(png.readUInt32BE(20), viewport.height);
    manifest.captures.push({
      file: `${name}.png`,
      route,
      language,
      theme,
      ...viewport,
      sha256: hash(png),
    });
  }
  for (const language of ['en', 'fr']) {
    await page.goto(`${base}/#/settings`);
    await page
      .getByRole('combobox', { name: 'Application language', exact: true })
      .selectOption(language);
    for (const [width, height] of sizes) {
      await page.setViewportSize({ width, height });
      await capture(`overview-${language}-${width}x${height}`, '/', language);
    }
    await page.setViewportSize({ width: 1920, height: 1080 });
    for (const [name, route] of [
      ['decisions', '/decisions'],
      ['scope', '/scope'],
      ['stories', '/stories'],
      ['traceability', '/traceability'],
      ['report-studio', '/reports'],
      ['brand-studio', '/brands'],
    ])
      await capture(`${name}-${language}-1920x1080`, route, language);
    await page.goto(`${base}/#/stories`);
    await page.getByRole('button', { name: /Story 01/ }).click();
    await capture(
      `story-analysis-${language}-1920x1080`,
      new URL(page.url()).hash.slice(1),
      language,
    );
    if (language === 'en') {
      await page.goto(`${base}/#/settings`);
      await page.getByLabel('Application language', { exact: true }).selectOption('en');
    }
  }
  await page.goto(`${base}/#/settings`);
  await page.getByLabel('Langue de l’application', { exact: true }).selectOption('en');
  await page.getByRole('button', { name: 'Toggle color theme' }).click();
  await capture('overview-dark-en-1920x1080', '/', 'en', 'dark');
  await page.getByRole('button', { name: 'Toggle color theme' }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await capture('scope-en-390x844', '/scope');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.locator('.sidebar-footer a').last().scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${directory}/navigation-en-390x844.png`, fullPage: false });
  const navPng = await readFile(`${directory}/navigation-en-390x844.png`);
  manifest.captures.push({
    file: 'navigation-en-390x844.png',
    route: '/scope',
    language: 'en',
    theme: 'light',
    width: 390,
    height: 844,
    sha256: hash(navPng),
  });
  await page.keyboard.press('Escape');
  for (const [legacy, source] of [
    ['overview', 'overview-en-1920x1080'],
    ['overview-fr', 'overview-fr-1920x1080'],
    ['overview-dark', 'overview-dark-en-1920x1080'],
    ['decisions', 'decisions-en-1920x1080'],
    ['scope', 'scope-en-1920x1080'],
    ['scope-fr', 'scope-fr-1920x1080'],
    ['scope-mobile', 'scope-en-390x844'],
    ['stories', 'stories-en-1920x1080'],
    ['story-analysis', 'story-analysis-en-1920x1080'],
    ['traceability', 'traceability-en-1920x1080'],
  ])
    await copyFile(`${directory}/${source}.png`, `${directory}/${legacy}.png`);
  await writeFile(`${directory}/manifest.json`, JSON.stringify(manifest, null, 2) + '\n');
  console.log(
    `Captured ${manifest.captures.length} authentic viewport screenshots at deviceScaleFactor 1. Dimensions and overflow validated.`,
  );
} finally {
  await browser?.close();
  server.kill();
}
