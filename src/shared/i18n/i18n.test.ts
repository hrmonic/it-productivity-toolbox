import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { afterEach, describe, expect, it } from 'vitest';
import catalog from './fr.json';
import keys from './keys.json';
import { getLanguage, setLanguage, t, translate } from './index';
import { analyzeStory, emptyStory } from '../../features/story-gap/domain';

afterEach(() => setLanguage('en'));
describe('English and French interface', () => {
  it('translates every extracted UI message', () => {
    for (const key of keys) expect(catalog, key).toHaveProperty(key);
  });
  it('covers every static translation call in the source', () => {
    const sources = import.meta.glob('/src/**/*.{ts,tsx}', {
      query: '?raw',
      import: 'default',
      eager: true,
    });
    const missing = new Set<string>();
    for (const [path, source] of Object.entries(sources)) {
      if (path.includes('.test.')) continue;
      const ast = ts.createSourceFile(
        path,
        String(source),
        ts.ScriptTarget.Latest,
        true,
        path.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
      );
      function visit(node: ts.Node) {
        if (
          ts.isCallExpression(node) &&
          node.expression.getText(ast) === 't' &&
          node.arguments[0] &&
          ts.isStringLiteral(node.arguments[0]) &&
          !(node.arguments[0].text in catalog)
        )
          missing.add(node.arguments[0].text);
        ts.forEachChild(node, visit);
      }
      visit(ast);
    }
    expect([...missing]).toEqual([]);
  });
  it('changes the interface preference without changing user content', () => {
    const source = { ...emptyStory(), title: 'An English title', description: 'Export easily.' };
    const before = JSON.stringify(source);
    setLanguage('fr');
    expect(getLanguage()).toBe('fr');
    expect(t('New decision')).toBe('Nouvelle décision');
    expect(localStorage.getItem('toolbox.language')).toBe('fr');
    expect(JSON.stringify(source)).toBe(before);
  });
  it('translates dynamic warnings while preserving recorded names and risks', () => {
    expect(translate('Recorded risk — Atlas: Confirm account limits.', 'fr')).toBe(
      'Risque documenté — Atlas : Confirm account limits.',
    );
    expect(translate('Unlink {title}', 'fr', { title: 'Atlas' })).toBe('Dissocier Atlas');
  });
  it('provides translated explanations and prompts for every implemented story rule', () => {
    const s = {
      ...emptyStory(),
      title: 'A',
      description:
        'Export fast, quickly, intuitive, easily, easy, user-friendly, correctly, seamless and efficient.',
    };
    for (const o of analyzeStory(s)) {
      expect(translate(o.category, 'fr')).not.toBe(o.category);
      expect(translate(o.explanation, 'fr')).not.toBe(o.explanation);
      expect(translate(o.suggestion, 'fr')).not.toBe(o.suggestion);
    }
  });
  it('ships parseable catalog data', () => {
    expect(JSON.parse(readFileSync('src/shared/i18n/fr.json', 'utf8'))).toEqual(catalog);
  });
});
