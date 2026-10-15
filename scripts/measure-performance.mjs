import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { performance } from 'node:perf_hooks';
import { createHash } from 'node:crypto';

const port = 4176,
  base = `http://127.0.0.1:${port}`;
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
  for (let i = 0; i < 50; i++) {
    try {
      if ((await fetch(base)).ok) {
        ready = true;
        break;
      }
    } catch {
      /* Our preview is starting. */
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  if (!ready) throw new Error('Preview unavailable.');
  browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const start = performance.now();
  await page.goto(base);
  await page.getByRole('heading', { name: 'Your delivery workspace.', exact: true }).waitFor();
  const firstHeadingMs = performance.now() - start;
  await page.goto(`${base}/#/projects`);
  await page.getByRole('button', { name: 'Load demo project', exact: true }).click();
  await page
    .getByLabel('Active project')
    .getByText('Atlas customer portal · demo')
    .waitFor({ state: 'attached' });
  const routes = [];
  for (const route of ['/decisions', '/scope', '/stories', '/reports', '/brands']) {
    const samples = [];
    const headings = {
      '/decisions': 'Decision journal',
      '/scope': 'Scope overview',
      '/stories': 'Story refinement',
      '/reports': 'From project memory to shared understanding.',
      '/brands': 'Your documents, your identity.',
    };
    for (let i = 0; i < 5; i++) {
      await page.goto(`${base}/#/`);
      await page
        .getByRole('heading', { level: 1, name: 'Atlas customer portal', exact: true })
        .waitFor();
      const before = performance.now();
      await page.goto(`${base}/#${route}`);
      await page
        .getByRole('main')
        .getByRole('heading', { level: 1, name: headings[route], exact: true })
        .waitFor();
      samples.push(performance.now() - before);
    }
    samples.sort((a, b) => a - b);
    routes.push({
      route,
      medianScriptedNavigationMs: Number(samples[2].toFixed(2)),
      samplesMs: samples.map((n) => Number(n.toFixed(2))),
    });
  }
  const resources = await page.evaluate(() =>
    globalThis.performance
      .getEntriesByType('resource')
      .filter((r) => r.name.endsWith('.js'))
      .map((r) => ({ url: r.name.split('/').at(-1), transferSize: r.transferSize })),
  );
  const exports = [];
  await page.goto(`${base}/#/reports`);
  for (const format of ['pdf', 'pptx', 'xlsx']) {
    await page.getByRole('button', { name: '3. Choose document', exact: true }).click();
    await page.getByRole('combobox', { name: 'Export format', exact: true }).selectOption(format);
    await page.getByRole('button', { name: '6. Generate', exact: true }).click();
    const pending = page.waitForEvent('download');
    const started = performance.now();
    await page
      .getByRole('button', { name: `Download ${format.toUpperCase()}`, exact: true })
      .click();
    const download = await pending;
    const bytes = await readFile(await download.path());
    exports.push({
      format,
      scriptedDownloadMs: Number((performance.now() - started).toFixed(2)),
      bytes: bytes.length,
    });
  }
  const chunks = [];
  for (const file of await readdir('dist/assets'))
    if (file.endsWith('.js')) {
      const bytes = await readFile(`dist/assets/${file}`);
      chunks.push({ file, bytes: bytes.length, gzipBytes: gzipSync(bytes).length });
    }
  await mkdir('docs/evidence', { recursive: true });
  const report = {
    buildHash: createHash('sha256')
      .update(await readFile('dist/index.html'))
      .digest('hex'),
    measuredAt: new Date().toISOString(),
    node: process.version,
    platform: process.platform,
    browser: browser.version(),
    viewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
    method:
      'Local loopback production build. Time includes Playwright orchestration from navigation to visible h1. Five actual overview-to-tool transitions per route with matching destination headings; exports include first-use library/font loading and a download event. Not Web Vitals or an internet/user benchmark.',
    firstHeadingMs: Number(firstHeadingMs.toFixed(2)),
    routes,
    exports,
    resourcesBeforeExports: resources,
    chunks: chunks.sort((a, b) => b.bytes - a.bytes),
  };
  await writeFile('docs/evidence/performance.json', JSON.stringify(report, null, 2) + '\n');
  console.log(
    JSON.stringify({
      firstHeadingMs: report.firstHeadingMs,
      routes: report.routes.map(({ route, medianScriptedNavigationMs }) => ({
        route,
        medianScriptedNavigationMs,
      })),
      largestChunks: report.chunks.slice(0, 3),
    }),
  );
} finally {
  await browser?.close();
  server.kill();
}
