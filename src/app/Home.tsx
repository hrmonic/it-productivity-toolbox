import { t } from '../shared/i18n';
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
import { Badge, ToolLink } from '../shared/ui/primitives';
import { entityPath } from '../features/traceability/domain';
import { brand } from './brand';
import { humanDate } from '../shared/lib/format';

const tools = [
  {
    number: '01',
    name: 'DecisionTrace',
    line: 'Keep the reasoning within reach.',
    description:
      'Capture the context, alternatives, and trade-offs behind the choices that matter.',
    to: '/decisions',
    icon: GitBranch,
    label: 'Open the journal',
    className: 'decision',
  },
  {
    number: '02',
    name: 'Scope Radar',
    line: 'Know what changed. See what follows.',
    description: 'Compare the agreement with accepted scope, and test proposals before committing.',
    to: '/scope',
    icon: ListFilter,
    label: 'Explore your scope',
    className: 'scope',
  },
  {
    number: '03',
    name: 'StoryGap',
    line: 'Ask better questions before building.',
    description:
      'Turn ambiguous stories into a focused refinement conversation with transparent rules.',
    to: '/stories',
    icon: ScanText,
    label: 'Refine a story',
    className: 'story',
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
  const activity = project
    ? [
        ...project.decisions.map((d) => ({ ...d, kind: 'decision' as const })),
        ...project.changes.map((c) => ({ ...c, kind: 'change' as const })),
        ...project.stories.map((s) => ({ ...s, kind: 'story' as const })),
      ]
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, 4)
    : [];
  return (
    <>
      <div className="home-kicker">
        <span className="live-dot" />
        {t('A little structure. A lot more clarity.')}
        <span className="edition">{t('LOCAL-FIRST / OPEN SOURCE')}</span>
      </div>
      <section className="home-hero">
        <div>
          <span className="eyebrow">{t('For people who move projects forward')}</span>
          <h1>
            {t('Less context lost.')}
            <br />
            {t('More')} <em>{t('thoughtful')}</em>
            <br />
            {t('delivery')}
            <span className="accent">.</span>
          </h1>
          <p>
            {t('Keep the why. Understand the change. Clarify the work.')}
            <br />
            {t('Three focused tools, one connected project memory.')}
          </p>
          <div className="hero-actions">
            {project ? (
              <Link to="/decisions" className="button primary">
                {t('Continue your work')}
                <ArrowRight size={17} />
              </Link>
            ) : (
              <button className="button primary" onClick={onDemo} disabled={busy}>
                <Sparkles size={17} />
                {t('Explore the demo')}
              </button>
            )}
            <button className="button secondary" onClick={onCreate}>
              <Plus size={16} />
              {t('Create a project')}
            </button>
          </div>
          <div className="trust-line">
            <ShieldCheck size={15} />
            {t('No account. No paid API. Your data stays in this browser.')}
          </div>
        </div>
        <div className="hero-notebook">
          <div className="notebook-top">
            <span className="eyebrow">{t('The connected workflow')}</span>
            <span className="notebook-mark">↗</span>
          </div>
          <div className="notebook-step">
            <span className="notebook-node">
              <GitBranch size={19} />
            </span>
            <div>
              <small>{t('01 / Capture the rationale')}</small>
              <strong>{t('Why did we decide this?')}</strong>
            </div>
          </div>
          <div className="notebook-connector">
            <span />
            {t('Decision informs change')}
          </div>
          <div className="notebook-step">
            <span className="notebook-node">
              <ListFilter size={19} />
            </span>
            <div>
              <small>{t('02 / Understand the impact')}</small>
              <strong>{t('What changes in our scope?')}</strong>
            </div>
          </div>
          <div className="notebook-connector">
            <span />
            {t('Change affects requirements')}
          </div>
          <div className="notebook-step">
            <span className="notebook-node">
              <ScanText size={19} />
            </span>
            <div>
              <small>{t('03 / Clarify the outcome')}</small>
              <strong>{t('What should we build?')}</strong>
            </div>
          </div>
          <div className="notebook-bottom">
            {t('Explicit relationships. Shared understanding.')}
          </div>
        </div>
      </section>
      <div className="section-divider">
        <span>{t('YOUR WORK, WITH MORE CONTEXT')}</span>
        <span>{t('THREE TOOLS. NO EXTRA CEREMONY.')}</span>
      </div>
      <section className="tool-directory" aria-label={t('Explore the toolbox')}>
        {tools.map((tool) => (
          <div className={`tool-entry ${tool.className}`} key={tool.number}>
            <span className="tool-number">{tool.number}</span>
            <div className="tool-identity">
              <tool.icon size={22} />
              <h2>{tool.name}</h2>
              <span>{t(tool.line)}</span>
            </div>
            <p>{t(tool.description)}</p>
            <ToolLink to={project ? tool.to : '/projects'}>{t(tool.label)}</ToolLink>
          </div>
        ))}
      </section>
      <div className="home-bottom">
        <section>
          <div className="section-heading">
            <h2>{project ? t('Your project, in motion') : t('Start with a real conversation')}</h2>
            {project && (
              <Badge tone={project.demo ? 'demo' : ''}>
                {project.demo ? t('Fictional demo') : t('Local project')}
              </Badge>
            )}
          </div>
          {project ? (
            <>
              <p className="muted small">
                {t('Recently updated records in')} {project.name}.
              </p>
              {activity.length ? (
                <div className="activity-list">
                  {activity.map((item) => (
                    <Link key={item.id} to={entityPath(item)}>
                      <span className="activity-kind">{t(item.kind)}</span>
                      <strong>{item.title}</strong>
                      <time>{humanDate(item.updatedAt)}</time>
                      <ArrowUpRight size={14} />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="inset-empty">{t('Your first record will appear here.')}</p>
              )}
            </>
          ) : (
            <p className="muted">
              {t(
                'Explore a fictional customer portal project, or create a blank workspace for your next delivery. Nothing is sent to a server.',
              )}
            </p>
          )}
        </section>
        <aside className="field-notes">
          <span className="eyebrow">{t('Field notes / 001')}</span>
          <h3>{t('Useful tools should make the work clearer.')}</h3>
          <p>
            {t(
              'Every warning explains its reasoning. Missing estimates stay unknown. Your team stays in control of the decisions.',
            )}
          </p>
          <a href={`${brand.repository}/tree/main/docs`} target="_blank" rel="noreferrer">
            <BookOpen size={16} />
            {t('Read the product documentation')}
            <ArrowUpRight size={14} />
          </a>
        </aside>
      </div>
    </>
  );
}
