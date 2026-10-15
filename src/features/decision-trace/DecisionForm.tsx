import { t } from '../../shared/i18n';
import { useWorkspace } from '../../app/workspace-context';
import { options, val } from '../../shared/ui/form-utils';
import { useState } from 'react';
import type { Decision, DecisionContent } from '../../shared/types/models';
import { Field, Form } from '../../shared/ui/primitives';
import { emptyDecision } from './domain';
import { lines, tags } from '../../shared/lib/utils';

export function DecisionForm({
  decision,
  initial,
  onSave,
  onCancel,
}: {
  decision?: Decision;
  initial?: DecisionContent;
  onSave: (content: DecisionContent, reason: string) => Promise<void>;
  onCancel: () => void;
}) {
  const { project } = useWorkspace();
  const d = decision ?? initial ?? emptyDecision();
  const [assumptionsVerified, setAssumptionsVerified] = useState(d.assumptionsVerified);
  const [alternatives, setAlternatives] = useState(
    d.alternatives.map((a, i) => ({ ...a, key: i })),
  );
  return (
    <Form
      version={project.revision}
      onCancel={onCancel}
      submit={decision ? t('Save revision') : t('Create decision')}
      onSave={async (data) => {
        const content: DecisionContent = {
          title: val(data, 'title'),
          context: val(data, 'context'),
          owner: val(data, 'owner'),
          stakeholders: tags(val(data, 'stakeholders')),
          date: val(data, 'date'),
          status: val(data, 'status') as DecisionContent['status'],
          solution: val(data, 'solution'),
          rationale: val(data, 'rationale'),
          assumptions: val(data, 'assumptions'),
          assumptionsVerified: data.get('assumptionsVerified') === 'on',
          constraints: val(data, 'constraints'),
          risks: val(data, 'risks'),
          references: lines(val(data, 'references')),
          tags: tags(val(data, 'tags')),
          reviewDate: val(data, 'reviewDate'),
          alternatives: alternatives
            .map((a) => ({
              name: val(data, `alternative-${a.key}`),
              pros: val(data, `pros-${a.key}`),
              cons: val(data, `cons-${a.key}`),
            }))
            .filter((a) => a.name || a.pros || a.cons),
        };
        await onSave(content, val(data, 'reason'));
      }}
    >
      <Field
        name="title"
        label={t('Decision title')}
        value={d.title}
        required
        placeholder={t('What needs to be decided?')}
      />
      <div className="form-grid">
        <Field
          name="status"
          label={t('Status')}
          type="select"
          value={d.status}
          options={options(['proposed', 'accepted', 'rejected', 'superseded'])}
        />
        <Field name="date" label={t('Decision date')} type="date" required value={d.date} />
        <Field name="owner" label={t('Owner')} value={d.owner} />
        <Field
          name="tags"
          label={t('Tags')}
          value={d.tags.join(', ')}
          hint={t('Separate tags with commas.')}
        />
      </div>
      <Field name="context" label={t('Context & problem')} type="textarea" value={d.context} />
      <Field
        name="solution"
        label={t('Selected solution')}
        type="textarea"
        value={d.solution}
        hint={t('Record the agreed solution when the decision is accepted.')}
      />
      <Field
        name="rationale"
        label={t('Rationale')}
        type="textarea"
        value={d.rationale}
        placeholder={t('Why is this the right choice in this context?')}
      />
      <details className="form-details">
        <summary>{t('Alternatives, stakeholders & follow-up')}</summary>
        <Field
          name="stakeholders"
          label={t('Stakeholders')}
          value={d.stakeholders.join(', ')}
          hint={t('Separate names or teams with commas.')}
        />
        <div className="section-heading">
          <h3>{t('Alternatives')}</h3>
          <button
            type="button"
            className="text-button"
            onClick={() =>
              setAlternatives([...alternatives, { key: Date.now(), name: '', pros: '', cons: '' }])
            }
          >
            {t('Add alternative')}
          </button>
        </div>
        {alternatives.map((a, i) => (
          <fieldset key={a.key} className="alternative-fields">
            <legend>
              {t('Alternative')} {i + 1}
            </legend>
            <Field name={`alternative-${a.key}`} label={t('Option')} value={a.name} />
            <div className="form-grid">
              <Field
                name={`pros-${a.key}`}
                label={t('Advantages')}
                type="textarea"
                value={a.pros}
              />
              <Field
                name={`cons-${a.key}`}
                label={t('Trade-offs')}
                type="textarea"
                value={a.cons}
              />
            </div>
            <button
              className="text-button danger-text"
              type="button"
              onClick={() => setAlternatives(alternatives.filter((item) => item.key !== a.key))}
            >
              {t('Remove alternative')}
            </button>
          </fieldset>
        ))}
        <div
          onChange={(event) => {
            if (event.target instanceof HTMLTextAreaElement && event.target.name === 'assumptions')
              setAssumptionsVerified(false);
          }}
        >
          <Field
            name="assumptions"
            label={t('Assumptions')}
            type="textarea"
            value={d.assumptions}
          />
        </div>
        <label className="checkbox">
          <input
            name="assumptionsVerified"
            type="checkbox"
            checked={assumptionsVerified}
            onChange={(event) => setAssumptionsVerified(event.target.checked)}
          />
          {t('The recorded assumptions have been verified')}
        </label>
        <Field name="constraints" label={t('Constraints')} type="textarea" value={d.constraints} />
        <Field name="risks" label={t('Known risks')} type="textarea" value={d.risks} />
        <Field
          name="references"
          label={t('Documentation links')}
          type="textarea"
          value={d.references.join('\n')}
          hint={t('One HTTP or HTTPS URL per line.')}
        />
        <Field name="reviewDate" label={t('Review date')} type="date" value={d.reviewDate} />
      </details>
      {decision && (
        <Field
          name="reason"
          label={t('Reason for this revision')}
          required
          type="textarea"
          hint={t('The previous content is kept in the revision history.')}
        />
      )}
    </Form>
  );
}
