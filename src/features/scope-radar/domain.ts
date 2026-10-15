import { getLanguage, t } from '../../shared/i18n';
import type { Baseline, Change, Deliverable, Project } from '../../shared/types/models';
import { csv } from '../../shared/lib/utils';

export type ScopeResult = {
  items: Deliverable[];
  initial: number | null;
  current: number | null;
  delta: number | null;
  percent: number | null;
  alerts: string[];
  missing: string[];
  applied: Change[];
};
export function latestBaseline(project: Project) {
  return project.baselines.at(-1);
}

export function calculateScope(
  baseline: Baseline,
  changes: Change[],
  simulation: string[] = [],
): ScopeResult {
  const items = structuredClone(baseline.items);
  const relevant = changes.filter((c) => c.baselineId === baseline.id);
  const applied = relevant
    .filter(
      (c) => c.status === 'accepted' || (c.status === 'proposed' && simulation.includes(c.id)),
    )
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        a.createdAt.localeCompare(b.createdAt) ||
        a.id.localeCompare(b.id),
    );
  const alerts: string[] = [];
  for (const c of applied) {
    const index = items.findIndex((item) => item.id === c.targetId);
    if (c.type === 'addition') {
      items.push({
        id: c.id,
        title: c.title,
        priority: c.priority,
        estimate: c.estimate,
        dependencies: [...c.dependencies],
      });
    } else if (c.type === 'constraint') {
      alerts.push(
        `“${c.title}”: constraint effort is not quantified. Totals include deliverables only; record a modification to quantify additional work.`,
      );
    } else if (index < 0) {
      alerts.push(`“${c.title}” refers to a deliverable that is no longer in scope.`);
    } else {
      const target = items[index]!;
      if (c.type === 'removal') items.splice(index, 1);
      if (c.type === 'priority') target.priority = c.priority;
      if (c.type === 'modification') {
        target.estimate =
          target.estimate === null || c.estimate === null ? null : target.estimate + c.estimate;
        if (target.estimate !== null && target.estimate < 0) {
          alerts.push(
            `“${c.title}” would create a negative total estimate. The total is unavailable.`,
          );
          target.estimate = null;
        }
        target.dependencies = [...new Set([...target.dependencies, ...c.dependencies])];
      }
    }
    if ((c.type === 'addition' || c.type === 'modification') && c.estimate === null)
      alerts.push(`“${c.title}” has no effort estimate.`);
    if (c.risks.trim()) alerts.push(`Recorded risk — ${c.title}: ${c.risks}`);
  }
  const ids = new Set(items.map((i) => i.id));
  for (const item of items)
    for (const dep of item.dependencies)
      if (!ids.has(dep))
        alerts.push(`“${item.title}” depends on a removed or unavailable deliverable (${dep}).`);
  for (const item of baseline.items)
    if (applied.filter((c) => c.targetId === item.id).length >= 3)
      alerts.push(`“${item.title}” has at least three applied changes. Review cumulative effects.`);
  const sum = (values: Deliverable[]) =>
    values.some((i) => i.estimate === null) ? null : values.reduce((n, i) => n + i.estimate!, 0);
  const initial = sum(baseline.items),
    current = sum(items);
  const delta = initial === null || current === null ? null : current - initial;
  const percent =
    initial === null || initial === 0 || delta === null ? null : (delta / initial) * 100;
  const missing = [
    ...new Set([
      ...baseline.items.filter((i) => i.estimate === null).map((i) => `Baseline: ${i.title}`),
      ...items.filter((i) => i.estimate === null).map((i) => `Current: ${i.title}`),
    ]),
  ];
  return {
    items,
    initial,
    current,
    delta,
    percent,
    alerts: [...new Set(alerts)],
    missing,
    applied,
  };
}
export function scopeMarkdown(baseline: Baseline, changes: Change[]) {
  const r = calculateScope(baseline, changes);
  const value = (n: number | null) =>
    n === null
      ? t('Unavailable')
      : `${new Intl.NumberFormat(getLanguage(), { maximumFractionDigits: 2 }).format(n)} ${t(baseline.unit === 'days' ? 'person-days' : 'story points')}`;
  const sections: [string, string][] = [
    ['Objective', baseline.objective],
    ['Assumptions', baseline.assumptions],
    ['Constraints', baseline.constraints],
    ['Initial effort · estimate', value(r.initial)],
    ['Current effort · estimate', value(r.current)],
    ['Effort change · estimate', value(r.delta)],
    [
      'Current deliverables',
      r.items.map((i) => `- ${i.title}: ${value(i.estimate)} (${t(i.priority)})`).join('\n'),
    ],
    [
      'Change register',
      changes
        .filter((c) => c.baselineId === baseline.id)
        .map(
          (c) =>
            `- ${c.date} | ${t(c.status)} | ${t(c.type)} | ${c.title}\n  ${t('Justification')}: ${c.justification}\n  ${t('Author')}: ${c.author}\n  ${t('Known risks')}: ${c.risks || t('Not recorded')}`,
        )
        .join('\n'),
    ],
    [
      'Attention points',
      r.alerts.map((a) => `- ${t(a)}`).join('\n') ||
        t('No attention points identified by the implemented rules.'),
    ],
    ['Missing estimates', r.missing.map((m) => t(m)).join('\n') || t('None')],
  ];
  return `# ${t('Scope Impact Report')}\n\n${t('Baseline')} v${baseline.version} · ${baseline.date}\n${t('Status')}: ${t(baseline.frozenAt ? 'Frozen' : 'Draft')}\n\n${sections.map(([name, text]) => `## ${t(name)}\n${text || t('Not recorded')}`).join('\n\n')}`;
}
export function changesCsv(changes: Change[]) {
  return csv([
    [
      'ID',
      'Baseline ID',
      'Date',
      'Title',
      'Type',
      'Status',
      'Author',
      'Description',
      'Justification',
      'Target ID',
      'Effort delta / addition',
      'Priority',
      'Dependencies',
      'Risks',
    ].map((heading) => t(heading)),
    ...changes.map((c) => [
      c.id,
      c.baselineId,
      c.date,
      c.title,
      t(c.type),
      t(c.status),
      c.author,
      c.description,
      c.justification,
      c.targetId,
      c.estimate,
      c.priority,
      c.dependencies.join('; '),
      c.risks,
    ]),
  ]);
}
