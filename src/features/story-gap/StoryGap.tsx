import { t } from '../../shared/i18n';
import { val } from '../../shared/ui/form-utils';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowDownToLine,
  ArrowLeft,
  Check,
  CircleHelp,
  Pencil,
  Plus,
  ScanText,
  X,
} from 'lucide-react';
import type { Story, StoryContent } from '../../shared/types/models';
import { useWorkspace } from '../../app/workspace-context';
import {
  analyzeStory,
  createStory,
  emptyStory,
  reviseStory,
  storyMarkdown,
  type Observation,
} from './domain';
import { RelatedItems } from '../traceability/RelatedItems';
import { Badge, Empty, Field, Form, Modal, Notice, PageHeading } from '../../shared/ui/primitives';
import { download, now } from '../../shared/lib/utils';
import { label } from '../../shared/lib/format';

function StoryForm({
  story,
  onSave,
  onCancel,
}: {
  story?: Story;
  onSave: (content: StoryContent) => Promise<void>;
  onCancel: () => void;
}) {
  const { project } = useWorkspace();
  const s = story ?? emptyStory();
  return (
    <Form
      version={project.revision}
      submit={story ? t('Save & analyze') : t('Create & analyze')}
      onCancel={onCancel}
      onSave={async (data) => {
        const content = Object.fromEntries(
          Object.keys(emptyStory()).map((key) => [key, val(data, key)]),
        ) as StoryContent;
        await onSave(content);
      }}
    >
      <Field name="title" label={t('Story title')} value={s.title} required />
      <Field
        name="description"
        label={t('User story')}
        type="textarea"
        value={s.description}
        rows={5}
        placeholder={t('As a…, I want to…, so that… — or use your own format.')}
      />
      <div className="form-grid">
        <Field name="persona" label={t('User / persona')} value={s.persona} />
        <Field name="need" label={t('Need / capability')} value={s.need} />
      </div>
      <Field
        name="value"
        label={t('Expected user value')}
        type="textarea"
        value={s.value}
        rows={2}
      />
      <Field
        name="criteria"
        label={t('Acceptance criteria')}
        type="textarea"
        value={s.criteria}
        rows={5}
        hint={t('Describe observable outcomes. Given / When / Then is optional.')}
      />
      <details
        className="form-details"
        open={Boolean(s.context || s.rules || s.constraints || s.dependencies)}
      >
        <summary>{t('Context, business rules & dependencies')}</summary>
        <Field name="context" label={t('Context')} type="textarea" value={s.context} />
        <Field name="rules" label={t('Business rules')} type="textarea" value={s.rules} />
        <Field name="constraints" label={t('Constraints')} type="textarea" value={s.constraints} />
        <Field
          name="dependencies"
          label={t('Dependencies')}
          type="textarea"
          value={s.dependencies}
        />
      </details>
      {story && (
        <Notice>
          {t(
            'Saving changed source text keeps a previous version and resets suggestion reviews so the revised story can be assessed again.',
          )}
        </Notice>
      )}
    </Form>
  );
}
function Suggestion({ observation, story }: { observation: Observation; story: Story }) {
  const { project, save } = useWorkspace();
  const existing = story.reviews.find((r) => r.ruleId === observation.id);
  const [text, setText] = useState(existing?.text ?? t(observation.suggestion)),
    [apply, setApply] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  async function review(state: 'accepted' | 'ignored' | 'reset') {
    setBusy(true);
    setError('');
    try {
      if (state === 'accepted' && !text.trim())
        throw new Error('Add a refinement note before accepting.');
      const content =
        apply && state === 'accepted'
          ? reviseStory(story, {
              ...story,
              criteria: [story.criteria, text.trim()].filter(Boolean).join('\n'),
            })
          : story;
      const updated: Story = {
        ...content,
        updatedAt: now(),
        reviews: [
          ...content.reviews.filter((r) => r.ruleId !== observation.id),
          ...(state === 'reset' ? [] : [{ ruleId: observation.id, state, text: text.trim() }]),
        ],
      };
      await save({
        ...project,
        stories: project.stories.map((s) => (s.id === story.id ? updated : s)),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the review.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <article className={`suggestion ${existing ? `reviewed ${existing.state}` : ''}`}>
      <div className="suggestion-heading">
        <span className="eyebrow">{t(observation.category)}</span>
        <Badge tone={existing?.state === 'accepted' ? 'accepted' : ''}>
          {existing
            ? label(existing.state)
            : observation.level === 'question'
              ? t('Review question')
              : t('Needs attention')}
        </Badge>
      </div>
      {observation.quote && <blockquote>“{observation.quote}”</blockquote>}
      <p>{t(observation.explanation)}</p>
      {existing ? (
        <>
          <p className="accepted-note">{existing.text}</p>
          <button className="text-button" disabled={busy} onClick={() => void review('reset')}>
            {t('Return to review')}
          </button>
        </>
      ) : (
        <>
          <label className="field">
            <span className="sr-only">
              {t('Refinement note for')} {observation.id}
            </span>
            <textarea
              aria-label={t('Refinement note for {id}', { id: observation.id })}
              value={text}
              maxLength={30_000}
              onChange={(e) => setText(e.target.value)}
              rows={3}
            />
          </label>
          <label className="checkbox small">
            <input type="checkbox" checked={apply} onChange={(e) => setApply(e.target.checked)} />
            {t('Also append this text to acceptance criteria')}
          </label>
          {apply && (
            <p className="small muted">
              {t(
                'Replace placeholders and confirm business rules before appending. The original story is preserved.',
              )}
            </p>
          )}
          <div className="suggestion-actions">
            <button
              className="button secondary"
              disabled={busy}
              onClick={() => void review('accepted')}
            >
              <Check size={14} />
              {t('Accept note')}
            </button>
            <button className="button quiet" disabled={busy} onClick={() => void review('ignored')}>
              <X size={14} />
              {t('Ignore')}
            </button>
          </div>
        </>
      )}
      {error && (
        <p role="alert" className="error-text">
          {error}
        </p>
      )}
    </article>
  );
}
export default function StoryGap() {
  const { project, save } = useWorkspace();
  const [params, setParams] = useSearchParams();
  const [editing, setEditing] = useState<string | null>(() =>
      params.get('new') === '1' ? 'new' : null,
    ),
    [category, setCategory] = useState('all'),
    [reviewFilter, setReviewFilter] = useState('all'),
    [search, setSearch] = useState('');
  const selected = project.stories.find((s) => s.id === params.get('id'));
  const observations = selected ? analyzeStory(selected) : [];
  const pending = observations.filter((o) => !selected?.reviews.some((r) => r.ruleId === o.id));
  const filteredObservations = observations.filter((observation) => {
    const state =
      selected?.reviews.find((review) => review.ruleId === observation.id)?.state ?? 'pending';
    return (
      (category === 'all' || category === observation.category) &&
      (reviewFilter === 'all' || reviewFilter === state)
    );
  });
  function closeEditor() {
    setEditing(null);
    if (params.has('new')) setParams({});
  }
  return (
    <>
      <PageHeading
        eyebrow={t('03 / StoryGap')}
        title={selected ? selected.title : t('Story refinement')}
        actions={
          <>
            <button
              className="button secondary"
              disabled={!selected}
              onClick={() => {
                if (selected) download('story.md', storyMarkdown(selected), 'text/markdown');
              }}
            >
              <ArrowDownToLine size={16} />
              {t('Export story')}
            </button>
            <button className="button primary" onClick={() => setEditing(selected?.id ?? 'new')}>
              {selected ? <Pencil size={17} /> : <Plus size={17} />}
              {selected ? t('Edit & analyze') : t('New story')}
            </button>
          </>
        }
      >
        {selected
          ? t('Turn uncertainty into useful questions and observable acceptance criteria.')
          : t('Find ambiguity, discuss the gaps, and refine requirements with intent.')}
      </PageHeading>
      {selected ? (
        <>
          <button
            className="back-link"
            onClick={() => {
              setParams({});
              setCategory('all');
            }}
          >
            <ArrowLeft size={15} />
            {t('Back to stories')}
          </button>
          <div className="story-workspace">
            <div className="story-source">
              <article className="paper">
                <div className="section-heading">
                  <h2>{t('The story')}</h2>
                </div>
                <div className="story-statement">
                  {selected.description ||
                    t('No description recorded. Add context using Edit & analyze.')}
                </div>
                {(
                  [
                    'persona',
                    'need',
                    'value',
                    'criteria',
                    'context',
                    'rules',
                    'constraints',
                    'dependencies',
                  ] as const
                ).map((key) => (
                  <section className="text-block" key={key}>
                    <h3>
                      {t(
                        {
                          persona: 'User / persona',
                          need: 'Need',
                          value: 'User value',
                          criteria: 'Acceptance criteria',
                          context: 'Context',
                          rules: 'Business rules',
                          constraints: 'Constraints',
                          dependencies: 'Dependencies',
                        }[key],
                      )}
                    </h3>
                    <div className="prose">
                      {selected[key] || <span className="muted">{t('Not recorded')}</span>}
                    </div>
                  </section>
                ))}
                <details className="history-item">
                  <summary>
                    {t('Compare with the original')}{' '}
                    <span className="count">
                      {selected.history.length} {t('revisions')}
                    </span>
                  </summary>
                  {Object.entries(selected.original).map(([key, value]) => (
                    <div className="diff" key={key}>
                      <strong>{label(key)}</strong>
                      <pre>{value || t('(empty)')}</pre>
                      {value !== selected[key as keyof StoryContent] && (
                        <>
                          <span>{t('→ Current')}</span>
                          <pre>{selected[key as keyof StoryContent] || t('(empty)')}</pre>
                        </>
                      )}
                    </div>
                  ))}
                </details>
                {selected.history.length > 0 && (
                  <details className="history-item">
                    <summary>{t('Previous saved versions')}</summary>
                    {[...selected.history].reverse().map((h, i) => (
                      <details key={`${h.at}-${i}`}>
                        <summary>{h.at}</summary>
                        <pre>{JSON.stringify(h.content, null, 2)}</pre>
                      </details>
                    ))}
                  </details>
                )}
                <button
                  className="text-button"
                  onClick={() =>
                    download(
                      'story.json',
                      JSON.stringify(
                        { story: selected, analysis: observations, provider: 'local-rules-v1' },
                        null,
                        2,
                      ),
                      'application/json',
                    )
                  }
                >
                  {t('Export JSON with analysis')}
                </button>
                <footer className="record-id">
                  {t('Record')} {selected.id}
                </footer>
              </article>
              <RelatedItems entity={{ kind: 'story', id: selected.id }} />
            </div>
            <section className="analysis-column">
              <div className="analysis-heading">
                <div>
                  <span className="eyebrow">{t('Local analysis · rules v1')}</span>
                  <h2>
                    <ScanText size={20} />
                    {t('A refinement conversation')}
                  </h2>
                </div>
                <span className="analysis-count">
                  {pending.length}
                  <small>{t('to review')}</small>
                </span>
              </div>
              <p className="review-guidance">
                {t(
                  'Accept notes separately from the source. Change the story only by editing it or explicitly appending criteria.',
                )}
              </p>
              <details className="analysis-method">
                <summary>{t('How this review works')}</summary>
                <p>
                  {t(
                    'These are review prompts, not verified defects. INVEST is a team discussion framework; this analysis cannot establish whether a story is valuable, estimable, or small.',
                  )}
                </p>
              </details>
              <div className="review-tabs" role="group" aria-label={t('Filter by review state')}>
                {(
                  [
                    ['all', 'All'],
                    ['pending', 'To review'],
                    ['accepted', 'Accepted'],
                    ['ignored', 'Ignored'],
                  ] as const
                ).map(([state, title]) => (
                  <button
                    key={state}
                    aria-pressed={reviewFilter === state}
                    onClick={() => setReviewFilter(state)}
                  >
                    {t(title)}
                    <span>
                      {state === 'all'
                        ? observations.length
                        : state === 'pending'
                          ? pending.length
                          : observations.filter((observation) =>
                              selected.reviews.some(
                                (review) =>
                                  review.ruleId === observation.id && review.state === state,
                              ),
                            ).length}
                    </span>
                  </button>
                ))}
              </div>
              <select
                aria-label={t('Filter observations by category')}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="all">{t('All categories')}</option>
                {[...new Set(observations.map((o) => o.category))].map((c) => (
                  <option key={c} value={c}>
                    {t(c)}
                  </option>
                ))}
              </select>
              {filteredObservations.map((o) => (
                <Suggestion
                  key={`${selected.id}-${o.id}-${selected.updatedAt}-${t('Language')}`}
                  observation={o}
                  story={selected}
                />
              ))}
              {observations.length > 0 && !filteredObservations.length && (
                <div className="notice">
                  {t('No prompts match these filters.')}
                  <button
                    className="text-button"
                    onClick={() => {
                      setReviewFilter('all');
                      setCategory('all');
                    }}
                  >
                    {t('Clear filters')}
                  </button>
                </div>
              )}
              {!observations.length && (
                <div className="notice">
                  <Check size={18} />
                  <div>
                    {t(
                      'No gaps identified by the current rules. Review the story with your team before treating it as ready.',
                    )}
                  </div>
                </div>
              )}
              <details className="scenario-helper">
                <summary>
                  <CircleHelp size={16} />
                  {t('Draft a Given / When / Then scenario')}
                </summary>
                <p className="small">
                  {t(
                    'Use the confirmed story content below as a discussion starter. Brackets indicate questions to resolve.',
                  )}
                </p>
                <pre>
                  {t('Given')} {selected.persona || t('[the intended user]')}{' '}
                  {t('in [an agreed starting context],')}
                  {'\n'}
                  {t('when')} {selected.need || t('[the requested action occurs]')}, {'\n'}
                  {t('then [an observable result demonstrating:')}{' '}
                  {selected.value || t('the intended benefit')}].
                </pre>
                <p className="small muted">
                  {t(
                    'Edit the story to add a validated scenario. No business rules are generated automatically.',
                  )}
                </p>
              </details>
            </section>
          </div>
        </>
      ) : (
        <>
          <div className="story-intro">
            <ScanText size={26} />
            <div>
              <strong>{t('A second look, without the black box.')}</strong>
              <p>
                {t(
                  'Deterministic checks surface subjective language, missing outcomes, and questions worth asking. Your content stays in this browser.',
                )}
              </p>
            </div>
          </div>
          <div className="filter-bar">
            <input
              className="story-search"
              aria-label={t('Search stories')}
              placeholder={t('Find a user story…')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="muted small">
              {project.stories.length} {t('stories in this project')}
            </span>
          </div>
          {project.stories.filter((s) =>
            `${s.title} ${s.description}`.toLowerCase().includes(search.toLowerCase()),
          ).length ? (
            <div className="story-list">
              {project.stories
                .filter((s) =>
                  `${s.title} ${s.description}`.toLowerCase().includes(search.toLowerCase()),
                )
                .map((s, i) => {
                  const findings = analyzeStory(s),
                    outstanding = findings.filter(
                      (o) => !s.reviews.some((r) => r.ruleId === o.id),
                    ).length;
                  return (
                    <button
                      className="story-card"
                      key={s.id}
                      onClick={() => {
                        setParams({ id: s.id });
                        setCategory('all');
                      }}
                    >
                      <div className="section-heading">
                        <span className="eyebrow">
                          {t('Story')} {String(i + 1).padStart(2, '0')}
                        </span>
                        <span>↗</span>
                      </div>
                      <h3>{s.title}</h3>
                      <p>{s.description || s.need || t('A story waiting for context.')}</p>
                      <div className="story-card-footer">
                        <span>
                          <ScanText size={14} />
                          {outstanding} {t('prompts to review')}
                        </span>
                        <span>
                          {s.reviews.filter((r) => r.state === 'accepted').length}{' '}
                          {t('notes accepted')}
                        </span>
                      </div>
                    </button>
                  );
                })}
            </div>
          ) : (
            <Empty
              title={
                project.stories.length
                  ? t('No matching stories')
                  : t('Better questions make clearer stories.')
              }
              action={project.stories.length ? undefined : t('Analyze a story')}
              onAction={() => setEditing('new')}
            >
              {project.stories.length
                ? t('Try a different search.')
                : t(
                    'Paste a requirement or write a new story. Explore the gaps without sending your content anywhere.',
                  )}
            </Empty>
          )}
        </>
      )}
      {editing && (
        <Modal
          title={editing === 'new' ? t('Bring a story into focus') : t('Refine the story')}
          open
          wide
          onClose={closeEditor}
        >
          <StoryForm
            story={project.stories.find((s) => s.id === editing)}
            onCancel={closeEditor}
            onSave={async (content) => {
              const old = project.stories.find((s) => s.id === editing);
              const record = old ? reviseStory(old, content) : createStory(content);
              await save({
                ...project,
                stories: old
                  ? project.stories.map((s) => (s.id === old.id ? record : s))
                  : [...project.stories, record],
              });
              setEditing(null);
              setCategory('all');
              setParams({ id: record.id });
            }}
          />
        </Modal>
      )}
    </>
  );
}
