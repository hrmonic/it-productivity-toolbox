import { z } from 'zod';
import { translate, type Language } from '../../shared/i18n';
import { validateProject } from '../../shared/data/validation';
import type { Project } from '../../shared/types/models';
import { calculateScope } from '../scope-radar/domain';
import { analyzeStory } from '../story-gap/domain';
import { decisionWarnings } from '../decision-trace/domain';

export const reportKinds = ['decision', 'scope', 'story', 'executive', 'steering'] as const;
export const reportNames = {
  decision: 'Decision Report',
  scope: 'Scope Impact Report',
  story: 'Story Refinement Report',
  executive: 'Project Executive Brief',
  steering: 'Steering Committee Presentation',
};
export const sectionNames = {
  summary: 'Executive summary',
  decisions: 'Decisions',
  scope: 'Scope & changes',
  stories: 'Story refinement',
  links: 'Recorded connections',
  risks: 'Attention points',
  actions: 'Arbitrations & next actions',
};
export type SectionKey = keyof typeof sectionNames;
export const reportOptionsSchema = z
  .object({
    kind: z.enum(reportKinds),
    title: z.string().trim().min(1).max(180),
    introduction: z.string().max(3000),
    audience: z.enum([
      'Development team',
      'Product Owner',
      'Project leadership',
      'Steering committee',
      'Business stakeholders',
    ]),
    detail: z.enum(['summary', 'detailed']),
    language: z.enum(['en', 'fr']),
    from: z.iso.date().or(z.literal('')),
    until: z.iso.date().or(z.literal('')),
    selectedIds: z.array(z.string().uuid()).max(9000),
    baselineId: z.string().uuid().or(z.literal('')),
    sections: z
      .array(z.enum(['summary', 'decisions', 'scope', 'stories', 'links', 'risks', 'actions']))
      .min(1)
      .max(7),
  })
  .refine(
    (o) => !o.from || !o.until || o.from <= o.until,
    'The start date must be before the end date.',
  );
