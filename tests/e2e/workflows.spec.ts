import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

async function demo(page: Page) {
  await page.goto('/#/projects');
  await page.getByRole('button', { name: /^(Load|Open) demo project$/ }).click();
  await expect(page.getByLabel('Active project')).toContainText('Atlas customer portal');
}
async function project(page: Page, name: string) {
  await page.getByRole('button', { name: 'Create a project', exact: true }).first().click();
  await page.getByLabel('Project name').fill(name);
  await page.getByRole('button', { name: 'Create project', exact: true }).click();
  await expect(page.getByLabel('Active project')).toContainText(name);
}
test('first use creates an isolated project and persists it on reload', async ({ page }) => {
  await page.goto('/');
  await project(page, 'Recruiter review');
  await page.reload();
  await expect(page.getByLabel('Active project')).toContainText('Recruiter review');
  await page.getByRole('link', { name: 'DecisionTrace 01' }).click();
  await expect(page.getByText('The next decision deserves a record.')).toBeVisible();
  await page.getByRole('link', { name: 'Overview', exact: true }).click();
  await demo(page);
  await page.getByLabel('Active project').selectOption({ label: 'Recruiter review' });
  await page.getByRole('link', { name: 'DecisionTrace 01' }).click();
  await expect(page.getByText('The next decision deserves a record.')).toBeVisible();
});
test('decision creation, meaningful revision, history, filtering, archive and export', async ({
  page,
}) => {
  await page.goto('/');
  await project(page, 'Decision delivery');
  await page.getByRole('link', { name: 'DecisionTrace 01' }).click();
  await page.getByRole('button', { name: 'New decision', exact: true }).click();
  await page.getByLabel('Decision title').fill('Adopt a modular frontend');
  await page.getByLabel('Context & problem').fill('Keep domain rules testable.');
  await page.getByLabel('Owner', { exact: true }).fill('Project owner');
  await page.getByLabel('Rationale', { exact: true }).fill('Independent, testable modules.');
  await page.getByRole('button', { name: 'Create decision', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Adopt a modular frontend', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Edit decision', exact: true }).click();
  await page.getByLabel('Status', { exact: true }).selectOption('accepted');
  await page.getByLabel('Selected solution').fill('Feature modules with pure domain functions.');
  await page
    .getByLabel('Rationale', { exact: true })
    .fill('The team validated modular boundaries.');
  await page.getByLabel('Reason for this revision').fill('Architecture review completed');
  await page.getByRole('button', { name: 'Save revision' }).click();
  await page.getByText('Architecture review completed', { exact: true }).click();
  await expect(page.getByText('Independent, testable modules.', { exact: true })).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Markdown', exact: true }).click();
  const download = await downloadPromise;
  expect(await readFile((await download.path())!, 'utf8')).toContain(
    'The team validated modular boundaries.',
  );
  await page.getByRole('button', { name: 'Back to journal' }).click();
  await page.getByLabel('Search decisions').fill('modular');
  await expect(page.getByRole('heading', { name: 'Adopt a modular frontend' })).toBeVisible();
  await page.getByLabel('Filter by status').selectOption('rejected');
  await expect(page.getByText('No matching decisions')).toBeVisible();
  await page.getByLabel('Filter by status').selectOption('accepted');
  await page.getByRole('button', { name: /Adopt a modular frontend/ }).click();
  await page.getByRole('button', { name: 'Archive', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm', exact: true }).click();
  await page.getByRole('button', { name: 'Back to journal' }).click();
  await expect(page.getByText('No matching decisions')).toBeVisible();
  await page.getByLabel('Include archived').check();
  await expect(page.getByRole('heading', { name: 'Adopt a modular frontend' })).toBeVisible();
});
test('baseline, accepted change and what-if simulation leave official scope intact', async ({
  page,
}) => {
  await page.goto('/');
  await project(page, 'Scope delivery');
  await page.getByRole('link', { name: 'Scope Radar 02' }).click();
  await page.getByRole('button', { name: 'Define baseline', exact: true }).click();
  await page.getByLabel('Project objective').fill('Deliver an account workspace.');
  await page.getByRole('button', { name: 'Add deliverable' }).click();
  await page.getByLabel('Deliverable 1 name').fill('Account overview');
  await page.getByLabel('Deliverable 1 effort').fill('10');
  await page.getByRole('button', { name: 'Save baseline draft' }).click();
  await page.getByRole('button', { name: 'Freeze baseline', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm', exact: true }).click();
  await page.getByRole('button', { name: 'New change', exact: true }).click();
  await page.getByLabel('Change title').fill('CSV export');
  await page.getByLabel('Status', { exact: true }).selectOption('accepted');
  await page.getByLabel('Additional effort (days)').fill('2');
  await page.getByRole('button', { name: 'Record change', exact: true }).click();
  await page.getByRole('button', { name: 'Back to scope' }).click();
  await expect(page.locator('.comparison-total')).toContainText('12');
  await page.getByRole('button', { name: 'New change', exact: true }).click();
  await page.getByLabel('Change title').fill('Saved presets');
  await page.getByLabel('Additional effort (days)').fill('3');
  await page.getByRole('button', { name: 'Record change', exact: true }).click();
  await page.getByRole('button', { name: 'Back to scope' }).click();
  await page.getByLabel('Saved presets').check();
  await expect(page.locator('.simulation-result')).toContainText('15');
  await expect(page.locator('.comparison-total')).toContainText('12');
  await page.reload();
  await expect(page.getByLabel('Saved presets')).not.toBeChecked();
  await expect(page.locator('.comparison-total')).toContainText('12');
  await page.getByRole('button', { name: 'Create revision', exact: true }).click();
  await page.getByRole('button', { name: 'Create draft revision' }).click();
  await expect(page.getByLabel('Baseline version')).toContainText('Version 2');
  await page.getByLabel('Baseline version').selectOption({ label: 'Version 1 · frozen' });
  await expect(page.locator('.comparison-total')).toContainText('12');
});
test('StoryGap analyzes, accepts edited notes, preserves source and exports', async ({ page }) => {
  await page.goto('/');
  await project(page, 'Story delivery');
  await page.getByRole('link', { name: 'StoryGap 03' }).click();
  await page.getByRole('button', { name: 'New story', exact: true }).click();
  await page.getByLabel('Story title').fill('Export account data');
  await page
    .getByLabel('User story', { exact: true })
    .fill('As an account administrator, I want to export my data easily.');
  await page.getByRole('button', { name: 'Create & analyze' }).click();
  await expect(
    page.getByText('“easily” is subjective and does not define an observable threshold.'),
  ).toBeVisible();
  const suggestion = page
    .locator('.suggestion')
    .filter({ has: page.getByLabel('Refinement note for export-format') });
  await suggestion.getByRole('textbox').fill('Confirm CSV with the account reporting team.');
  await suggestion.getByRole('button', { name: 'Accept note' }).click();
  await expect(
    page.getByText('Confirm CSV with the account reporting team.', { exact: true }),
  ).toBeVisible();
  await expect(page.locator('.story-statement')).toHaveText(
    'As an account administrator, I want to export my data easily.',
  );
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export story', exact: true }).click();
  const result = await readFile((await (await downloadPromise).path())!, 'utf8');
  expect(result).toContain('Confirm CSV with the account reporting team.');
  expect(result).toContain('## Open questions');
  await page.getByRole('button', { name: 'Edit & analyze', exact: true }).click();
  await page
    .getByLabel('User story', { exact: true })
    .fill('As an account administrator, I want to export a CSV file.');
  await page.getByRole('button', { name: 'Save & analyze' }).click();
  await page.getByText('Compare with the original').click();
  await expect(
    page.getByText('As an account administrator, I want to export my data easily.', {
      exact: true,
    }),
  ).toBeVisible();
});
test('explicit links can be created, followed in both directions, and removed', async ({
  page,
}) => {
  await demo(page);
  await page.getByRole('link', { name: 'DecisionTrace 01' }).click();
  await page.getByRole('button', { name: /Keep the first release focused/ }).click();
  await page.getByRole('button', { name: 'Link an item' }).click();
  await page
    .getByLabel('Related item')
    .selectOption({ label: 'Story · Understand the activity timeline' });
  await page.getByLabel('This item…').selectOption('informs');
  await page.getByLabel('Relationship context').fill('A validated relationship for the review.');
  await page.getByRole('button', { name: 'Create link' }).click();
  await page.getByRole('link', { name: 'Understand the activity timeline' }).click();
  await expect(
    page.getByRole('heading', { name: 'Understand the activity timeline', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('link', { name: 'Keep the first release focused on desktop workflows' })
    .click();
  await expect(
    page.getByRole('heading', {
      name: 'Keep the first release focused on desktop workflows',
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Unlink Understand the activity timeline' }).click();
  await page.getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Understand the activity timeline' })).toHaveCount(0);
});
test('backup and restoration preserve the complete demo in separate copies', async ({ page }) => {
  await demo(page);
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  const promise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Back up all projects' }).click();
  const path = (await (await promise).path())!;
  const saved = JSON.parse(await readFile(path, 'utf8')) as {
    projects: { relations: unknown[]; decisions: unknown[] }[];
  };
  expect(saved.projects[0]?.relations).toHaveLength(2);
  await page.getByLabel('Restore from JSON', { exact: true }).setInputFiles(path);
  await expect(page.getByRole('dialog', { name: 'Review your backup' })).toBeVisible();
  await page.getByRole('button', { name: 'Restore as new copies' }).click();
  await expect(page.getByRole('status')).toContainText('Restored 1 project copies');
  await expect(page.getByLabel('Active project')).toContainText('Atlas customer portal (restored)');
  await page.reload();
  await page.getByRole('link', { name: 'Traceability', exact: true }).click();
  await expect(page.locator('.trace-card')).toHaveCount(2);
  await expect(page.getByLabel('Active project').locator('option')).toHaveCount(2);
});
test('invalid imports are rejected without changing the workspace', async ({ page }) => {
  await demo(page);
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  await page.getByLabel('Restore from JSON', { exact: true }).setInputFiles({
    name: 'broken.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"version":99}'),
  });
  await expect(page.getByRole('alert')).toContainText('Unsupported or invalid backup');
  await expect(page.getByLabel('Active project').locator('option')).toHaveCount(1);
});
test('mobile navigation, responsive layout and themes work without console errors', async ({
  page,
}) => {
  const errors: string[] = [];
  const externalRequests: string[] = [];
  page.on('request', (request) => {
    if (!request.url().startsWith('http://127.0.0.1:4173/')) externalRequests.push(request.url());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await demo(page);
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('link', { name: 'Scope Radar 02' }).click();
  await expect(page.getByRole('heading', { name: 'Scope overview' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.getByRole('button', { name: 'Toggle color theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(errors).toEqual([]);
  expect(externalRequests).toEqual([]);
});
test('French layouts fit small phones, tablets and desktops', async ({ page }) => {
  await demo(page);
  await page.goto('/#/settings');
  await page.getByLabel('Application language', { exact: true }).selectOption('fr');
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      '/',
      '/decisions',
      '/scope',
      '/stories',
      '/traceability',
      '/projects',
      '/settings',
    ]) {
      await page.goto(`/#${route}`);
      await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        `${width}px ${route} must not overflow horizontally`,
      ).toBe(true);
    }
  }
  await page.setViewportSize({ width: 320, height: 900 });
  const menu = page.getByRole('button', { name: 'Ouvrir la navigation' });
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.mobile-close')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(
    page.getByRole('link', { name: 'IT Productivity Toolbox', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('link', { name: 'Documentation', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeFocused();
});

test('critical screens pass automated WCAG checks in light and dark themes', async ({ page }) => {
  await demo(page);
  const routes = [
    ['/', 'Atlas customer portal'],
    ['/decisions', 'Decision journal'],
    ['/scope', 'Scope overview'],
    ['/stories', 'Story refinement'],
    ['/traceability', 'Follow the thread.'],
    ['/projects', 'Give the work a home.'],
    ['/settings', 'Your workspace, your control.'],
  ] as const;
  for (const theme of ['light', 'dark']) {
    if (theme === 'dark') await page.getByRole('button', { name: 'Toggle color theme' }).click();
    for (const [route, heading] of routes) {
      await page.goto(`/#${route}`);
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(
        result.violations,
        `${theme} ${route}: ${JSON.stringify(result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })))}`,
      ).toEqual([]);
    }
  }
});

test('French interface and story rules persist without translating project content', async ({
  page,
}) => {
  await demo(page);
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  await page.getByLabel('Application language', { exact: true }).selectOption('fr');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.getByRole('heading', { name: 'Votre espace, vos choix.' })).toBeVisible();
  await page.getByRole('link', { name: 'DecisionTrace 01' }).click();
  await expect(page.getByRole('heading', { name: 'Journal des décisions' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Make data exports self-service', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Nouvelle décision', exact: true }).click();
  await expect(page.getByLabel('Titre de la décision')).toBeVisible();
  await page.getByRole('button', { name: 'Annuler', exact: true }).click();
  await page.getByRole('link', { name: 'StoryGap 03' }).click();
  await page.getByRole('button', { name: 'Nouvelle story', exact: true }).click();
  await page.getByLabel('Titre de la story').fill('Exporter les données');
  await page
    .getByLabel('User story', { exact: true })
    .fill(
      'En tant qu’utilisateur, je souhaite exporter mes données facilement, afin de préparer un rapport.',
    );
  await page.getByRole('button', { name: 'Créer et analyser' }).click();
  await expect(
    page.getByText('« facilement » est subjectif et ne définit pas de seuil observable.'),
  ).toBeVisible();
  await expect(
    page.getByText('L’utilisateur concerné n’est pas identifié.', { exact: true }),
  ).toHaveCount(0);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(
    page.getByRole('heading', { name: 'Exporter les données', exact: true }),
  ).toBeVisible();
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(result.violations).toEqual([]);
});

test('keyboard skip link and dialog focus do not change the route', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Your delivery workspace.' })).toBeVisible();
  const trigger = page.getByRole('button', { name: 'Create a project', exact: true });
  await trigger.click();
  await expect(page.getByLabel('Project name')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});

test('an open draft refuses stale writes after another tab saves', async ({ page, context }) => {
  await demo(page);
  await page.getByRole('link', { name: 'DecisionTrace 01' }).click();
  await page.getByRole('button', { name: /Make data exports self-service/ }).click();
  const recordUrl = page.url();
  await page.getByRole('button', { name: 'Edit decision', exact: true }).click();
  await page.getByLabel('Rationale', { exact: true }).fill('An older unsaved local draft.');
  await page.getByLabel('Reason for this revision').fill('Draft review');
  const second = await context.newPage();
  await second.goto(recordUrl);
  await second.getByRole('button', { name: 'Edit decision', exact: true }).click();
  await second
    .getByLabel('Rationale', { exact: true })
    .fill('A newer agreement saved in another tab.');
  await second.getByLabel('Reason for this revision').fill('New agreement');
  await second.getByRole('button', { name: 'Save revision' }).click();
  await expect(
    second.getByText('A newer agreement saved in another tab.', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Save revision' }).click();
  await expect(page.getByRole('alert')).toContainText('another tab');
  await expect(page.getByLabel('Rationale', { exact: true })).toHaveValue(
    'An older unsaved local draft.',
  );
  await second.reload();
  await expect(
    second.getByText('A newer agreement saved in another tab.', { exact: true }),
  ).toBeVisible();
});

test('project overview links to real review items and opens creation directly', async ({
  page,
}) => {
  await demo(page);
  await page.getByRole('link', { name: 'Overview', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Atlas customer portal', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.attention-rows > a')).toHaveCount(4);
  await page.getByRole('link', { name: 'New decision', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Record a decision' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  expect(page.url()).not.toContain('new=1');
  await page.getByLabel('Search decisions').fill('nothing matches this query');
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
  await expect(page.getByLabel('Search decisions')).toHaveValue('');
  await expect(page.locator('.journal-row')).toHaveCount(2);
  await page.getByRole('link', { name: 'Overview', exact: true }).click();
  await page.getByRole('link', { name: 'New story', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Bring a story into focus' })).toBeVisible();
});

test('scope dependencies can be selected with checkboxes and persist in exports', async ({
  page,
}) => {
  await demo(page);
  await page.getByRole('link', { name: 'Scope Radar 02' }).click();
  await page.getByRole('button', { name: 'New change', exact: true }).click();
  await page.getByLabel('Change title').fill('A new connected deliverable');
  const dependencies = page.getByRole('group', { name: /Affected dependencies/ });
  await dependencies.getByRole('checkbox', { name: 'Account overview', exact: true }).check();
  await dependencies.getByRole('checkbox', { name: 'Activity timeline', exact: true }).check();
  await page.getByRole('button', { name: 'Record change', exact: true }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON', exact: true }).click();
  const data = JSON.parse(await readFile((await (await downloadPromise).path())!, 'utf8')) as {
    dependencies: string[];
  };
  expect(data.dependencies).toHaveLength(2);
  await page.reload();
  await expect(
    page.getByText('Account overview, Activity timeline', { exact: true }),
  ).toBeVisible();
});

test('story review filters separate accepted and ignored notes without editing the source', async ({
  page,
}) => {
  await demo(page);
  await page.getByRole('link', { name: 'StoryGap 03' }).click();
  await page.getByRole('button', { name: /Story 01/ }).click();
  const original = await page.locator('.story-statement').innerText();
  await page
    .locator('.suggestion')
    .first()
    .getByRole('button', { name: 'Accept note', exact: true })
    .click();
  const filters = page.getByRole('group', { name: 'Filter by review state' });
  await filters.getByRole('button', { name: /^Accepted/ }).click();
  await expect(page.locator('.suggestion')).toHaveCount(1);
  await filters.getByRole('button', { name: /^Ignored/ }).click();
  await expect(page.getByText('No prompts match these filters.')).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
  await expect(page.locator('.suggestion')).toHaveCount(3);
  await expect(page.locator('.story-statement')).toHaveText(original);
});
