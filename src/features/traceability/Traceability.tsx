import { t } from '../../shared/i18n';
import { Link } from 'react-router-dom';
import { ArrowRight, GitBranch } from 'lucide-react';
import { useWorkspace } from '../../app/workspace-context';
import { entities, entityPath, sameRef } from './domain';
import { Badge, Empty, PageHeading } from '../../shared/ui/primitives';
import { label } from '../../shared/lib/format';

export default function Traceability() {
  const { project } = useWorkspace(),
    all = entities(project);
  return (
    <>
      <PageHeading eyebrow={t('Across the toolbox / Traceability')} title={t('Follow the thread.')}>
        {t('A shared map of the relationships you have recorded. Every connection is explicit.')}
      </PageHeading>
      {project.relations.length ? (
        <div className="trace-register">
          {project.relations.map((r) => (
            <article className="trace-card" key={r.id}>
              <div className="trace-path">
                <Link to={entityPath(r.from)}>
                  <span className="eyebrow">{label(r.from.kind)}</span>
                  <strong>{all.find((e) => sameRef(e, r.from))?.title}</strong>
                </Link>
                <div className="trace-verb">
                  <Badge>{label(r.type)}</Badge>
                  <ArrowRight size={22} />
                </div>
                <Link to={entityPath(r.to)}>
                  <span className="eyebrow">{label(r.to.kind)}</span>
                  <strong>{all.find((e) => sameRef(e, r.to))?.title}</strong>
                </Link>
              </div>
              {r.note && <p>{r.note}</p>}
            </article>
          ))}
        </div>
      ) : (
        <Empty title={t('Make the context navigable.')}>
          {t(
            'Open a decision, change, or story and choose “Link an item” to record a known relationship.',
          )}
        </Empty>
      )}
      <div className="trace-note">
        <GitBranch size={20} />
        <p>
          {t(
            'Links can be followed in either direction from the connected record. Archiving a decision preserves its relationships. Deleting a project removes only that project’s records and links.',
          )}
        </p>
      </div>
    </>
  );
}
