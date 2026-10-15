import { t } from '../../shared/i18n';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowDownToLine, ArrowLeft, Archive, History, Pencil, Plus, Search } from 'lucide-react';
import { useWorkspace } from '../../app/workspace-context';
import { createDecision, decisionMarkdown, decisionWarnings, reviseDecision } from './domain';
import { DecisionForm } from './DecisionForm';
import { RelatedItems } from '../traceability/RelatedItems';
import {
  Badge,
  Confirm,
  Empty,
  Modal,
  Notice,
  PageHeading,
  TextBlock,
} from '../../shared/ui/primitives';
import { download } from '../../shared/lib/utils';
import { humanDate, label } from '../../shared/lib/format';
import { DecisionInsights } from './DecisionInsights';

export default function DecisionTrace() {
  const { project, save } = useWorkspace();
  const [params, setParams] = useSearchParams();
  const [editing, setEditing] = useState<string | null>(() =>
      params.get('new') === '1' ? 'new' : null,
    ),
    [query, setQuery] = useState(''),
    [status, setStatus] = useState('all'),
    [owner, setOwner] = useState('all'),
    [tag, setTag] = useState('all'),
    [archived, setArchived] = useState(false),
    [oldest, setOldest] = useState(false),
    [archive, setArchive] = useState(false);
  const selected = project.decisions.find((d) => d.id === params.get('id'));
  const visible = project.decisions
    .filter(
      (d) =>
        (archived || !d.archived) &&
        (status === 'all' || d.status === status) &&
        (owner === 'all' || d.owner === owner) &&
        (tag === 'all' || d.tags.includes(tag)) &&
        `${d.title} ${d.context} ${d.rationale} ${d.owner} ${d.tags.join(' ')}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) => (oldest ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)));
  const exportItems = selected ? [selected] : visible;
  const hasFilters = Boolean(
    query || status !== 'all' || owner !== 'all' || tag !== 'all' || archived,
  );
  function clearFilters() {
    setQuery('');
    setStatus('all');
    setOwner('all');
    setTag('all');
    setArchived(false);
  }
  function closeEditor() {
    setEditing(null);
    if (params.has('new')) setParams({});
  }
  return (
    <>
      <PageHeading
        eyebrow={t('01 / DecisionTrace')}
        title={selected ? selected.title : t('Decision journal')}
        actions={
          <>
            <button
              className="button secondary"
              onClick={() =>
                download('decisions.md', decisionMarkdown(exportItems), 'text/markdown')
              }
              disabled={!exportItems.length}
            >
              <ArrowDownToLine size={16} />
              {t('Markdown')}
            </button>
            <button className="button primary" onClick={() => setEditing(selected?.id ?? 'new')}>
              {selected ? <Pencil size={17} /> : <Plus size={17} />}
              {selected ? t('Edit decision') : t('New decision')}
            </button>
          </>
        }
      >
        {selected
          ? t('A record of the context, trade-offs, and reasoning behind the choice.')
          : t('A durable memory for the choices that shape your project.')}
      </PageHeading>
      {selected ? (
        <>
          <button className="back-link" onClick={() => setParams({})}>
            <ArrowLeft size={15} />
            {t('Back to journal')}
          </button>
          <div className="detail-grid">
            <article className="paper">
              <div className="record-meta">
                <Badge tone={selected.status}>{label(selected.status)}</Badge>
                <span>{selected.owner || t('Owner not recorded')}</span>
                <span>{humanDate(selected.date)}</span>
                {selected.archived && <Badge>{t('Archived')}</Badge>}
              </div>
              <div className="record-actions">
                <button className="button quiet" onClick={() => setEditing('duplicate')}>
                  {t('Duplicate as proposal')}
                </button>
                <button
                  className="button quiet"
                  onClick={() =>
                    download('decision.json', JSON.stringify(selected, null, 2), 'application/json')
                  }
                >
                  {t('Export JSON')}
                </button>
                <button className="button quiet" onClick={() => setArchive(true)}>
                  <Archive size={15} />
                  {selected.archived ? t('Unarchive') : t('Archive')}
                </button>
              </div>
              {decisionWarnings(selected).map((w) => (
                <Notice key={w}>{w}</Notice>
              ))}
              <TextBlock title={t('Context & problem')}>{selected.context}</TextBlock>
              <TextBlock title={t('Selected solution')}>{selected.solution}</TextBlock>
              <TextBlock title={t('Rationale')}>{selected.rationale}</TextBlock>
              {selected.alternatives.length > 0 && (
                <section className="text-block">
                  <h3>{t('Alternatives considered')}</h3>
                  {selected.alternatives.map((a, i) => (
                    <div key={i} className="alternative">
                      <h4>{a.name}</h4>
                      <p>
                        <strong>{t('Advantages')}</strong> {a.pros || t('Not recorded')}
                      </p>
                      <p>
                        <strong>{t('Trade-offs')}</strong> {a.cons || t('Not recorded')}
                      </p>
                    </div>
                  ))}
                </section>
              )}
              <div className="two-columns">
                <TextBlock title={t('Assumptions')}>{selected.assumptions}</TextBlock>
                <TextBlock title={t('Constraints')}>{selected.constraints}</TextBlock>
              </div>
              <TextBlock title={t('Known risks')}>{selected.risks}</TextBlock>
              <TextBlock title={t('Stakeholders')}>{selected.stakeholders.join(', ')}</TextBlock>
              {selected.references.length > 0 && (
                <TextBlock title={t('References')}>
                  {selected.references.map((url) => (
                    <a key={url} href={url} target="_blank" rel="noreferrer">
                      {url}
                    </a>
                  ))}
                </TextBlock>
              )}
              <div className="record-meta">
                {selected.tags.map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
                {selected.reviewDate && (
                  <span>
                    {t('Review')} {humanDate(selected.reviewDate)}
                  </span>
                )}
              </div>
              <section className="history-section">
                <h3>
                  <History size={17} />
                  {t('Revision history')} <span className="count">{selected.history.length}</span>
                </h3>
                {selected.history.length === 0 ? (
                  <p className="muted small">
                    {t('No revisions yet. The original record is current.')}
                  </p>
                ) : (
                  [...selected.history].reverse().map((h, i) => (
                    <details className="history-item" key={`${h.at}-${i}`}>
                      <summary>
                        <span>{h.reason}</span>
                        <time>{humanDate(h.at)}</time>
                      </summary>
                      <p className="small muted">
                        {t(
                          'Previous content before this revision. Changed fields are shown below.',
                        )}
                      </p>
                      {Object.entries(h.content)
                        .filter(
                          ([key, value]) =>
                            JSON.stringify(value) !==
                            JSON.stringify(
                              (selected.history[selected.history.length - i]?.content ?? selected)[
                                key as keyof typeof h.content
                              ],
                            ),
                        )
                        .map(([key, value]) => (
                          <div className="diff" key={key}>
                            <strong>{label(key)}</strong>
                            <pre>
                              {typeof value === 'string'
                                ? value || t('(empty)')
                                : JSON.stringify(value, null, 2)}
                            </pre>
                            <span>→</span>
                            <pre>
                              {JSON.stringify(
                                (selected.history[selected.history.length - i]?.content ??
                                  selected)[key as keyof typeof h.content],
                                null,
                                2,
                              )}
                            </pre>
                          </div>
                        ))}
                    </details>
                  ))
                )}
              </section>
              <footer className="record-id">
                {t('Record')} {selected.id}
              </footer>
            </article>
            <aside>
              <RelatedItems entity={{ kind: 'decision', id: selected.id }} />
              <DecisionInsights decision={selected} />
            </aside>
          </div>
        </>
      ) : (
        <>
          <div className="filter-bar">
            <label className="search-input">
              <Search size={17} />
              <input
                aria-label={t('Search decisions')}
                placeholder={t('Search decisions, context, owners…')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <select
              aria-label={t('Filter by status')}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">{t('All statuses')}</option>
              {['proposed', 'accepted', 'rejected', 'superseded'].map((s) => (
                <option key={s} value={s}>
                  {label(s)}
                </option>
              ))}
            </select>
            <select
              aria-label={t('Filter by owner')}
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
            >
              <option value="all">{t('All owners')}</option>
              {[...new Set(project.decisions.map((d) => d.owner))].map((o) => (
                <option key={o} value={o}>
                  {o || t('Unassigned')}
                </option>
              ))}
            </select>
            <select
              aria-label={t('Filter by tag')}
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            >
              <option value="all">{t('All tags')}</option>
              {[...new Set(project.decisions.flatMap((d) => d.tags))].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="list-toolbar">
            <span>
              {visible.length} {t('decisions')}
            </span>
            <div>
              {hasFilters && visible.length > 0 && (
                <button className="text-button filter-reset" onClick={clearFilters}>
                  {t('Clear filters')}
                </button>
              )}
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={archived}
                  onChange={(e) => setArchived(e.target.checked)}
                />
                {t('Include archived')}
              </label>
              <button className="text-button" onClick={() => setOldest(!oldest)}>
                {oldest ? t('Oldest first') : t('Newest first')} ↓
              </button>
              <button
                className="text-button"
                disabled={!visible.length}
                onClick={() =>
                  download(
                    'decision-register.json',
                    JSON.stringify(visible, null, 2),
                    'application/json',
                  )
                }
              >
                {t('Export JSON')}
              </button>
            </div>
          </div>
          {visible.length ? (
            <div className="journal">
              {visible.map((d, i) => (
                <button className="journal-row" key={d.id} onClick={() => setParams({ id: d.id })}>
                  <div className="journal-index">{String(i + 1).padStart(2, '0')}</div>
                  <div className="journal-content">
                    <div className="journal-title">
                      <h3>{d.title}</h3>
                      <Badge tone={d.status}>{label(d.status)}</Badge>
                      {d.archived && <Badge>{t('Archived')}</Badge>}
                    </div>
                    <p>{d.context || t('Context not recorded yet.')}</p>
                    <div className="record-meta">
                      <span>{d.owner || t('Unassigned')}</span>
                      <span>{humanDate(d.date)}</span>
                      {d.tags.map((t) => (
                        <span key={t}>#{t}</span>
                      ))}
                      {d.history.length > 0 && (
                        <span>
                          <History size={13} />
                          {d.history.length} {t('revisions')}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="row-arrow">↗</span>
                </button>
              ))}
            </div>
          ) : (
            <Empty
              title={
                project.decisions.length
                  ? t('No matching decisions')
                  : t('The next decision deserves a record.')
              }
              action={project.decisions.length ? t('Clear filters') : t('Record a decision')}
              onAction={project.decisions.length ? clearFilters : () => setEditing('new')}
            >
              {project.decisions.length
                ? t('Adjust your search or filters to see more records.')
                : t(
                    'Start with a title and context. Add the reasoning as the conversation develops.',
                  )}
            </Empty>
          )}
        </>
      )}
      {editing && (
        <Modal
          title={
            editing === 'duplicate'
              ? t('Duplicate as proposal')
              : editing === 'new'
                ? t('Record a decision')
                : t('Revise decision')
          }
          description={t(
            'Status is always explicit. Saving a proposed decision does not approve it.',
          )}
          open
          wide
          onClose={closeEditor}
        >
          <DecisionForm
            initial={
              editing === 'duplicate' && selected
                ? {
                    ...selected,
                    title: `${selected.title.slice(0, 160)} (${t('copy')})`,
                    status: 'proposed',
                  }
                : undefined
            }
            decision={project.decisions.find((d) => d.id === editing)}
            onCancel={closeEditor}
            onSave={async (content, reason) => {
              const old = project.decisions.find((d) => d.id === editing);
              const record = old ? reviseDecision(old, content, reason) : createDecision(content);
              await save({
                ...project,
                decisions: old
                  ? project.decisions.map((d) => (d.id === old.id ? record : d))
                  : [...project.decisions, record],
              });
              setEditing(null);
              setParams({ id: record.id });
            }}
          />
        </Modal>
      )}
      {archive && selected && (
        <Confirm
          title={selected.archived ? t('Restore to the journal?') : t('Archive this decision?')}
          onClose={() => setArchive(false)}
          onConfirm={() =>
            save({
              ...project,
              decisions: project.decisions.map((d) =>
                d.id === selected.id ? { ...d, archived: !d.archived } : d,
              ),
            })
          }
        >
          {t('Its history and links will remain available. You can reverse this action.')}
        </Confirm>
      )}
    </>
  );
}
