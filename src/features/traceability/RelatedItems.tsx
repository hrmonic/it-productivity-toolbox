import { t } from '../../shared/i18n';
import { options, val } from '../../shared/ui/form-utils';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Link2, Unlink } from 'lucide-react';
import { useWorkspace } from '../../app/workspace-context';
import { entities, entityPath, linkEntities, related, sameRef, type EntityRef } from './domain';
import { Confirm, Field, Form, Modal } from '../../shared/ui/primitives';
import { label } from '../../shared/lib/format';

export function RelatedItems({ entity }: { entity: EntityRef }) {
  const { project, save } = useWorkspace();
  const [adding, setAdding] = useState(false),
    [removing, setRemoving] = useState('');
  const all = entities(project),
    links = related(project, entity),
    candidates = all.filter(
      (e) => !sameRef(e, entity) && !links.some((r) => sameRef(r.from, e) || sameRef(r.to, e)),
    );
  return (
    <section className="related-section">
      <div className="section-heading">
        <h3>
          <Link2 size={17} /> {t('Connected work')} <span className="count">{links.length}</span>
        </h3>
        <button
          className="text-button"
          onClick={() => setAdding(true)}
          disabled={!candidates.length}
        >
          {t('Link an item')}
        </button>
      </div>
      {links.length === 0 && (
        <p className="muted small">
          {t('Connect the rationale, scope, and requirements when a relationship is known.')}
        </p>
      )}
      {links.map((r) => {
        const other = sameRef(r.from, entity) ? r.to : r.from;
        const item = all.find((e) => sameRef(e, other));
        return (
          <div className="related-row" key={r.id}>
            <div>
              <span className="eyebrow">
                {label(other.kind)} ·{' '}
                {sameRef(r.from, entity)
                  ? label(r.type)
                  : t('Linked via {type}', { type: label(r.type) })}
              </span>
              <Link to={entityPath(other)}>
                {item?.title}
                <ArrowUpRight size={15} />
              </Link>
              {r.note && <p>{r.note}</p>}
            </div>
            <button
              className="icon-button"
              aria-label={t(`Unlink ${item?.title}`)}
              onClick={() => setRemoving(r.id)}
            >
              <Unlink size={15} />
            </button>
          </div>
        );
      })}
      {adding && (
        <Modal
          title={t('Connect project work')}
          description={t(
            'Choose a known relationship. Similar wording does not establish causality.',
          )}
          open
          onClose={() => setAdding(false)}
        >
          <Form
            version={project.revision}
            submit={t('Create link')}
            onCancel={() => setAdding(false)}
            onSave={async (data) => {
              const selected = candidates.find((e) => e.id === val(data, 'target'));
              if (!selected) throw new Error('Choose an existing item.');
              const relation = linkEntities(
                project,
                entity,
                selected,
                val(data, 'type') as 'informs' | 'affects' | 'relates-to',
                val(data, 'note'),
              );
              await save({ ...project, relations: [...project.relations, relation] });
              setAdding(false);
            }}
          >
            <Field
              name="target"
              label={t('Related item')}
              required
              type="select"
              options={[
                { value: '', label: 'Choose an item' },
                ...candidates.map((e) => ({ value: e.id, label: `${label(e.kind)} · ${e.title}` })),
              ]}
            />
            <Field
              name="type"
              label={t('This item…')}
              type="select"
              value="relates-to"
              options={options(['informs', 'affects', 'relates-to'])}
            />
            <Field
              name="note"
              label={t('Relationship context')}
              type="textarea"
              hint={t('Explain how the current item relates to the selected item.')}
            />
          </Form>
        </Modal>
      )}
      {removing && (
        <Confirm
          title={t('Remove this relationship?')}
          onClose={() => setRemoving('')}
          onConfirm={() =>
            save({ ...project, relations: project.relations.filter((r) => r.id !== removing) })
          }
        >
          {t('Both records will remain. Only their relationship will be removed.')}
        </Confirm>
      )}
    </section>
  );
}
