import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  GitBranch,
  ListFilter,
  Plus,
  ScanText,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Project } from '../shared/types/models';
import { Badge } from '../shared/ui/primitives';
import { entityPath, type EntityRef } from '../features/traceability/domain';
import { decisionWarnings } from '../features/decision-trace/domain';
import { latestBaseline } from '../features/scope-radar/domain';
import { analyzeStory } from '../features/story-gap/domain';
import { brand } from './brand';
import { humanDate } from '../shared/lib/format';
import { t } from '../shared/i18n';
import QuickCapture from './QuickCapture';

const tools = [
  {
    number: '01',
    name: 'DecisionTrace',
    description: 'Capture a choice and keep its reasoning accessible.',
    to: '/decisions',
    icon: GitBranch,
    action: 'Open the journal',
  },
  {
    number: '02',
    name: 'Scope Radar',
    description: 'Compare the agreement, review changes, and test proposals.',
    to: '/scope',
    icon: ListFilter,
    action: 'Explore your scope',
  },
  {
    number: '03',
    name: 'StoryGap',
    description: 'Find unanswered questions before implementation begins.',
    to: '/stories',
    icon: ScanText,
    action: 'Refine a story',
  },
];

export default function Home({
  project,
  onDemo,
  onCreate,
  busy,
}: {
  project?: Project;
  onDemo: () => void;
  onCreate: () => void;
  busy: boolean;
}) {
  const baseline = project ? latestBaseline(project) : undefined;
  const changes = project?.changes.filter((change) => change.baselineId === baseline?.id) ?? [];
  const attention: { ref: EntityRef; title: string; reason: string; action: string }[] = [];
  if (project) {
    for (const decision of project.decisions.filter(
      (d) => !d.archived && d.status !== 'superseded' && d.status !== 'rejected',
    )) {
      const warning = decisionWarnings(decision)[0];
      if (warning || decision.status === 'proposed')
        attention.push({
          ref: { kind: 'decision', id: decision.id },
          title: decision.title,
          reason: warning ? t(warning) : t('Awaiting a decision'),
          action: t('Review decision'),
        });
    }
    for (const change of changes.filter((c) => c.status === 'proposed'))
      attention.push({
        ref: { kind: 'change', id: change.id },
        title: change.title,
        reason: t('Proposed change awaiting review'),
        action: t('Review change'),
      });
    for (const story of project.stories) {
      const count = analyzeStory(story).filter(
        (o) => !story.reviews.some((r) => r.ruleId === o.id),
      ).length;
      if (count)
        attention.push({
          ref: { kind: 'story', id: story.id },
          title: story.title,
          reason: t('{count} refinement prompts to review', { count }),
          action: t('Review story'),
        });
    }
  }
  const activity = project
    ? [
        ...project.decisions.map((d) => ({ ...d, kind: 'decision' as const })),
        ...project.changes.map((c) => ({ ...c, kind: 'change' as const })),
        ...project.stories.map((s) => ({ ...s, kind: 'story' as const })),
      ]
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, 5)
    : [];
  const counts = project
    ? [project.decisions.filter((d) => !d.archived).length, changes.length, project.stories.length]
    : [];
  return (
    <>
      {project ? (
        <>
          <div className="workspace-overview-heading">
            <div>
              <div className="eyebrow">{t('Project overview')}</div>
              <h1>{project.name}</h1>
              <p>
                {project.description ||
                  t('A shared context for your decisions, scope, and requirements.')}
              </p>
            </div>
            <div className="overview-actions">
              <Link className="button primary" to="/decisions?new=1">
                <Plus size={17} />
                {t('New decision')}
              </Link>
              <Link className="button secondary" to="/stories?new=1">
                <Plus size={17} />
                {t('New story')}
              </Link>
            </div>
          </div>
          <div className="workspace-context-bar">
            <span className="context-project-icon">
              <ShieldCheck size={16} />
              {t('Local workspace')}
            </span>
            {project.dataOrigin === 'fictional' && (
              <Badge tone="demo">{t('Fictional example data')}</Badge>
            )}
            <span className="context-baseline">
              {baseline
                ? t('Baseline version {version}', { version: baseline.version })
                : t('No baseline defined')}
              {baseline && <> · {baseline.frozenAt ? t('Frozen') : t('Draft')}</>}
            </span>
            <Link to="/settings">
              {t('Backups & settings')}
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </>
      ) : (
        <section className="welcome-workspace">
          <div className="welcome-copy">
            <span className="eyebrow">{t('IT Productivity Toolbox')}</span>
            <h1>{t('Your delivery workspace.')}</h1>
            <p>
              {t(
                'Keep decisions, scope changes, and requirements connected. Start with a real workflow in minutes.',
              )}
            </p>
            <div className="hero-actions">
              <button className="button primary" onClick={onDemo} disabled={busy}>
                <Sparkles size={17} />
                {t('Explore the demo')}
              </button>
              <button className="button secondary" onClick={onCreate}>
                <Plus size={17} />
                {t('Create a project')}
              </button>
            </div>
            <div className="trust-line">
              <ShieldCheck size={16} />
              {t('No account. No paid API. Your data stays in this browser.')}
            </div>
          </div>
          <div className="welcome-workflow" aria-label={t('The connected workflow')}>
            <div>
              <GitBranch size={20} />
              <span>
                <small>{t('DecisionTrace')}</small>
                <strong>{t('Why did we decide this?')}</strong>
              </span>
            </div>
            <p>{t('Decision informs change')}</p>
            <div>
              <ListFilter size={20} />
              <span>
                <small>{t('Scope Radar')}</small>
                <strong>{t('What changes in our scope?')}</strong>
              </span>
            </div>
            <p>{t('Change affects requirements')}</p>
            <div>
              <ScanText size={20} />
              <span>
                <small>{t('StoryGap')}</small>
                <strong>{t('What should we build?')}</strong>
              </span>
            </div>
          </div>
        </section>
      )}
      <section className="workspace-tools" aria-label={t('Explore the toolbox')}>
        {tools.map((tool, i) => (
          <Link
            className={`workspace-tool tool-${tool.number}`}
            key={tool.number}
            to={project ? tool.to : '/projects'}
          >
            <div className="workspace-tool-top">
              <span className="tool-symbol">
                <tool.icon size={21} />
              </span>
              {project && (
                <span className="workspace-tool-count">
                  {counts[i]} <small>{t(['decisions', 'changes', 'stories'][i]!)}</small>
                </span>
              )}
            </div>
            <h2>{tool.name}</h2>
            <p>{t(tool.description)}</p>
            <span className="workspace-tool-action">
              {t(tool.action)}
              <ArrowRight size={16} />
            </span>
          </Link>
        ))}
      </section>
      {project ? (
        <section className="report-bridge">
          <div>
            <h2>{t('Turn your analysis into a shared document.')}</h2>
            <p>
              {t(
                'Bring decisions, scope impacts and refinement questions together. Apply your company identity and export a PDF or editable PowerPoint.',
              )}
            </p>
          </div>
          <div className="studio-toolbar">
            <QuickCapture key={project.id} />
            <Link className="button primary" to="/reports">
              {t('Open Report Studio')}
            </Link>
            <Link className="button secondary" to="/brands">
              {t('Open Brand Studio')}
            </Link>
          </div>
        </section>
      ) : null}
      {project ? (
        <div className="overview-grid">
          <section className="attention-worklist">
            <div className="section-heading">
              <div>
                <h2>{t('Ready for your review')}</h2>
                <p>{t('Recorded proposals and rule-based prompts across this project.')}</p>
              </div>
              <span className="count">{attention.length}</span>
            </div>
            {attention.length ? (
              <div className="attention-rows">
                {attention.slice(0, 6).map((item) => (
                  <Link key={`${item.ref.kind}-${item.ref.id}`} to={entityPath(item.ref)}>
                    <span className={`attention-kind ${item.ref.kind}`}>
                      {item.ref.kind === 'decision' ? (
                        <GitBranch size={17} />
                      ) : item.ref.kind === 'change' ? (
                        <ListFilter size={17} />
                      ) : (
                        <ScanText size={17} />
                      )}
                    </span>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.reason}</p>
                    </div>
                    <span className="attention-action">
                      {item.action}
                      <ArrowUpRight size={15} />
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="review-empty">
                <ShieldCheck size={23} />
                <strong>{t('Nothing queued for review')}</strong>
                <p>
                  {t(
                    'No pending items were identified by the current rules. Continue reviewing project context with your team.',
                  )}
                </p>
              </div>
            )}
            {attention.length > 6 && (
              <p className="overview-footnote">
                {t(
                  'Showing {shown} of {total} items. Open each tool to review the complete project.',
                  { shown: 6, total: attention.length },
                )}
              </p>
            )}
          </section>
          <section className="recent-work">
            <div className="section-heading">
              <h2>{t('Recently updated')}</h2>
              <span className="eyebrow">{t('This project')}</span>
            </div>
            {activity.length ? (
              <div className="recent-work-list">
                {activity.map((item) => (
                  <Link key={item.id} to={entityPath(item)}>
                    <span className="eyebrow">{t(item.kind)}</span>
                    <strong>{item.title}</strong>
                    <span className="recent-work-date">
                      {humanDate(item.updatedAt)}
                      <ArrowUpRight size={14} />
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="inset-empty">{t('Your first record will appear here.')}</p>
            )}
          </section>
        </div>
      ) : (
        <div className="getting-started-note">
          <BookOpen size={20} />
          <div>
            <strong>{t('Three tools. One traceable workflow.')}</strong>
            <p>
              {t(
                'The optional Atlas demo contains fictional decisions, changes, and stories you can edit. A blank project starts with your own context.',
              )}
            </p>
          </div>
          <a
            className="text-link"
            href={`${brand.repository}/tree/main/docs`}
            target="_blank"
            rel="noreferrer"
          >
            {t('Documentation')}
            <ArrowUpRight size={15} />
          </a>
        </div>
      )}
    </>
  );
}
