import { describe, expect, it } from 'vitest';
import { demoProject } from '../../shared/data/demo';
import { calculateScope, changesCsv } from './domain';
import { uid } from '../../shared/lib/utils';

describe('scope comparison and simulation', () => {
  it('includes only accepted changes', () => {
    const p = demoProject(),
      r = calculateScope(p.baselines[0]!, p.changes);
    expect(r.initial).toBe(16);
    expect(r.current).toBe(20);
    expect(r.delta).toBe(4);
    expect(r.percent).toBe(25);
    expect(r.items).toHaveLength(4);
  });
  it('simulates selected proposals without mutating persisted inputs', () => {
    const p = demoProject(),
      before = JSON.stringify(p),
      proposal = p.changes.find((c) => c.status === 'proposed')!;
    const r = calculateScope(p.baselines[0]!, p.changes, [proposal.id]);
    expect(r.current).toBe(23);
    expect(r.items).toHaveLength(5);
    expect(JSON.stringify(p)).toBe(before);
    expect(calculateScope(p.baselines[0]!, p.changes).current).toBe(20);
  });
  it('never simulates rejected changes', () => {
    const p = demoProject();
    expect(
      calculateScope(p.baselines[0]!, p.changes, [
        p.changes.find((c) => c.status === 'rejected')!.id,
      ]).current,
    ).toBe(20);
  });
  it('does not treat unknown effort as zero', () => {
    const p = demoProject();
    p.changes[0]!.estimate = null;
    const r = calculateScope(p.baselines[0]!, p.changes);
    expect(r.current).toBeNull();
    expect(r.delta).toBeNull();
    expect(r.percent).toBeNull();
    expect(r.missing).toContain('Current: Self-service CSV export');
    expect(r.alerts.some((a) => a.includes('no effort estimate'))).toBe(true);
  });
  it('handles a zero baseline without division by zero', () => {
    const p = demoProject();
    p.baselines[0]!.items.forEach((i) => (i.estimate = 0));
    const r = calculateScope(p.baselines[0]!, p.changes);
    expect(r.initial).toBe(0);
    expect(r.delta).toBe(4);
    expect(r.percent).toBeNull();
  });
  it('preserves explicit zero estimates', () => {
    const p = demoProject();
    p.changes[0]!.estimate = 0;
    expect(calculateScope(p.baselines[0]!, p.changes).current).toBe(16);
  });
  it('applies signed modifications and priorities', () => {
    const p = demoProject(),
      b = p.baselines[0]!,
      base = p.changes[0]!;
    p.changes = [
      { ...base, id: uid(), type: 'modification', targetId: b.items[0]!.id, estimate: -2 },
      { ...base, id: uid(), type: 'priority', targetId: b.items[0]!.id, priority: 'could' },
    ];
    const r = calculateScope(b, p.changes);
    expect(r.current).toBe(14);
    expect(r.items[0]?.priority).toBe('could');
  });
  it('does not publish negative totals as valid estimates', () => {
    const p = demoProject(),
      b = p.baselines[0]!;
    p.changes = [
      { ...p.changes[0]!, type: 'modification', targetId: b.items[0]!.id, estimate: -100 },
    ];
    const r = calculateScope(b, p.changes);
    expect(r.current).toBeNull();
    expect(r.alerts.some((a) => a.includes('negative'))).toBe(true);
  });
  it('detects dependents of removed deliverables', () => {
    const p = demoProject(),
      b = p.baselines[0]!;
    p.changes = [{ ...p.changes[0]!, type: 'removal', targetId: b.items[0]!.id, estimate: null }];
    const r = calculateScope(b, p.changes);
    expect(r.items).toHaveLength(2);
    expect(r.current).toBe(11);
    expect(r.alerts.some((a) => a.includes('depends on a removed'))).toBe(true);
  });
  it('reports repeated changes and missing targets', () => {
    const p = demoProject(),
      b = p.baselines[0]!,
      base = p.changes[0]!;
    const changes = [0, 1, 2].map(() => ({
      ...base,
      id: uid(),
      type: 'modification' as const,
      targetId: b.items[0]!.id,
      estimate: 1,
    }));
    changes.push({ ...changes[0]!, id: uid(), targetId: uid() });
    const r = calculateScope(b, changes);
    expect(r.alerts.some((a) => a.includes('at least three'))).toBe(true);
    expect(r.alerts.some((a) => a.includes('no longer in scope'))).toBe(true);
  });
  it('isolates baseline versions and estimation units', () => {
    const p = demoProject(),
      b = { ...p.baselines[0]!, id: uid(), version: 2, unit: 'points' as const };
    expect(calculateScope(b, p.changes).current).toBe(16);
    expect(calculateScope(b, p.changes).applied).toHaveLength(0);
  });
  it('exports formula-safe, quoted change registers', () => {
    const p = demoProject();
    p.changes[0]!.title = ' =HYPERLINK("malicious")';
    const csv = changesCsv(p.changes);
    expect(csv).toContain('"\' =HYPERLINK(""malicious"")"');
    expect(csv).toContain('Baseline ID');
  });
});
