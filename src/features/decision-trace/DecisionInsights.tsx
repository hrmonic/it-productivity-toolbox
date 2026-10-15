import { Link } from 'react-router-dom';
import type { Decision } from '../../shared/types/models';
import { useWorkspace } from '../../app/workspace-context';
import { t } from '../../shared/i18n';
import { humanDate, label } from '../../shared/lib/format';
import { decisionWarnings } from './domain';
import { impactPaths } from '../traceability/impact';
import { entityPath } from '../traceability/domain';

export function DecisionInsights({ decision: d }: { decision: Decision }) {
  const { project } = useWorkspace();
  const paths = impactPaths(project, { kind: 'decision', id: d.id });
  const snapshots = [...d.history.map((h) => h.content), d];
  return (
    <section className="panel insight-panel">
      <h2>{t('Decision Timeline')}</h2>
      <ol className="event-timeline">
        <li>
          <time>{humanDate(d.createdAt)}</time>
          <p>
            {t('Record created')} · {label(snapshots[0]!.status)}
          </p>
        </li>
        {d.history.map((h, i) => (
          <li key={`${h.at}-${i}`}>
            <details>
              <summary>
                <time>{humanDate(h.at)}</time>
                <span>{h.reason}</span>
                <span>
                  {label(h.content.status)} → {label(snapshots[i + 1]!.status)}
                </span>
              </summary>
              <p>
                {t('Previous rationale')}: {h.content.rationale || t('Not recorded')}
              </p>
              <p>
                {t('Current rationale')}: {snapshots[i + 1]!.rationale || t('Not recorded')}
              </p>
            </details>
          </li>
        ))}
      </ol>
      <h2>{t('Decision Health')}</h2>
      <ul>
        {decisionWarnings(d).map((w) => (
          <li key={w}>{t(w)}</li>
        ))}
        {d.status === 'superseded' && paths.length > 0 && (
          <li>{t('Superseded decision still has recorded links. Review their relevance.')}</li>
        )}
      </ul>
      {!decisionWarnings(d).length && !(d.status === 'superseded' && paths.length) && (
        <p>{t('No attention points identified by the implemented rules.')}</p>
      )}
      <h2>{t('Decision Impact Explorer')}</h2>
      <p className="muted small">
        {t(
          'If this decision changes, review these recorded connections. Links define review scope, not proven consequences.',
        )}
      </p>
      <ul className="impact-list">
        {paths.map((p) => (
          <li key={p.ref.id}>
            <span className="eyebrow">
              {label(p.ref.kind)} ·{' '}
              {p.path.length === 1 ? t('Direct connection') : t('Indirect connection')}
            </span>
            <br />
            <Link to={entityPath(p.ref)}>{p.title}</Link>
            <details>
              <summary>{t('Traceable path')}</summary>
              {p.path.map((id) => {
                const r = project.relations.find((r) => r.id === id)!;
                return (
                  <p className="small" key={id}>
                    {label(r.type)} · {r.note || t('Not recorded')}
                    <br />
                    <code>{id}</code>
                  </p>
                );
              })}
            </details>
          </li>
        ))}
      </ul>
      {!paths.length && <p>{t('No recorded connections. Add links in Connected work.')}</p>}
      <Link className="button secondary" to={`/reports?kind=decision&record=${d.id}`}>
        {t('Prepare Decision Brief')}
      </Link>
    </section>
  );
}