export type ReportOptions = z.infer<typeof reportOptionsSchema>;
export type ReportField = { label: string; text: string };
export type ReportEntry = { title: string; sourceIds: string[]; fields: ReportField[] };
export type ReportSection = { key: SectionKey; title: string; entries: ReportEntry[] };
export type ReportModel = {
  version: 1;
  projectId: string;
  projectRevision: number;
  projectName: string;
  generatedAt: string;
  fictional: boolean;
  options: ReportOptions;
  sections: ReportSection[];
  scopeSnapshot?: {
    initial: number | null;
    current: number | null;
    unit: string;
    sourceIds: string[];
  };
};
export function reportDefaults(project: Project, language: Language): ReportOptions {
  return {
    kind: 'executive',
    title: translate('Project Executive Brief', language),
    introduction: '',
    audience: 'Project leadership',
    detail: 'detailed',
    language,
    from: '',
    until: '',
    selectedIds: [
      ...project.decisions.filter((d) => !d.archived),
      ...project.changes,
      ...project.stories,
    ].map((i) => i.id),
    baselineId: project.baselines.at(-1)?.id ?? '',
    sections: ['summary', 'decisions', 'scope', 'stories', 'links', 'risks', 'actions'],
  };
}
export function composeReport(
  input: Project,
  options: ReportOptions,
  generatedAt = new Date().toISOString(),
): ReportModel {
  const p = validateProject(input),
    o = reportOptionsSchema.parse(options);
  if (new Set(o.sections).size !== o.sections.length)
    throw new Error('Report sections must be unique.');
  const tr = (s: string) => translate(s, o.language);
  const value = (s: string) => s.trim() || tr('Not recorded');
  const selected = (id: string, date: string) =>
    o.selectedIds.includes(id) &&
    (!o.from || date.slice(0, 10) >= o.from) &&
    (!o.until || date.slice(0, 10) <= o.until);
  const decisions = p.decisions.filter(
    (d) => selected(d.id, d.date) && ['decision', 'executive', 'steering'].includes(o.kind),
  );
  const baseline = p.baselines.find((b) => b.id === o.baselineId);
  const changes = p.changes.filter(
    (c) =>
      selected(c.id, c.date) &&
      c.baselineId === baseline?.id &&
      ['scope', 'executive', 'steering'].includes(o.kind),
  );
  const stories = p.stories.filter(
    (s) => selected(s.id, s.updatedAt) && ['story', 'executive', 'steering'].includes(o.kind),
  );
  const included = new Set([...decisions, ...changes, ...stories].map((i) => i.id));
  const related = p.relations.filter((r) => included.has(r.from.id) && included.has(r.to.id));
  const fields = (items: [string, string][]): ReportField[] =>
    items.filter(([, text]) => text.trim()).map(([label, text]) => ({ label: tr(label), text }));
  const riskEntries: ReportEntry[] = [
    ...decisions.flatMap((d) =>
      [
        ...decisionWarnings(d, o.until || generatedAt.slice(0, 10)),
        ...(d.risks ? [d.risks] : []),
        ...(d.status === 'superseded' &&
        p.relations.some((r) => r.from.id === d.id || r.to.id === d.id)
          ? [tr('Superseded decision still has recorded links. Review their relevance.')]
          : []),
      ].map((w) => ({
        title: d.title,
        sourceIds: [d.id],
        fields: fields([['Attention points', tr(w)]]),
      })),
    ),
    ...changes
      .filter((c) => c.risks)
      .map((c) => ({
        title: c.title,
        sourceIds: [c.id],
        fields: fields([['Known risks', c.risks]]),
      })),
  ];
  const sections: ReportSection[] = [];
  let scopeSnapshot: ReportModel['scopeSnapshot'];
  const push = (key: SectionKey, entries: ReportEntry[]) => {
    if (entries.length) sections.push({ key, title: tr(sectionNames[key]), entries });
  };
  if (included.size)
    push('summary', [
      {
        title: p.name,
        sourceIds: [p.id],
        fields: fields([
          [
            'Selected records',
            `${decisions.length} ${tr('decisions')} · ${changes.length} ${tr('changes')} · ${stories.length} ${tr('stories')}`,
          ],
          ['Audience', tr(o.audience)],
          ['Introduction', o.introduction],
          ['Reference period', `${o.from || tr('All dates')} / ${o.until || tr('All dates')}`],
          [
            'Data status',
            p.dataOrigin === 'fictional'
              ? tr('Fictional example data')
              : tr('User-recorded project data'),
          ],
        ]),
      },
    ]);
  push(
    'decisions',
    decisions.map((d) => ({
      title: d.title,
      sourceIds: [d.id],
      fields: fields([
        ['Status', tr(d.status)],
        ['Owner', value(d.owner)],
        ['Decision date', new Date(`${d.date}T12:00:00`).toLocaleDateString(o.language)],
        ['Context & problem', d.context],
        ['Selected solution', value(d.solution)],
        ['Rationale', value(d.rationale)],
        ...(o.detail === 'detailed'
          ? ([
              [
                'Alternatives',
                d.alternatives
                  .map(
                    (a) =>
                      `${a.name}\n${tr('Advantages')}: ${a.pros}\n${tr('Trade-offs')}: ${a.cons}`,
                  )
                  .join('\n\n'),
              ],
              ['Assumptions', d.assumptions],
              ['Constraints', d.constraints],
              ['Stakeholders', d.stakeholders.join(', ')],
              ['References', d.references.join('\n')],
              ['Revision history', d.history.map((h) => `${h.at}: ${h.reason}`).join('\n')],
            ] as [string, string][])
          : []),
      ]),
    })),
  );
  if (
    baseline &&
    (!o.until || baseline.date <= o.until) &&
    ['scope', 'executive', 'steering'].includes(o.kind) &&
    (changes.length || o.kind === 'scope')
  ) {
    const context = p.changes.filter(
      (c) => c.baselineId === baseline.id && (!o.until || c.date <= o.until),
    );
    const r = calculateScope(baseline, context);
    const unit = tr(baseline.unit === 'days' ? 'person-days' : 'story points');
    scopeSnapshot = {
      initial: r.initial,
      current: r.current,
      unit,
      sourceIds: [baseline.id, ...r.applied.map((c) => c.id)],
    };
    const estimate = (n: number | null) =>
      n === null
        ? tr('Unavailable')
        : `${new Intl.NumberFormat(o.language, { maximumFractionDigits: 2 }).format(n)} ${unit}`;
    push('scope', [
      {
        title: `${tr('Baseline')} v${baseline.version}`,
        sourceIds: [
          baseline.id,
          ...context.filter((c) => c.status === 'accepted').map((c) => c.id),
        ],
        fields: fields([
          ['Objective', baseline.objective],
          ['Status', tr(baseline.frozenAt ? 'Frozen' : 'Draft')],
          [
            'Calculation context',
            tr(
              'Snapshot includes every accepted change for this baseline through the reference end date. Selection and start date filter the register, not the snapshot.',
            ),
          ],
          ['Initial effort · estimate', estimate(r.initial)],
          ['Current effort · estimate', estimate(r.current)],
          ['Effort change · estimate', estimate(r.delta)],
          [
            'Current deliverables',
            r.items
              .map((i) => `${i.title}: ${estimate(i.estimate)} (${tr(i.priority)})`)
              .join('\n'),
          ],
          ['Assumptions', baseline.assumptions],
          ['Constraints', baseline.constraints],
          ['Attention points', r.alerts.map(tr).join('\n')],
          ['Missing estimates', r.missing.map(tr).join('\n')],
        ]),
      },
      ...changes.map((c) => ({
        title: c.title,
        sourceIds: [c.id, baseline.id],
        fields: fields([
          ['Status', tr(c.status)],
          ['Change type', tr(c.type)],
          ['Description', c.description],
          ['Justification', c.justification],
          ['Requested by', value(c.author)],
          [
            'Effort input',
            c.estimate === null
              ? tr('Not estimated')
              : `${c.estimate} ${unit} (${tr(c.type === 'modification' ? 'delta' : 'input')})`,
          ],
          [
            'Dependencies',
            c.dependencies
              .map(
                (id) =>
                  baseline.items.find((i) => i.id === id)?.title ??
                  p.changes.find((i) => i.id === id)?.title ??
                  id,
              )
              .join(', '),
          ],
        ]),
      })),
    ]);
  }
  push(
    'stories',
    stories.map((s) => ({
      title: s.title,
      sourceIds: [s.id],
      fields: fields([
        ['Original story', s.original.description],
        ['User story', s.description],
        ['User / persona', s.persona],
        ['Need', s.need],
        ['User value', s.value],
        ['Acceptance criteria', s.criteria],
        [
          'Confirmed scenarios',
          s.scenarios
            .map(
              (c) =>
                `${tr(c.kind)}\n${tr('Given')}: ${c.given}\n${tr('When')}: ${c.when}\n${tr('Then')}: ${c.then}`,
            )
            .join('\n\n'),
        ],
        [
          'Coverage Matrix',
          s.requirements
            .map(
              (r) =>
                `${r.text}: ${s.scenarios.filter((c) => c.requirementIds.includes(r.id) && c.given.trim() && c.when.trim() && c.then.trim()).length} ${tr('linked complete scenarios')}`,
            )
            .join('\n'),
        ],
        [
          'Accepted notes',
          s.reviews
            .filter((r) => r.state === 'accepted')
            .map((r) => r.text)
            .join('\n'),
        ],
        [
          'Open questions',
          analyzeStory(s)
            .filter((f) => !s.reviews.some((r) => r.ruleId === f.id))
            .map((f) => `${tr(f.explanation)} ${tr(f.suggestion)}`)
            .join('\n'),
        ],
        ...(o.detail === 'detailed'
          ? ([
              ['Business rules', s.rules],
              ['Constraints', s.constraints],
              ['Dependencies', s.dependencies],
            ] as [string, string][])
          : []),
      ]),
    })),
  );
  const titles = new Map([...p.decisions, ...p.changes, ...p.stories].map((e) => [e.id, e.title]));
  push(
    'links',
    related.map((r) => ({
      title: `${titles.get(r.from.id)} → ${titles.get(r.to.id)}`,
      sourceIds: [r.id, r.from.id, r.to.id],
      fields: fields([
        ['Relationship', tr(r.type)],
        ['Relationship context', value(r.note)],
      ]),
    })),
  );
  push('risks', riskEntries);
  if (o.detail === 'summary') {
    const keep: Partial<Record<SectionKey, string[]>> = {
      decisions: ['Status', 'Owner', 'Selected solution', 'Rationale'],
      scope: [
        'Status',
        'Calculation context',
        'Initial effort · estimate',
        'Current effort · estimate',
        'Effort change · estimate',
        'Description',
        'Justification',
        'Effort input',
      ],
      stories: ['User story', 'Need', 'User value', 'Open questions'],
    };
    for (const section of sections) {
      const allowed = keep[section.key]?.map(tr);
      if (allowed)
        for (const entry of section.entries)
          entry.fields = entry.fields.filter((f) => allowed.includes(f.label));
    }
  }
  push('actions', [
    ...decisions
      .filter((d) => d.status === 'proposed')
      .map((d) => ({
        title: d.title,
        sourceIds: [d.id],
        fields: fields([
          ['Arbitration required', tr('Review the proposed decision with the recorded owner.')],
          ['Owner', value(d.owner)],
        ]),
      })),
    ...changes
      .filter((c) => c.status === 'proposed')
      .map((c) => ({
        title: c.title,
        sourceIds: [c.id],
        fields: fields([
          [
            'Arbitration required',
            tr('Accept or reject this proposal explicitly after reviewing its impacts.'),
          ],
        ]),
      })),
  ]);
  return {
    version: 1,
    projectId: p.id,
    projectRevision: p.revision,
    projectName: p.name,
    generatedAt,
    fictional: p.dataOrigin === 'fictional',
    options: o,
    sections: o.sections.flatMap((key) => sections.filter((s) => s.key === key)),
    ...(o.sections.includes('scope') && scopeSnapshot ? { scopeSnapshot } : {}),
  };
}
