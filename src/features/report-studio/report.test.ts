import { describe, it, expect } from 'vitest';
import { demoProject } from '../../shared/data/demo';
import { validateProject } from '../../shared/data/validation';
import { exportBackup, parseBackup, copyProject } from '../../shared/data/backup';
import { brandSchema } from '../../shared/types/brand';
import {
  newBrand,
  duplicateBrand,
  contrast,
  brandProblems,
  rasterType,
  rasterDimensions,
} from '../brand-studio/domain';
import { composeReport, reportDefaults } from './model';
import { layoutReport, wrapText } from './layout';
import { pageSvg, reportMarkdown, reportRows, renderReport, textChunks } from './renderers';
import { impactPaths } from '../traceability/impact';
import { affectedDeliverables, scopeEvolution } from '../scope-radar/insights';
import { coverage } from '../story-gap/coverage';
import { reviseStory } from '../story-gap/domain';
import { uid } from '../../shared/lib/utils';
import Dexie from 'dexie';
import { createDatabase } from '../../shared/data/db';

describe('traceable reports and compatible storage', () => {
  it('refuses to export a backup that would exceed its own restore limit', () => {
    const p = demoProject(),
      sample = p.decisions[0]!;
    p.decisions.push(
      ...Array.from({ length: 200 }, () => ({ ...sample, id: uid(), context: 'x'.repeat(30_000) })),
    );
    expect(() => exportBackup([p])).toThrow('5 MiB');
  });
  it('upgrades an actual version 1 database and retains invalid recovery records', async () => {
    const name = `toolbox-migration-${uid()}`,
      legacy = new Dexie(name);
    legacy.version(1).stores({ projects: 'id, name, updatedAt' });
    const p = JSON.parse(JSON.stringify(demoProject()));
    delete p.brands;
    delete p.captureDraft;
    for (const d of p.decisions) delete d.assumptionsVerified;
    for (const s of p.stories) {
      delete s.scenarios;
      delete s.requirements;
    }
    await legacy
      .table('projects')
      .bulkAdd([p, { id: 'preserved-invalid', name: 'Recovery', untouched: 'original bytes' }]);
    legacy.close();
    const current = createDatabase(name);
    try {
      const upgraded = await current.projects.get(p.id);
      expect(upgraded!.brands).toEqual([]);
      expect(upgraded!.captureDraft).toBeNull();
      expect(upgraded!.decisions[0]!.assumptionsVerified).toBe(false);
      expect(await current.table('projects').get('preserved-invalid')).toEqual({
        id: 'preserved-invalid',
        name: 'Recovery',
        untouched: 'original bytes',
      });
      expect(current.verno).toBe(2);
    } finally {
      current.close();
      await Dexie.delete(name);
    }
  });
  it('imports a legacy version 1 backup and exports version 2 to protect new fields from older readers', () => {
    const p = demoProject();
    const legacy = JSON.parse(exportBackup([p]));
    legacy.version = 1;
    delete legacy.projects[0].brands;
    const result = parseBackup(JSON.stringify(legacy));
    expect(result.version).toBe(2);
    expect(result.projects[0]!.brands).toEqual([]);
    expect(JSON.parse(exportBackup(result.projects)).version).toBe(2);
  });
  it('migrates old project shapes additively without losing source data', () => {
    const old = JSON.parse(JSON.stringify(demoProject()));
    delete old.brands;
    for (const d of old.decisions) {
      delete d.assumptionsVerified;
      for (const h of d.history) delete h.content.assumptionsVerified;
    }
    for (const s of old.stories) {
      delete s.scenarios;
      delete s.requirements;
    }
    const valid = validateProject(old);
    expect(valid.brands).toEqual([]);
    expect(valid.stories[0]!.scenarios).toEqual([]);
    expect(valid.decisions[0]!.assumptionsVerified).toBe(false);
    expect(valid.decisions[0]!.rationale).toBe(old.decisions[0].rationale);
  });
  it('backs up and restores brand and coverage references with new identities', () => {
    const p = demoProject(),
      s = p.stories[0]!;
    p.brands = [newBrand()];
    const id = uid();
    s.requirements = [{ id, text: 'An authorized user can export.' }];
    s.scenarios = [
      {
        id: uid(),
        kind: 'permission',
        given: 'Authorized user',
        when: 'Export',
        then: 'CSV is provided',
        requirementIds: [id],
      },
    ];
    const backup = parseBackup(exportBackup([p]));
    const copy = copyProject(backup.projects[0]!);
    expect(copy.brands[0]!.id).not.toBe(p.brands[0]!.id);
    expect(copy.stories[0]!.scenarios[0]!.requirementIds).toEqual([
      copy.stories[0]!.requirements[0]!.id,
    ]);
    expect(copy.stories[0]!.requirements[0]!.id).not.toBe(id);
    expect(p.stories[0]!.requirements[0]!.id).toBe(id);
  });
  it('rejects dangling coverage links', () => {
    const p = demoProject();
    p.stories[0]!.scenarios = [
      { id: uid(), kind: 'error', given: '', when: '', then: '', requirementIds: [uid()] },
    ];
    expect(() => validateProject(p)).toThrow('recorded requirement');
  });
  it('does not confuse empty selection with a populated report', () => {
    const p = demoProject();
    expect(composeReport(p, { ...reportDefaults(p, 'en'), selectedIds: [] }).sections).toEqual([]);
  });
  it('retains source provenance, project revision and explicit fictional status', () => {
    const p = demoProject(),
      r = composeReport(p, reportDefaults(p, 'en'));
    expect(r.fictional).toBe(true);
    expect(r.projectRevision).toBe(p.revision);
    expect(r.sections.flatMap((s) => s.entries).every((e) => e.sourceIds.length > 0)).toBe(true);
    expect(reportMarkdown(r)).toContain('Fictional example data');
    const restored = copyProject(p);
    expect(restored.demo).toBe(false);
    expect(composeReport(restored, reportDefaults(restored, 'en')).fictional).toBe(true);
  });
  it('uses accepted context for scope totals even when the change register is filtered', () => {
    const p = demoProject(),
      accepted = p.changes.find((c) => c.status === 'accepted')!,
      proposed = p.changes.find((c) => c.status === 'proposed')!;
    const r = composeReport(p, {
      ...reportDefaults(p, 'en'),
      kind: 'scope',
      selectedIds: [proposed.id],
    });
    const scope = r.sections.find((s) => s.key === 'scope')!;
    expect(
      scope.entries[0]!.fields.find((f) => f.label === 'Current effort · estimate')!.text,
    ).toBe('20 person-days');
    expect(scope.entries[0]!.sourceIds).toContain(accepted.id);
    expect(scope.entries.slice(1).map((e) => e.sourceIds[0])).toEqual([proposed.id]);
    expect(JSON.stringify(r)).not.toContain('24 person-days');
  });
  it('does not report a baseline dated after the end of the reference period', () => {
    const p = demoProject();
    const r = composeReport(p, { ...reportDefaults(p, 'en'), kind: 'scope', until: '2000-01-01' });
    expect(r.sections).toEqual([]);
  });
  it('translates report headings without translating source text', () => {
    const p = demoProject(),
      r = composeReport(p, reportDefaults(p, 'fr'));
    expect(r.sections.find((s) => s.key === 'decisions')!.title).toBe('Décisions');
    expect(JSON.stringify(r)).toContain(p.decisions[0]!.rationale);
    expect(reportRows(r)[0]).toContain('Contenu');
  });
  it('honors explicit section order and rejects duplicates and reversed dates', () => {
    const p = demoProject(),
      o = reportDefaults(p, 'en');
    expect(
      composeReport(p, { ...o, sections: ['stories', 'decisions'] }).sections.map((s) => s.key),
    ).toEqual(['stories', 'decisions']);
    expect(() => composeReport(p, { ...o, sections: ['summary', 'summary'] })).toThrow('unique');
    expect(() => composeReport(p, { ...o, from: '2026-10-15', until: '2026-01-01' })).toThrow();
  });
  it('preserves missing estimates rather than printing zero', () => {
    const p = demoProject();
    p.baselines[0]!.items[0]!.estimate = null;
    const r = composeReport(p, { ...reportDefaults(p, 'en'), kind: 'scope' });
    expect(
      r.sections
        .find((s) => s.key === 'scope')!
        .entries[0]!.fields.find((f) => f.label === 'Initial effort · estimate')!.text,
    ).toBe('Unavailable');
  });
});
describe('brand validation and export layout', () => {
  it('refuses an oversized header rather than silently clipping it', () => {
    const p = demoProject(),
      b = newBrand();
    b.header = 'W'.repeat(180);
    expect(() => layoutReport(composeReport(p, reportDefaults(p, 'en')), b, 'pdf')).toThrow(
      'header or footer',
    );
  });
  it('reads raster dimensions before decoding and rejects truncated headers', () => {
    const png = new Uint8Array(24);
    png.set([137, 80, 78, 71, 13, 10, 26, 10]);
    const view = new DataView(png.buffer);
    view.setUint32(16, 4097);
    view.setUint32(20, 100);
    expect(rasterDimensions(png)).toEqual({ width: 4097, height: 100 });
    expect(() => rasterDimensions(new Uint8Array([255, 216, 255, 0]))).toThrow('dimensions');
  });
  it('splits spreadsheet text within cell limits without breaking Unicode pairs', () => {
    const value = '😀'.repeat(40_000);
    const chunks = textChunks(value);
    expect(chunks.join('')).toBe(value);
    expect(chunks.every((c) => c.length <= 30_000 && !/[\uD800-\uDBFF]$/.test(c))).toBe(true);
  });
  it('cancels generation before loading an export library or producing a document', async () => {
    const p = demoProject(),
      signal = AbortSignal.abort();
    await expect(
      renderReport(composeReport(p, reportDefaults(p, 'en')), newBrand(), 'pdf', { signal }),
    ).rejects.toMatchObject({ name: 'AbortError' });
  });
  it('checks contrast and duplicates profiles without reusing identity', () => {
    const b = newBrand();
    expect(contrast('#000000', '#ffffff')).toBe(21);
    expect(brandProblems(b)).toEqual([]);
    expect(brandProblems({ ...b, textColor: '#ffffff' })).toHaveLength(1);
    expect(duplicateBrand(b).id).not.toBe(b.id);
  });
  it('rejects invalid colors, remote logos, forged logos and SVG uploads', () => {
    const b = newBrand();
    expect(brandSchema.safeParse({ ...b, primary: 'red' }).success).toBe(false);
    expect(brandSchema.safeParse({ ...b, logo: 'https://example.com/logo.png' }).success).toBe(
      false,
    );
    expect(brandSchema.safeParse({ ...b, logo: 'data:image/png;base64,AAAA' }).success).toBe(false);
    expect(() => rasterType(new TextEncoder().encode('<svg onload="alert(1)"/>'))).toThrow(
      'real PNG',
    );
    expect(rasterType(new Uint8Array([255, 216, 255, 0]))).toBe('image/jpeg');
  });
  it('paginates long content and long unbroken tokens without discarding characters', () => {
    const p = demoProject();
    p.decisions[0]!.context = 'LONGTOKEN'.repeat(1000);
    const r = composeReport(p, { ...reportDefaults(p, 'en'), kind: 'decision' }),
      b = newBrand();
    for (const format of ['pdf', 'pptx'] as const) {
      const pages = layoutReport(r, b, format);
      expect(pages.length).toBeGreaterThan(5);
      for (const page of pages)
        for (const line of page.texts) {
          expect(line.x).toBeGreaterThanOrEqual(0);
          expect(line.y + line.height).toBeLessThanOrEqual(page.height);
          expect(line.x + line.width).toBeLessThanOrEqual(page.width);
        }
      expect(
        pages
          .flatMap((p) => p.texts)
          .filter((t) => /LONGTOKEN/.test(t.text))
          .map((t) => t.text)
          .join(''),
      ).toContain('LONGTOKEN'.repeat(20));
    }
    expect(wrapText('abcdef', 15, 10, 'Arial').join('')).toBe('abcdef');
  });
  it('escapes source text in standalone SVG exports', () => {
    const p = demoProject(),
      o = reportDefaults(p, 'en');
    o.title = '<script>alert("test")</script>';
    const svg = pageSvg(layoutReport(composeReport(p, o), newBrand(), 'pptx')[0]!, newBrand());
    expect(svg).not.toContain('<script>');
    expect(svg).toContain('&lt;script&gt;');
  });
});
describe('explainable domain insights', () => {
  it('finds indirect connections without inventing links or looping through cycles', () => {
    const p = demoProject(),
      source = { kind: 'decision' as const, id: p.decisions[0]!.id };
    const paths = impactPaths(p, source);
    expect(paths.some((p) => p.path.length === 2)).toBe(true);
    expect(new Set(paths.map((p) => p.ref.id)).size).toBe(paths.length);
    expect(paths.some((p) => p.ref.id === source.id)).toBe(false);
  });
  it('uses only accepted changes for the evolution timeline and does not mutate the baseline', () => {
    const p = demoProject(),
      before = JSON.stringify(p);
    const events = scopeEvolution(p.baselines[0]!, p.changes);
    expect(events.at(-1)!.result.current).toBe(20);
    expect(JSON.stringify(p)).toBe(before);
    expect(
      affectedDeliverables(p.baselines[0]!, p.changes, p.baselines[0]!.items[0]!.id).some(
        (i) => i.title === 'Activity timeline',
      ),
    ).toBe(true);
  });
  it('counts only explicit complete scenario links and clears coverage after a source revision', () => {
    const p = demoProject(),
      s = p.stories[0]!,
      id = uid();
    s.requirements = [{ id, text: 'Authorized export' }];
    s.scenarios = [
      {
        id: uid(),
        kind: 'nominal',
        given: 'A user',
        when: 'Export',
        then: '',
        requirementIds: [id],
      },
    ];
    expect(coverage(s)[0]!.scenarios).toHaveLength(0);
    s.scenarios[0]!.then = 'CSV generated';
    expect(coverage(s)[0]!.scenarios).toHaveLength(1);
    const revised = reviseStory(s, { ...s, description: 'A revised source' });
    expect(revised.scenarios[0]!.then).toBe('CSV generated');
    expect(coverage(revised)[0]!.scenarios).toHaveLength(0);
  });
});
