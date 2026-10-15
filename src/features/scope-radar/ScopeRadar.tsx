import { t } from '../../shared/i18n';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  FlaskConical,
  LockKeyhole,
  Pencil,
  Plus,
} from 'lucide-react';
import { useWorkspace } from '../../app/workspace-context';
import { calculateScope, changesCsv, latestBaseline, scopeMarkdown } from './domain';
import { BaselineForm, ChangeForm } from './ScopeForms';
import {
  Badge,
  Confirm,
  Empty,
  Modal,
  Notice,
  PageHeading,
  TextBlock,
} from '../../shared/ui/primitives';
import { RelatedItems } from '../traceability/RelatedItems';
import { download, now } from '../../shared/lib/utils';
import { humanDate, label } from '../../shared/lib/format';

export default function ScopeRadar() {
  const { project, save } = useWorkspace();
  const [params, setParams] = useSearchParams();
  const [form, setForm] = useState<'baseline' | 'revision' | 'change' | ''>(''),
    [editing, setEditing] = useState(''),
    [freeze, setFreeze] = useState(false),
    [simulation, setSimulation] = useState<string[]>([]),
    [version, setVersion] = useState(''),
    [filter, setFilter] = useState('all');
  const latest = latestBaseline(project),
    baseline = project.baselines.find((b) => b.id === version) ?? latest;
  const active = baseline?.id === latest?.id;
  const changes = project.changes.filter((c) => c.baselineId === baseline?.id);
  const result = baseline ? calculateScope(baseline, changes) : undefined;
  const simulated = baseline ? calculateScope(baseline, changes, simulation) : undefined;
  const selected = project.changes.find((c) => c.id === params.get('id'));
  const detailBaseline = project.baselines.find((b) => b.id === selected?.baselineId);
  const metric = (value: number | null | undefined, signed = false) =>
    value === null || value === undefined
      ? t('Unavailable')
      : `${signed && value > 0 ? '+' : ''}${Number(value.toFixed(2))}`;
  return (
    <>
      <PageHeading
        eyebrow={t('02 / Scope Radar')}
        title={selected ? selected.title : t('Scope overview')}
        actions={
          baseline && !selected ? (
            <>
              <button
                className="button secondary"
                onClick={() =>
                  download('scope-report.md', scopeMarkdown(baseline, changes), 'text/markdown')
                }
              >
                <ArrowDownToLine size={16} />
                {t('Export report')}
              </button>
              <button
                className="button primary"
                disabled={!baseline.frozenAt || !active}
                onClick={() => setForm('change')}
              >
                <Plus size={17} />
                {t('New change')}
              </button>
            </>
          ) : undefined
        }
      >
        {selected
          ? t('The request, its rationale, and its recorded effect on the project.')
          : t('Compare what was agreed with what is accepted. Explore what could come next.')}
      </PageHeading>
      {selected ? (
        <>
          <button className="back-link" onClick={() => setParams({})}>
            <ArrowLeft size={15} />
            {t('Back to scope')}
          </button>
          <div className="detail-grid">
            <article className="paper">
              <div className="record-meta">
                <Badge tone={selected.status}>{label(selected.status, 'change')}</Badge>
                <span>{label(selected.type)}</span>
                <span>
                  {t('Baseline v')}
                  {detailBaseline?.version}
                </span>
                <span>{humanDate(selected.date)}</span>
              </div>
              <div className="record-actions">
                {selected.status === 'proposed' && (
                  <button
                    className="button secondary"
                    onClick={() => {
                      setEditing(selected.id);
                      setForm('change');
                    }}
                  >
                    <Pencil size={15} />
                    {t('Edit proposal')}
                  </button>
                )}
                <button
                  className="button quiet"
                  onClick={() =>
                    download('change.json', JSON.stringify(selected, null, 2), 'application/json')
                  }
                >
                  {t('Export JSON')}
                </button>
              </div>
              {selected.status !== 'proposed' && (
                <Notice>
                  {t('This ledger entry is')} {selected.status}
                  {t(
                    '. Record a new change or create a baseline revision to document a different agreement.',
                  )}
                </Notice>
              )}
              <TextBlock title={t('Description')}>{selected.description}</TextBlock>
              <TextBlock title={t('Justification')}>{selected.justification}</TextBlock>
              <div className="two-columns">
                <TextBlock title={t('Requested by')}>{selected.author}</TextBlock>
                <TextBlock title={t('Effort input')}>
                  {selected.estimate === null
                    ? t('Not estimated')
                    : `${selected.estimate} ${t(detailBaseline?.unit ?? '')} ${selected.type === 'modification' ? t('(delta)') : t('(addition)')}`}
                </TextBlock>
              </div>
              <TextBlock title={t('Affected deliverable')}>
                {detailBaseline?.items.find((i) => i.id === selected.targetId)?.title ??
                  project.changes.find((c) => c.id === selected.targetId)?.title ??
                  t('Not applicable')}
              </TextBlock>
              <TextBlock title={t('Affected dependencies')}>
                {selected.dependencies
                  .map(
                    (id) =>
                      detailBaseline?.items.find((i) => i.id === id)?.title ??
                      project.changes.find((c) => c.id === id)?.title ??
                      id,
                  )
                  .join(', ')}
              </TextBlock>
              <TextBlock title={t('Known risks')}>{selected.risks}</TextBlock>
              <footer className="record-id">
                {t('Record')} {selected.id}
              </footer>
            </article>
            <aside>
              <RelatedItems entity={{ kind: 'change', id: selected.id }} />
            </aside>
          </div>
        </>
      ) : !baseline || !result ? (
        <Empty
          title={t('A clear baseline is a better starting point.')}
          action={t('Define baseline')}
          onAction={() => setForm('baseline')}
        >
          {t(
            'List the agreed deliverables and any known estimates. Freeze the baseline when you are ready to track changes.',
          )}
        </Empty>
      ) : (
        <>
          <div className="baseline-strip">
            <div>
              <span className="eyebrow">{t('Reference point')}</span>
              <div className="baseline-title">
                <strong>
                  {t('Baseline v')}
                  {baseline.version}
                </strong>
                <Badge tone={baseline.frozenAt ? 'accepted' : 'proposed'}>
                  {baseline.frozenAt ? (
                    <>
                      <LockKeyhole size={12} />
                      {t('Frozen')}
                    </>
                  ) : (
                    'Draft'
                  )}
                </Badge>
                <span>{humanDate(baseline.date)}</span>
              </div>
            </div>
            <div className="baseline-controls">
              <select
                aria-label={t('Baseline version')}
                value={baseline.id}
                onChange={(e) => {
                  setVersion(e.target.value);
                  setSimulation([]);
                }}
              >
                {[...project.baselines].reverse().map((b) => (
                  <option key={b.id} value={b.id}>
                    {t('Version')} {b.version}
                    {b.frozenAt ? t(' · frozen') : t(' · draft')}
                  </option>
                ))}
              </select>
              {active &&
                (!baseline.frozenAt ? (
                  <>
                    <button className="button secondary" onClick={() => setForm('baseline')}>
                      {t('Edit baseline')}
                    </button>
                    <button className="button primary" onClick={() => setFreeze(true)}>
                      <LockKeyhole size={15} />
                      {t('Freeze baseline')}
                    </button>
                  </>
                ) : (
                  <button className="button secondary" onClick={() => setForm('revision')}>
                    {t('Create revision')}
                  </button>
                ))}
            </div>
          </div>
          {!baseline.frozenAt && (
            <Notice>
              {t(
                'This baseline is a draft. Freeze it explicitly before recording changes. Freezing preserves the agreed reference point.',
              )}
            </Notice>
          )}
          <div className="scope-metrics">
            <div>
              <span className="eyebrow">{t('Initial scope · fact')}</span>
              <strong>
                {baseline.items.length}
                <small>{t('deliverables')}</small>
              </strong>
            </div>
            <div>
              <span className="eyebrow">{t('Accepted scope · fact')}</span>
              <strong>
                {result.items.length}
                <small>{t('deliverables')}</small>
              </strong>
            </div>
            <div>
              <span className="eyebrow">{t('Initial effort · estimate')}</span>
              <strong className={result.initial === null ? 'unavailable' : ''}>
                {metric(result.initial)}
                <small>{baseline.unit === 'days' ? t('person-days') : t('story points')}</small>
              </strong>
            </div>
            <div>
              <span className="eyebrow">{t('Effort change · estimate')}</span>
              <strong className={result.delta === null ? 'unavailable' : 'accent'}>
                {metric(result.delta, true)}
                <small>
                  {result.percent === null
                    ? t('Percentage unavailable')
                    : t('{percent}% from baseline', { percent: metric(result.percent, true) })}
                </small>
              </strong>
            </div>
          </div>
          <div className="scope-columns">
            <section className="panel scope-comparison">
              <div className="section-heading">
                <h2>{t('From agreement to today')}</h2>
                <span className="muted small">{t(baseline.unit)}</span>
              </div>
              <p className="muted small">{t('Only accepted changes affect the current scope.')}</p>
              <div className="comparison-head">
                <span>{t('Deliverable')}</span>
                <span>{t('Baseline')}</span>
                <span>{t('Current')}</span>
              </div>
              {[
                ...baseline.items,
                ...result.items.filter((i) => !baseline.items.some((b) => b.id === i.id)),
              ].map((item) => {
                const before = baseline.items.find((i) => i.id === item.id),
                  after = result.items.find((i) => i.id === item.id);
                return (
                  <div className={`comparison-row ${!after ? 'removed' : ''}`} key={item.id}>
                    <div>
                      <strong>{item.title}</strong>
                      <small>
                        {!before
                          ? t('Added to scope')
                          : !after
                            ? t('Removed from scope')
                            : t('{priority} priority', { priority: label(after.priority) })}
                      </small>
                    </div>
                    <span>{before ? metric(before.estimate) : '—'}</span>
                    <span className={!before ? 'accent' : ''}>
                      {after ? metric(after.estimate) : '—'}
                    </span>
                  </div>
                );
              })}
              <div className="comparison-total">
                <strong>{t('Total estimated effort')}</strong>
                <span>{metric(result.initial)}</span>
                <strong>{metric(result.current)}</strong>
              </div>
              {result.missing.length > 0 && (
                <details className="missing-estimates">
                  <summary>
                    {result.missing.length} {t('missing estimate entries')}
                  </summary>
                  <ul>
                    {result.missing.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                  <p>
                    {t(
                      'Update a draft baseline, create a revision, or record a quantified change after confirming the missing input.',
                    )}
                  </p>
                </details>
              )}
              <details className="baseline-context">
                <summary>{t('Baseline context & assumptions')}</summary>
                <TextBlock title={t('Objective')}>{baseline.objective}</TextBlock>
                <TextBlock title={t('Assumptions')}>{baseline.assumptions}</TextBlock>
                <TextBlock title={t('Constraints')}>{baseline.constraints}</TextBlock>
              </details>
            </section>
            <section className="panel simulation-panel">
              <div className="section-heading">
                <h2>
                  <FlaskConical size={18} />
                  {t('What if?')}
                </h2>
                <Badge>{t('Simulation')}</Badge>
              </div>
              <p className="muted small">
                {t('Try accepting proposals. The official scope stays unchanged.')}
              </p>
              {changes.filter((c) => c.status === 'proposed').length ? (
                <>
                  {changes
                    .filter((c) => c.status === 'proposed')
                    .map((c) => (
                      <label className="simulation-choice" key={c.id}>
                        <input
                          type="checkbox"
                          checked={simulation.includes(c.id)}
                          onChange={(e) =>
                            setSimulation(
                              e.target.checked
                                ? [...simulation, c.id]
                                : simulation.filter((id) => id !== c.id),
                            )
                          }
                        />
                        <span>
                          <strong>{c.title}</strong>
                          <small>
                            {label(c.type)} ·{' '}
                            {c.estimate === null
                              ? t('Not estimated')
                              : `${c.estimate} ${t(baseline.unit)}`}
                          </small>
                        </span>
                      </label>
                    ))}
                  <div className="simulation-result">
                    <div>
                      <span>{t('Potential deliverables')}</span>
                      <strong>
                        {result.items.length}
                        <ArrowRight size={15} />
                        {simulated?.items.length}
                      </strong>
                    </div>
                    <div>
                      <span>{t('Potential total effort')}</span>
                      <strong>
                        {metric(result.current)}
                        <ArrowRight size={15} />
                        {metric(simulated?.current)}
                      </strong>
                    </div>
                  </div>
                  {simulation.length > 0 && (
                    <>
                      <button className="text-button" onClick={() => setSimulation([])}>
                        {t('Clear simulation')}
                      </button>
                      <details>
                        <summary>{t('Simulated dependencies & attention points')}</summary>
                        {simulated?.items
                          .filter((i) => i.dependencies.length)
                          .map((i) => (
                            <p className="small" key={i.id}>
                              {i.title} →{' '}
                              {i.dependencies
                                .map(
                                  (dep) =>
                                    simulated.items.find((other) => other.id === dep)?.title ??
                                    t('Removed / unavailable'),
                                )
                                .join(', ')}
                            </p>
                          ))}
                        {simulated?.alerts.map((a) => (
                          <p className="small" key={a}>
                            {t(a)}
                          </p>
                        ))}
                        {!simulated?.alerts.length && (
                          <p className="small muted">
                            {t('No additional attention points found by the implemented rules.')}
                          </p>
                        )}
                      </details>
                    </>
                  )}
                </>
              ) : (
                <p className="inset-empty">{t('No proposals to simulate yet.')}</p>
              )}
            </section>
          </div>
          {result.alerts.length > 0 && (
            <section className="attention-panel">
              <div className="section-heading">
                <h2>{t('Worth a closer look')}</h2>
                <span className="small muted">
                  {t('Explainable rules · review with your team')}
                </span>
              </div>
              <ul>
                {result.alerts.map((a) => (
                  <li key={a}>{t(a)}</li>
                ))}
              </ul>
            </section>
          )}
          <section className="change-register">
            <div className="section-heading">
              <div>
                <div className="eyebrow">{t('Change register')}</div>
                <h2>{t('The story of your scope')}</h2>
              </div>
              <div className="inline-actions">
                <button
                  className="text-button"
                  onClick={() => download('change-register.csv', changesCsv(changes), 'text/csv')}
                >
                  {t('Export CSV')}
                </button>
                <button
                  className="text-button"
                  onClick={() =>
                    download(
                      'scope.json',
                      JSON.stringify({ baseline, changes, result }, null, 2),
                      'application/json',
                    )
                  }
                >
                  {t('Export JSON')}
                </button>
              </div>
            </div>
            <div className="status-tabs" role="group" aria-label={t('Filter changes')}>
              {['all', 'proposed', 'accepted', 'rejected'].map((s) => (
                <button
                  key={s}
                  aria-pressed={filter === s}
                  className={filter === s ? 'active' : ''}
                  onClick={() => setFilter(s)}
                >
                  {label(s, 'change')}
                  <span>
                    {s === 'all' ? changes.length : changes.filter((c) => c.status === s).length}
                  </span>
                </button>
              ))}
            </div>
            {changes.filter((c) => filter === 'all' || c.status === filter).length ? (
              <div className="change-list">
                {changes
                  .filter((c) => filter === 'all' || c.status === filter)
                  .sort(
                    (a, b) =>
                      b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
                  )
                  .map((c) => (
                    <button
                      className="change-row"
                      key={c.id}
                      onClick={() => setParams({ id: c.id })}
                    >
                      <span className={`timeline-dot ${c.status}`} />
                      <div>
                        <strong>{c.title}</strong>
                        <span>
                          {label(c.type)} · {c.author || t('Unassigned')} · {humanDate(c.date)}
                        </span>
                      </div>
                      <Badge tone={c.status}>{label(c.status, 'change')}</Badge>
                      <span className="change-estimate">
                        {c.estimate === null
                          ? '—'
                          : `${c.estimate > 0 ? '+' : ''}${c.estimate} ${t(baseline.unit)}`}
                      </span>
                      <span>↗</span>
                    </button>
                  ))}
              </div>
            ) : (
              <p className="inset-empty">
                {t('No')} {filter === 'all' ? '' : filter}{' '}
                {t('changes recorded for this baseline.')}
              </p>
            )}
          </section>
        </>
      )}
      {form && (
        <Modal
          title={
            form === 'change'
              ? editing
                ? t('Edit proposed change')
                : t('Record a scope change')
              : form === 'revision'
                ? t('Revise the baseline')
                : t('Define the baseline')
          }
          open
          wide
          onClose={() => {
            setForm('');
            setEditing('');
          }}
        >
          {form === 'change' && (editing ? detailBaseline : baseline) ? (
            <ChangeForm
              baseline={(editing ? detailBaseline : baseline)!}
              changes={project.changes}
              change={project.changes.find((c) => c.id === editing)}
              onCancel={() => {
                setForm('');
                setEditing('');
              }}
              onSave={async (change) => {
                await save({
                  ...project,
                  changes: editing
                    ? project.changes.map((c) => (c.id === change.id ? change : c))
                    : [...project.changes, change],
                });
                setForm('');
                setEditing('');
                setParams({ id: change.id });
              }}
            />
          ) : (
            <BaselineForm
              baseline={latest}
              revisionItems={form === 'revision' ? result?.items : undefined}
              onCancel={() => setForm('')}
              onSave={async (b) => {
                await save({
                  ...project,
                  baselines:
                    form === 'revision' || !latest
                      ? [...project.baselines, b]
                      : project.baselines.map((old) => (old.id === b.id ? b : old)),
                });
                setVersion(b.id);
                setSimulation([]);
                setForm('');
              }}
            />
          )}
        </Modal>
      )}
      {freeze && baseline && (
        <Confirm
          title={t('Freeze this baseline?')}
          onClose={() => setFreeze(false)}
          onConfirm={async () => {
            if (!baseline.items.length)
              throw new Error('A baseline needs at least one deliverable.');
            await save({
              ...project,
              baselines: project.baselines.map((b) =>
                b.id === baseline.id ? { ...b, frozenAt: now() } : b,
              ),
            });
          }}
        >
          {t(
            'The current deliverables and estimates will become an immutable reference. Future changes will be recorded in the change register. You can create a new baseline version later.',
          )}
        </Confirm>
      )}
    </>
  );
}
