import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';

const port = 4174;
const base = `http://127.0.0.1:${port}`;
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
try {
  let ready = false;
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      if ((await fetch(base)).ok) {
        ready = true;
        break;
      }
    } catch {
      /* Wait for the preview server. */
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  if (!ready) throw new Error('The production preview did not start. Build the application first.');
  browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1050 },
    colorScheme: 'light',
  });
  const page = await context.newPage();
  await page.goto(base);
  await page.getByRole('button', { name: 'Explore the demo', exact: true }).click();
  await page
    .getByLabel('Active project')
    .getByText('Atlas customer portal · demo')
    .waitFor({ state: 'attached' });
  await mkdir('docs/assets/screenshots', { recursive: true });
  for (const [name, route] of [
    ['overview', '/'],
    ['decisions', '/decisions'],
    ['scope', '/scope'],
    ['stories', '/stories'],
    ['traceability', '/traceability'],
  ]) {
    await page.goto(`${base}/#${route}`);
    await page.getByRole('main').getByRole('heading', { level: 1 }).waitFor();
    await page.screenshot({ path: `docs/assets/screenshots/${name}.png`, fullPage: true });
  }
  await page.goto(`${base}/#/stories`);
  await page.getByRole('button', { name: /Story 01/ }).click();
  await page.getByRole('heading', { name: 'A refinement conversation' }).waitFor();
  await page.screenshot({ path: 'docs/assets/screenshots/story-analysis.png', fullPage: true });
  await page.goto(base);
  await page.getByRole('button', { name: 'Toggle color theme' }).click();
  await page.screenshot({ path: 'docs/assets/screenshots/overview-dark.png', fullPage: true });
  await page.getByRole('button', { name: 'Toggle color theme' }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/#/scope`);
  await page.getByRole('heading', { name: 'See the scope shift.' }).waitFor();
  await page.screenshot({ path: 'docs/assets/screenshots/scope-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.goto(`${base}/#/settings`);
  await page.getByLabel('Application language', { exact: true }).selectOption('fr');
  await page.goto(base);
  await page.getByRole('heading', { name: /Moins de contexte perdu/ }).waitFor();
  await page.screenshot({ path: 'docs/assets/screenshots/overview-fr.png', fullPage: true });
  await page.goto(`${base}/#/scope`);
  await page.getByRole('heading', { name: 'Voyez le périmètre évoluer.' }).waitFor();
  await page.screenshot({ path: 'docs/assets/screenshots/scope-fr.png', fullPage: true });
  console.log('Captured 10 authentic production-build screenshots from the fictional demo.');
} finally {
  await browser?.close();
  server.kill();
}
