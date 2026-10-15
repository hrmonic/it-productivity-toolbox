import { useState } from 'react';
import { coverage } from './coverage';
import { Link } from 'react-router-dom';
import type { Story } from '../../shared/types/models';
import { useWorkspace } from '../../app/workspace-context';
import { t } from '../../shared/i18n';
import { ErrorNotice, Field, Form } from '../../shared/ui/primitives';
import { val } from '../../shared/ui/form-utils';
import { errorMessage, now, uid } from '../../shared/lib/utils';

export default function AcceptanceStudio({ story }: { story: Story }) {
  const { project, save } = useWorkspace();
  const [adding, setAdding] = useState(false),
    [editing, setEditing] = useState<string | null>(null),
    [error, setError] = useState('');
  const current = story.scenarios.find((s) => s.id === editing);
  const [requirementEntry, setRequirementEntry] = useState(0);
  async function update(next: Story) {
    await save({
      ...project,
      stories: project.stories.map((s) => (s.id === story.id ? { ...next, updatedAt: now() } : s)),
    });
  }
  return (
    <section className="panel insight-panel">
      <h2>{t('Acceptance Criteria Studio')}</h2>
      <p className="muted small">
        {t(
          'Write confirmed scenarios and explicitly link them to recorded requirements. No business rule is generated automatically.',
        )}
      </p>
      <div className="studio-toolbar">
        <button
          className="button secondary"
          onClick={() => {
            setAdding(!adding);
            setEditing(null);
          }}
        >
          {t('Add scenario')}
        </button>
        <Link className="button secondary" to={`/reports?kind=story&record=${story.id}`}>
          {t('Prepare Refinement Pack')}
        </Link>
      </div>
      {(adding || current) && (
        <Form
          key={editing ?? 'new'}
          version={project.revision}
          submit={t('Save scenario')}
          onCancel={() => {
            setAdding(false);
            setEditing(null);
          }}
          onSave={async (data) => {
            const scenario: Story['scenarios'][number] = {
              id: current?.id ?? uid(),
              kind: val(data, 'kind') as Story['scenarios'][number]['kind'],
              given: val(data, 'given'),
              when: val(data, 'when'),
              then: val(data, 'then'),
              requirementIds: data.getAll('requirements').map(String),
            };
            await update({
              ...story,
              scenarios: [...story.scenarios.filter((s) => s.id !== scenario.id), scenario],
            });
            setAdding(false);
            setEditing(null);
          }}
        >
          <Field
            name="kind"
            label={t('Scenario category')}
            type="select"
            value={current?.kind ?? 'nominal'}
            options={['nominal', 'error', 'boundary', 'permission', 'constraint'].map((value) => ({
              value,
              label: t(value),
            }))}
          />
          <Field name="given" label={t('Given')} type="textarea" required value={current?.given} />
          <Field name="when" label={t('When')} type="textarea" required value={current?.when} />
          <Field name="then" label={t('Then')} type="textarea" required value={current?.then} />
          <fieldset>
            <legend>{t('Covered requirements')}</legend>
            {story.requirements.map((r) => (
              <label className="checkbox" key={r.id}>
                <input
                  name="requirements"
                  type="checkbox"
                  value={r.id}
                  defaultChecked={current?.requirementIds.includes(r.id)}
                />
                {r.text}
              </label>
            ))}
          </fieldset>
        </Form>
      )}
      {story.scenarios.map((s) => (
        <details key={s.id} className="coverage-row">
          <summary>
            {t(s.kind)} · {s.then}
          </summary>
          <p>
            {t('Given')}: {s.given}
            <br />
            {t('When')}: {s.when}
            <br />
            {t('Then')}: {s.then}
          </p>
          <button
            className="button quiet"
            onClick={() => {
              setEditing(s.id);
              setAdding(false);
            }}
          >
            {t('Edit scenario')}
          </button>
          <button
            className="button quiet"
            onClick={() => {
              void update({
                ...story,
                scenarios: story.scenarios.filter((c) => c.id !== s.id),
              }).catch((e) => setError(errorMessage(e)));
            }}
          >
            {t('Remove scenario')}
          </button>
        </details>
      ))}
      <h2>{t('Coverage Matrix')}</h2>
      <p className="muted small">
        {t(
          'Coverage means an explicit link to a complete scenario. It does not establish test execution, completeness or business correctness.',
        )}
      </p>
      <Form
        key={`requirement-${requirementEntry}`}
        submit={t('Add requirement')}
        onSave={async (data) => {
          await update({
            ...story,
            requirements: [...story.requirements, { id: uid(), text: val(data, 'requirement') }],
          });
          setRequirementEntry((value) => value + 1);
        }}
      >
        <Field name="requirement" label={t('Requirement to verify')} required type="textarea" />
      </Form>
      {coverage(story).map((r) => (
        <div className="coverage-row" key={r.id}>
          <strong>{r.text}</strong>
          {r.uncertainOutcomes.length > 0 && (
            <p className="muted small">
              {t(
                'Some linked outcomes use subjective terms. Confirm observable expectations with the team.',
              )}
            </p>
          )}
          <span>
            {r.scenarios.length
              ? r.scenarios.length === 1
                ? t('Linked to 1 complete scenario')
                : t('Linked to {count} complete scenarios', { count: r.scenarios.length })
              : t('No complete scenario linked')}
          </span>
          <button
            className="text-button"
            onClick={() => {
              void update({
                ...story,
                requirements: story.requirements.filter((c) => c.id !== r.id),
                scenarios: story.scenarios.map((s) => ({
                  ...s,
                  requirementIds: s.requirementIds.filter((id) => id !== r.id),
                })),
              }).catch((e) => setError(errorMessage(e)));
            }}
          >
            {t('Remove requirement')}
          </button>
        </div>
      ))}
      {!story.requirements.length && <p>{t('No explicit requirements recorded yet.')}</p>}
      {error && <ErrorNotice>{error}</ErrorNotice>}
    </section>
  );
}
