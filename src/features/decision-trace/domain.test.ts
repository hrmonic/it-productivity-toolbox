import { describe, expect, it } from 'vitest';
import {
  createDecision,
  decisionMarkdown,
  decisionWarnings,
  emptyDecision,
  reviseDecision,
} from './domain';

describe('decision records', () => {
  it('starts with an explicit proposed status', () => {
    expect(emptyDecision().status).toBe('proposed');
  });
  it('requires a nonempty title', () => {
    expect(() => createDecision(emptyDecision())).toThrow();
  });
  it('preserves the previous complete content and reason', () => {
    const first = createDecision({ ...emptyDecision(), title: 'Use CSV', rationale: 'Portable' });
    const second = reviseDecision(
      first,
      { ...first, rationale: 'Interoperability', status: 'accepted' },
      'Team agreement',
    );
    expect(second.history).toHaveLength(1);
    expect(second.history[0]?.content.rationale).toBe('Portable');
    expect(second.history[0]?.content.status).toBe('proposed');
    expect(second.history[0]?.reason).toBe('Team agreement');
    expect(first.history).toEqual([]);
    expect(second.id).toBe(first.id);
  });
  it('does not create meaningless revisions', () => {
    const d = createDecision({ ...emptyDecision(), title: 'One' });
    expect(reviseDecision(d, d, '')).toBe(d);
  });
  it('rejects an unexplained change', () => {
    const d = createDecision({ ...emptyDecision(), title: 'One' });
    expect(() => reviseDecision(d, { ...d, title: 'Two' }, ' ')).toThrow('Explain why');
  });
  it('keeps superseding distinct from revising', () => {
    const d = createDecision({ ...emptyDecision(), title: 'One' });
    expect(
      reviseDecision(d, { ...d, status: 'superseded' }, 'Replaced by a new choice').status,
    ).toBe('superseded');
  });
  it('reports missing ownership, rationale, solution, and overdue reviews', () => {
    const d = createDecision({
      ...emptyDecision(),
      title: 'One',
      status: 'accepted',
      reviewDate: '2026-01-01',
    });
    expect(decisionWarnings(d, '2026-02-01')).toHaveLength(4);
    expect(decisionWarnings({ ...d, archived: true }, '2026-02-01')).toHaveLength(3);
  });
  it('rejects executable reference URLs', () => {
    expect(() =>
      createDecision({ ...emptyDecision(), title: 'One', references: ['javascript:alert(1)'] }),
    ).toThrow();
  });
  it('exports rationale, alternatives, and history', () => {
    const d = createDecision({
      ...emptyDecision(),
      title: 'CSV',
      rationale: 'Portable',
      alternatives: [{ name: 'PDF', pros: 'Readable', cons: 'Harder to process' }],
    });
    const md = decisionMarkdown([d]);
    expect(md).toContain('# CSV');
    expect(md).toContain('Portable');
    expect(md).toContain('### PDF');
    expect(md).toContain(d.id);
  });
});
