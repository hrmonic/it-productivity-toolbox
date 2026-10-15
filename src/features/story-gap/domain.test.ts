import { describe, expect, it } from 'vitest';
import { analyzeStory, createStory, emptyStory, reviseStory, storyMarkdown } from './domain';

describe('transparent story analysis', () => {
  it('recognizes French story structure and language-specific ambiguity', () => {
    const findings = analyzeStory({
      ...emptyStory(),
      title: 'Export',
      description:
        'En tant qu’utilisateur, je souhaite exporter mes données facilement, afin de préparer un rapport.',
    });
    expect(findings.map((o) => o.id)).toContain('ambiguous-facilement');
    expect(findings.map((o) => o.id)).not.toContain('persona');
    expect(findings.map((o) => o.id)).not.toContain('need');
    expect(findings.map((o) => o.id)).not.toContain('value');
    expect(findings.map((o) => o.id)).toContain('export-format');
  });
  it('finds missing need, value, criteria, and persona', () => {
    const ids = analyzeStory({ ...emptyStory(), title: 'Export' }).map((o) => o.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        'persona',
        'need',
        'value',
        'criteria-missing',
        'errors',
        'business-rules',
        'dependencies',
      ]),
    );
  });
  it('accepts classic story wording without structured fields', () => {
    const ids = analyzeStory({
      ...emptyStory(),
      title: 'Export',
      description: 'As an administrator, I want to export my data so that I can prepare reports.',
    }).map((o) => o.id);
    expect(ids).not.toContain('persona');
    expect(ids).not.toContain('need');
    expect(ids).not.toContain('value');
  });
  it('detects words, not arbitrary substrings', () => {
    expect(
      analyzeStory({
        ...emptyStory(),
        title: 'Breakfast',
        description: 'Breakfast is served.',
      }).some((o) => o.id === 'ambiguous-fast'),
    ).toBe(false);
  });
  it('asks export questions without inventing answers', () => {
    const observations = analyzeStory({
      ...emptyStory(),
      title: 'Export',
      description: 'Export data easily.',
    });
    expect(observations.map((o) => o.id)).toEqual(
      expect.arrayContaining([
        'ambiguous-easily',
        'export-format',
        'export-access',
        'export-empty',
      ]),
    );
    expect(observations.find((o) => o.id === 'export-format')?.suggestion).toBe(
      'Which export format and fields are required?',
    );
  });
  it('uses provided format, permissions, empty and error details', () => {
    const ids = analyzeStory({
      ...emptyStory(),
      title: 'Export',
      description:
        'Export CSV with account permissions. Show an error if unavailable. Show no data for an empty account.',
    }).map((o) => o.id);
    expect(ids).not.toContain('export-format');
    expect(ids).not.toContain('export-access');
    expect(ids).not.toContain('export-empty');
    expect(ids).not.toContain('errors');
  });
  it('flags criteria with no common observable result', () => {
    expect(
      analyzeStory({ ...emptyStory(), title: 'A', criteria: 'An intuitive experience.' }).map(
        (o) => o.id,
      ),
    ).toContain('criteria-observable');
  });
  it('is deterministic and does not mutate source text', () => {
    const s = { ...emptyStory(), title: 'A', description: 'The system should be fast.' },
      before = JSON.stringify(s);
    expect(analyzeStory(s)).toEqual(analyzeStory(s));
    expect(JSON.stringify(s)).toBe(before);
  });
  it('keeps the original and previous versions when refining', () => {
    const first = createStory({ ...emptyStory(), title: 'One', description: 'Original' });
    const next = reviseStory(
      { ...first, reviews: [{ ruleId: 'value', state: 'ignored', text: '' }] },
      { ...first, description: 'Refined' },
    );
    expect(next.original.description).toBe('Original');
    expect(next.history[0]?.content.description).toBe('Original');
    expect(next.reviews).toEqual([]);
    expect(first.description).toBe('Original');
  });
  it('does not create a version when content is unchanged', () => {
    const s = createStory({ ...emptyStory(), title: 'One' });
    expect(reviseStory(s, s)).toBe(s);
  });
  it('exports controlled refinement notes and open questions', () => {
    const s = createStory({ ...emptyStory(), title: 'One' });
    s.reviews = [
      { ruleId: 'value', state: 'accepted', text: 'Confirm the reporting benefit with the team.' },
    ];
    const md = storyMarkdown(s);
    expect(md).toContain('Confirm the reporting benefit');
    expect(md).toContain('## Open questions');
    expect(md).toContain('not confirmed requirements');
  });
});
