import { Link } from 'react-router-dom';
import { useState } from 'react';
import type { Baseline, Change } from '../../shared/types/models';
import { calculateScope } from './domain';
import { scopeEvolution, affectedDeliverables } from './insights';
import { t } from '../../shared/i18n';
import { humanDate, label } from '../../shared/lib/format';

export default function ScopeInsights({
  baseline,
  changes,
  simulation,
}: {
  baseline: Baseline;
  changes: Change[];
  simulation: string[];
}) {
  const current = calculateScope(baseline, changes, simulation);
  const options = [
    ...baseline.items,
    ...current.items.filter((i) => !baseline.items.some((b) => b.id === i.id)),
  ];
  const [target, setTarget] = useState('');
  const selected = options.find((i) => i.id === target) ?? options[0];
  return (
    <section className="panel insight-panel">
      <div className="section-heading">
        <h2>{t('Scope Evolution Timeline')}</h2>
        <Link className="text-link" to="/reports?kind=scope">
          {t('Prepare Scope Change Brief')}
        </Link>
      </div>
      <p className="muted small">
        {t(
          'Accepted changes only. Historical estimates use the recorded effective date; approval timestamps are not inferred.',
        )}
      </p>
      <ol className="event-timeline">
        <li>
          <time>{humanDate(baseline.date)}</time>
          <p>
            {t('Baseline')} · {baseline.items.length} {t('deliverables')} ·{' '}
            {calculateScope(baseline, []).initial ?? t('Unavailable')} {t(baseline.unit)}
          </p>
        </li>
        {scopeEvolution(baseline, changes).map((event) => (
          <li key={event.date}>
            <details>
              <summary>
                <time>{humanDate(event.date)}</time>
                <span>
                  {event.result.items.length} {t('deliverables')} ·{' '}
                  {event.result.current ?? t('Unavailable')} {t(baseline.unit)}
                </span>
              </summary>
              {changes
                .filter((c) => c.status === 'accepted' && c.date === event.date)
                .map((c) => (
                  <p key={c.id}>
                    {c.title} · {label(c.type)}
                  </p>
                ))}
            </details>
          </li>
        ))}
      </ol>
      <h2>{t('Dependency Impact Map')}</h2>
      <label className="field">
        {t('If this deliverable changes')}
        <select value={selected?.id ?? ''} onChange={(e) => setTarget(e.target.value)}>
          {options.map((i) => (
            <option value={i.id} key={i.id}>
              {i.title}
            </option>
          ))}
        </select>
      </label>
      <p className="muted small">
        {simulation.length
          ? t('Includes the selected simulation proposals.')
          : t('Uses the recorded current dependencies.')}
      </p>
      <ul className="impact-list">
        {selected &&
          affectedDeliverables(baseline, changes, selected.id, simulation).map((i) => (
            <li key={i.id}>
              {i.title}
              <br />
              <small>
                {t('Depends on')}:{' '}
                {i.dependencies
                  .map((id) => options.find((o) => o.id === id)?.title ?? id)
                  .join(', ')}
              </small>
            </li>
          ))}
      </ul>
      {selected && !affectedDeliverables(baseline, changes, selected.id, simulation).length && (
        <p>{t('No dependent deliverables found in the recorded graph.')}</p>
      )}
    </section>
  );
}
