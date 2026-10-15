import { t } from '../../shared/i18n';
import { DependencyPicker } from '../../shared/ui/DependencyPicker';
import { useWorkspace } from '../../app/workspace-context';
import { options, val } from '../../shared/ui/form-utils';
import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { Baseline, Change, Deliverable } from '../../shared/types/models';
import { Field, Form, Notice } from '../../shared/ui/primitives';
import { now, numberOrNull, today, uid } from '../../shared/lib/utils';

export function BaselineForm({
  baseline,
  revisionItems,
  onSave,
  onCancel,
}: {
  baseline?: Baseline;
  revisionItems?: Deliverable[];
  onSave: (baseline: Baseline) => Promise<void>;
  onCancel: () => void;
}) {
  const { project } = useWorkspace();
  const revising = revisionItems !== undefined;
  const initialItems = revisionItems ?? baseline?.items ?? [];
  const initialIds = new Set(initialItems.map((i) => i.id));
  const [items, setItems] = useState<Deliverable[]>(
    initialItems.map((i) => ({
      ...i,
      dependencies: i.dependencies.filter((id) => initialIds.has(id)),
    })),
  );
  const update = (id: string, patch: Partial<Deliverable>) =>
    setItems(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  return (
    <Form
      version={project.revision}
      submit={revising ? t('Create draft revision') : t('Save baseline draft')}
      onCancel={onCancel}
      onSave={async (data) => {
        if (!items.length)
          throw new Error('Add at least one deliverable before saving a baseline.');
        await onSave({
          id: revising || !baseline ? uid() : baseline.id,
          version: revising ? (baseline?.version ?? 0) + 1 : (baseline?.version ?? 1),
          objective: val(data, 'objective'),
          date: val(data, 'date'),
          unit: val(data, 'unit') as Baseline['unit'],
          assumptions: val(data, 'assumptions'),
          constraints: val(data, 'constraints'),
          items,
          frozenAt: null,
        });
      }}
    >
      {revising && (
        <Notice>
          {t(
            'The new version starts from the current accepted scope. Only dependencies between retained deliverables are carried forward. Previous baselines and changes remain in the version history.',
          )}
        </Notice>
      )}
      <Field
        name="objective"
        label={t('Project objective')}
        type="textarea"
        value={baseline?.objective}
      />
      <div className="form-grid">
        <Field
          name="date"
          label={t('Reference date')}
          type="date"
          required
          value={revising ? today() : (baseline?.date ?? today())}
        />
        <Field
          name="unit"
          label={t('Estimation unit')}
          type="select"
          value={baseline?.unit ?? 'days'}
          options={[
            { value: 'days', label: 'Person-days' },
            { value: 'points', label: 'Story points' },
          ]}
          hint={t('All estimates in this baseline use this unit.')}
        />
      </div>
      <div className="section-heading">
        <h3>{t('Planned deliverables')}</h3>
        <button
          type="button"
          className="text-button"
          onClick={() =>
            setItems([
              ...items,
              { id: uid(), title: '', priority: 'must', estimate: null, dependencies: [] },
            ])
          }
        >
          <Plus size={15} />
          {t('Add deliverable')}
        </button>
      </div>
      {items.map((item, i) => (
        <fieldset className="baseline-item" key={item.id}>
          <legend>
            {t('Deliverable')} {i + 1}
          </legend>
          <div className="baseline-inputs">
            <label className="field">
              {t('Name')}
              <input
                aria-label={t(`Deliverable ${i + 1} name`)}
                required
                maxLength={180}
                value={item.title}
                onChange={(e) => update(item.id, { title: e.target.value })}
              />
            </label>
            <label className="field">
              {t('Priority')}
              <select
                aria-label={t(`Deliverable ${i + 1} priority`)}
                value={item.priority}
                onChange={(e) =>
                  update(item.id, { priority: e.target.value as Deliverable['priority'] })
                }
              >
                {options(['must', 'should', 'could']).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              {t('Effort')}
              <input
                aria-label={t(`Deliverable ${i + 1} effort`)}
                type="number"
                min="0"
                max="1000000"
                step="any"
                placeholder={t('Unknown')}
                value={item.estimate ?? ''}
                onChange={(e) => update(item.id, { estimate: numberOrNull(e.target.value) })}
              />
            </label>
            <button
              type="button"
              className="icon-button"
              aria-label={t(`Remove deliverable ${i + 1}`)}
              onClick={() =>
                setItems(
                  items
                    .filter((r) => r.id !== item.id)
                    .map((r) => ({
                      ...r,
                      dependencies: r.dependencies.filter((dep) => dep !== item.id),
                    })),
                )
              }
            >
              <X size={17} />
            </button>
          </div>
          {items.length > 1 && (
            <DependencyPicker
              label={t('Deliverable {number} dependencies', { number: i + 1 })}
              value={item.dependencies}
              options={items
                .filter((other) => other.id !== item.id)
                .map((other) => ({
                  value: other.id,
                  label: other.title || t('Untitled deliverable'),
                }))}
              onChange={(dependencies) => update(item.id, { dependencies })}
            />
          )}
        </fieldset>
      ))}
      <Field
        name="assumptions"
        label={t('Assumptions')}
        type="textarea"
        value={baseline?.assumptions}
      />
      <Field
        name="constraints"
        label={t('Constraints')}
        type="textarea"
        value={baseline?.constraints}
      />
    </Form>
  );
}
export function ChangeForm({
  baseline,
  changes,
  change,
  onSave,
  onCancel,
}: {
  baseline: Baseline;
  changes: Change[];
  change?: Change;
  onSave: (change: Change) => Promise<void>;
  onCancel: () => void;
}) {
  const { project } = useWorkspace();
  const [type, setType] = useState<Change['type']>(change?.type ?? 'addition');
  const targets = [
    ...baseline.items,
    ...changes
      .filter(
        (c) => c.baselineId === baseline.id && c.type === 'addition' && c.status === 'accepted',
      )
      .map((c) => ({ id: c.id, title: c.title })),
  ];
  return (
    <Form
      version={project.revision}
      onCancel={onCancel}
      submit={change ? t('Save change') : t('Record change')}
      onSave={async (data) => {
        await onSave({
          id: change?.id ?? uid(),
          baselineId: baseline.id,
          title: val(data, 'title'),
          description: val(data, 'description'),
          justification: val(data, 'justification'),
          author: val(data, 'author'),
          date: val(data, 'date'),
          type,
          status: val(data, 'status') as Change['status'],
          targetId: val(data, 'targetId'),
          estimate: ['addition', 'modification'].includes(type)
            ? numberOrNull(val(data, 'estimate'))
            : null,
          priority: val(data, 'priority') as Change['priority'],
          dependencies: data.getAll('dependencies').map(String),
          risks: val(data, 'risks'),
          createdAt: change?.createdAt ?? now(),
          updatedAt: now(),
        });
      }}
    >
      <Field name="title" label={t('Change title')} required value={change?.title} />
      <div className="form-grid">
        <label className="field">
          {t('Change type')}
          <select
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as Change['type'])}
          >
            {options(['addition', 'modification', 'removal', 'constraint', 'priority']).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <Field
          name="status"
          label={t('Status')}
          type="select"
          value={change?.status ?? 'proposed'}
          options={options(['proposed', 'accepted', 'rejected'], 'change')}
          hint={t('Accepted and rejected entries become immutable ledger records.')}
        />
        <Field name="author" label={t('Requested by')} value={change?.author} />
        <Field
          name="date"
          label={t('Change date')}
          type="date"
          required
          value={change?.date ?? today()}
        />
      </div>
      {!['addition', 'constraint'].includes(type) && (
        <Field
          key={type}
          name="targetId"
          label={t('Affected deliverable')}
          type="select"
          required
          value={change?.targetId}
          options={[
            { value: '', label: 'Choose a deliverable' },
            ...targets.map((i) => ({ value: i.id, label: i.title })),
          ]}
        />
      )}
      <Field
        name="description"
        label={t('Description')}
        type="textarea"
        value={change?.description}
      />
      <Field
        name="justification"
        label={t('Why is this change needed?')}
        type="textarea"
        value={change?.justification}
      />
      <div className="form-grid">
        {['addition', 'modification'].includes(type) && (
          <Field
            name="estimate"
            label={
              type === 'addition'
                ? t('Additional effort ({unit})', { unit: t(baseline.unit) })
                : t('Effort delta ({unit})', { unit: t(baseline.unit) })
            }
            type="number"
            min={type === 'addition' ? 0 : -1_000_000}
            max={1_000_000}
            value={change?.estimate ?? ''}
            hint={
              type === 'addition'
                ? t('Leave blank if unknown. Zero means explicitly no effort.')
                : t(
                    'Signed adjustment to the target estimate, not its replacement total. Leave blank if unknown.',
                  )
            }
          />
        )}
        <Field
          name="priority"
          label={type === 'priority' ? t('New priority') : t('Priority')}
          type="select"
          value={change?.priority ?? 'must'}
          options={options(['must', 'should', 'could'])}
        />
      </div>
      <DependencyPicker
        name="dependencies"
        label={t('Affected dependencies')}
        defaultValue={change?.dependencies ?? []}
        options={targets.map((target) => ({ value: target.id, label: target.title }))}
      />
      <Field name="risks" label={t('Documented risks')} type="textarea" value={change?.risks} />
    </Form>
  );
}
