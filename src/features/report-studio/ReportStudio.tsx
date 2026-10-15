import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useWorkspace } from '../../app/workspace-context';
import { t, useLanguage } from '../../shared/i18n';
import { ErrorNotice, Notice, PageHeading } from '../../shared/ui/primitives';
import { errorMessage } from '../../shared/lib/utils';
import { brandProblems, newBrand } from '../brand-studio/domain';
import {
  composeReport,
  reportDefaults,
  reportKinds,
  reportNames,
  reportOptionsSchema,
  sectionNames,
  type ReportOptions,
  type SectionKey,
} from './model';
import { layoutReport } from './layout';
import { renderReport, saveBlob, pageSvg, type ExportFormat } from './renderers';

const steps = [
  'Select content',
  'Choose audience',
  'Choose document',
  'Customize',
  'Preview',
  'Generate',
];
export default function ReportStudio() {
  const { project } = useWorkspace();
  const language = useLanguage();
  const [params] = useSearchParams();
  const [options, setOptions] = useState<ReportOptions>(() => {
    const initial = reportDefaults(project, language);
    const kind = params.get('kind');
    if (reportKinds.includes(kind as ReportOptions['kind'])) {
      initial.kind = kind as ReportOptions['kind'];
      initial.title = t(reportNames[initial.kind]);
      if (initial.kind === 'steering') {
        initial.detail = 'summary';
        initial.audience = 'Steering committee';
      }
    }
    if (params.has('record')) initial.selectedIds = [params.get('record')!];
    return initial;
  });
  const [step, setStep] = useState(0),
    [format, setFormat] = useState<ExportFormat>('pdf'),
    [brandId, setBrandId] = useState(project.brands[0]?.id ?? ''),
    [pageIndex, setPageIndex] = useState(0);
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(''),
    [progress, setProgress] = useState(0),
    [pdfUrl, setPdfUrl] = useState('');
  const controller = useRef<AbortController | null>(null);
  const [fallback] = useState(newBrand),
    [generatedAt] = useState(() => new Date().toISOString());
  const brand = project.brands.find((b) => b.id === brandId) ?? fallback;
  const valid = reportOptionsSchema.safeParse(options);
  const model = useMemo(() => {
    if (!reportOptionsSchema.safeParse(options).success) return null;
    return composeReport(project, options, generatedAt);
  }, [project, options, generatedAt]);
  const pages = useMemo(() => {
    try {
      return model?.sections.length
        ? layoutReport(model, brand, format === 'pdf' ? 'pdf' : 'pptx')
        : [];
    } catch {
      return [];
    }
  }, [model, brand, format]);
  const previewPage = pages[Math.min(pageIndex, pages.length - 1)];
  useEffect(
    () => () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    },
    [pdfUrl],
  );
  useEffect(() => () => controller.current?.abort(), []);
  function update<K extends keyof ReportOptions>(key: K, value: ReportOptions[K]) {
    setOptions((o) => ({ ...o, [key]: value }));
    setMessage('');
    setPdfUrl('');
    setPageIndex(0);
  }
  function moveSection(index: number, delta: number) {
    const sections = [...options.sections];
    [sections[index], sections[index + delta]] = [sections[index + delta]!, sections[index]!];
    update('sections', sections);
  }
  async function generate(preview = false) {
    if (!model) {
      setError(t('Check the report title, period and sections.'));
      return;
    }
    setBusy(true);
    setError('');
    setMessage('');
    setProgress(0);
    const abort = new AbortController();
    controller.current = abort;
    const start = performance.now();
    try {
      const blob = await renderReport(model, brand, preview ? 'pdf' : format, {
        signal: abort.signal,
        onProgress: (done, total) => setProgress(Math.round((done / Math.max(1, total)) * 100)),
      });
      if (preview) setPdfUrl(URL.createObjectURL(blob));
      else
        saveBlob(
          blob,
          `toolbox-${options.kind}-${new Date().toISOString().slice(0, 10)}.${format === 'markdown' ? 'md' : format}`,
        );
      setMessage(
        t('Generated locally in {seconds} seconds.', {
          seconds: ((performance.now() - start) / 1000).toLocaleString(language, {
            maximumFractionDigits: 2,
          }),
        }),
      );
    } catch (e) {
      if (abort.signal.aborted) setMessage(t('Generation cancelled.'));
      else setError(errorMessage(e));
    } finally {
      setBusy(false);
      controller.current = null;
    }
  }
  const groups = [
    {
      key: 'decision',
      name: 'DecisionTrace',
      items: project.decisions.map((d) => ({ ...d, date: d.date })),
    },
    {
      key: 'scope',
      name: 'Scope Radar',
      items: project.changes.filter((c) => c.baselineId === options.baselineId),
    },
    {
      key: 'story',
      name: 'StoryGap',
      items: project.stories.map((s) => ({ ...s, date: s.updatedAt.slice(0, 10) })),
    },
  ].filter((g) => ['executive', 'steering', g.key].includes(options.kind));
  return (
    <>
      <PageHeading
        eyebrow="04 / Report Studio"
        title={t('From project memory to shared understanding.')}
        actions={
          <Link to="/brands" className="button secondary">
            {t('Open Brand Studio')}
          </Link>
        }
      >
        {t(
          'Compose a traceable report from your project. Preview it, then export locally without sending data to a service.',
        )}
      </PageHeading>
      {project.dataOrigin === 'fictional' && <Notice>{t('Fictional example data')}</Notice>}
      <nav className="studio-steps" aria-label={t('Report generation steps')}>
        {steps.map((name, i) => (
          <button
            className={`button ${step === i ? 'primary' : 'quiet'}`}
            aria-current={step === i ? 'step' : undefined}
            key={name}
            onClick={() => setStep(i)}
            disabled={busy}
          >
            {i + 1}. {t(name)}
          </button>
        ))}
      </nav>
      <div className="studio-grid">
        <div className="studio-controls">
          <section className="panel studio-controls" aria-label={t(steps[step]!)}>
            <h2>
              {step + 1}. {t(steps[step]!)}
            </h2>
            {step === 0 && (
              <>
                <label>
                  {t('Report type')}
                  <select
                    value={options.kind}
                    onChange={(e) => {
                      const kind = e.target.value as ReportOptions['kind'];
                      update('kind', kind);
                      update('title', t(reportNames[kind]));
                      if (kind === 'steering') {
                        update('detail', 'summary');
                        update('audience', 'Steering committee');
                      }
                    }}
                  >
                    {reportKinds.map((k) => (
                      <option key={k} value={k}>
                        {t(reportNames[k])}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="form-grid">
                  <label>
                    {t('From date')}
                    <input
                      type="date"
                      value={options.from}
                      onChange={(e) => update('from', e.target.value)}
                    />
                  </label>
                  <label>
                    {t('Through date')}
                    <input
                      type="date"
                      value={options.until}
                      onChange={(e) => update('until', e.target.value)}
                    />
                  </label>
                </div>
                {['scope', 'executive', 'steering'].includes(options.kind) && (
                  <label>
                    {t('Reference baseline')}
                    <select
                      value={options.baselineId}
                      onChange={(e) => update('baselineId', e.target.value)}
                    >
                      <option value="">{t('No baseline')}</option>
                      {project.baselines.map((b) => (
                        <option key={b.id} value={b.id}>
                          v{b.version} · {b.date}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <div className="studio-toolbar">
                  <button
                    className="button quiet"
                    onClick={() =>
                      update(
                        'selectedIds',
                        groups.flatMap((g) => g.items.map((i) => i.id)),
                      )
                    }
                  >
                    {t('Select all')}
                  </button>
                  <button className="button quiet" onClick={() => update('selectedIds', [])}>
                    {t('Clear selection')}
                  </button>
                </div>
                {groups.map((g) => (
                  <fieldset key={g.key}>
                    <legend>{g.name}</legend>
                    <div className="studio-selection">
                      {g.items.map((i) => (
                        <label className="checkbox" key={i.id}>
                          <input
                            type="checkbox"
                            checked={options.selectedIds.includes(i.id)}
                            onChange={(e) =>
                              update(
                                'selectedIds',
                                e.target.checked
                                  ? [...options.selectedIds, i.id]
                                  : options.selectedIds.filter((id) => id !== i.id),
                              )
                            }
                          />
                          <span>
                            {i.title}
                            <small className="muted"> · {i.date}</small>
                          </span>
                        </label>
                      ))}
                      {!g.items.length && (
                        <p className="muted">{t('No records in this module.')}</p>
                      )}
                    </div>
                  </fieldset>
                ))}
              </>
            )}
            {step === 1 && (
              <>
                <label>
                  {t('Audience')}
                  <select
                    value={options.audience}
                    onChange={(e) =>
                      update('audience', e.target.value as ReportOptions['audience'])
                    }
                  >
                    {[
                      'Development team',
                      'Product Owner',
                      'Project leadership',
                      'Steering committee',
                      'Business stakeholders',
                    ].map((a) => (
                      <option key={a} value={a}>
                        {t(a)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  {t('Level of detail')}
                  <select
                    value={options.detail}
                    onChange={(e) => update('detail', e.target.value as ReportOptions['detail'])}
                  >
                    <option value="summary">{t('Summary')}</option>
                    <option value="detailed">{t('Detailed')}</option>
                  </select>
                </label>
                <p className="muted small">
                  {t(
                    'Summary keeps rationale and outcomes. Detailed reports also include alternatives, history and recorded constraints. The audience is printed on the cover; no unrecorded narrative is invented.',
                  )}
                </p>
              </>
            )}
            {step === 2 && (
              <>
                <label>
                  {t('Export format')}
                  <select
                    value={format}
                    onChange={(e) => {
                      setFormat(e.target.value as ExportFormat);
                      setPdfUrl('');
                      setPageIndex(0);
                    }}
                  >
                    {['pdf', 'pptx', 'xlsx', 'markdown', 'json', 'csv'].map((f) => (
                      <option value={f} key={f}>
                        {f === 'pptx' ? 'PowerPoint (.pptx)' : f.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  {t('Report language')}
                  <select
                    value={options.language}
                    onChange={(e) => update('language', e.target.value as 'en' | 'fr')}
                  >
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                  </select>
                </label>
                <p className="muted small">
                  {t(
                    'User content stays in its original language. JSON contains the normalized report model; it is not a project backup.',
                  )}
                </p>
              </>
            )}
            {step === 3 && (
              <>
                <label>
                  {t('Brand profile')}
                  <select
                    value={brandId}
                    onChange={(e) => {
                      setBrandId(e.target.value);
                      setPdfUrl('');
                    }}
                  >
                    <option value="">{t('Default corporate profile')}</option>
                    {project.brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  {t('Report title')}
                  <input
                    value={options.title}
                    maxLength={180}
                    onChange={(e) => update('title', e.target.value)}
                  />
                </label>
                <label>
                  {t('Introduction')}
                  <textarea
                    value={options.introduction}
                    maxLength={3000}
                    onChange={(e) => update('introduction', e.target.value)}
                  />
                </label>
                <fieldset>
                  <legend>{t('Sections and order')}</legend>
                  {(Object.keys(sectionNames) as SectionKey[]).map((key) => (
                    <label className="checkbox" key={key}>
                      <input
                        type="checkbox"
                        checked={options.sections.includes(key)}
                        onChange={(e) =>
                          update(
                            'sections',
                            e.target.checked
                              ? [...options.sections, key]
                              : options.sections.filter((k) => k !== key),
                          )
                        }
                      />
                      {t(sectionNames[key])}
                    </label>
                  ))}
                </fieldset>
                {options.sections.map((key, i) => (
                  <div className="studio-section-order" key={key}>
                    <span>{t(sectionNames[key])}</span>
                    <button
                      className="button quiet"
                      aria-label={t('Move {section} up', { section: t(sectionNames[key]) })}
                      disabled={i === 0}
                      onClick={() => moveSection(i, -1)}
                    >
                      ↑
                    </button>
                    <button
                      className="button quiet"
                      aria-label={t('Move {section} down', { section: t(sectionNames[key]) })}
                      disabled={i === options.sections.length - 1}
                      onClick={() => moveSection(i, 1)}
                    >
                      ↓
                    </button>
                  </div>
                ))}
              </>
            )}
            {step === 4 && (
              <>
                <p>
                  {t(
                    'Review the pages beside this panel. Empty sections are omitted automatically.',
                  )}
                </p>
                <p>
                  {pages.length} {t('preview pages')}
                </p>
                <button
                  className="button secondary"
                  onClick={() => void generate(true)}
                  disabled={busy || !model?.sections.length}
                >
                  {t('Preview actual PDF')}
                </button>
                {pdfUrl && (
                  <a className="text-link" href={pdfUrl} target="_blank" rel="noreferrer">
                    {t('Open rendered PDF')}
                  </a>
                )}
              </>
            )}
            {step === 5 && (
              <>
                <p>
                  {t(
                    'The document contains only the selected records and the stated calculation context. Review it before sharing.',
                  )}
                </p>
                <button
                  className="button primary"
                  onClick={() => void generate()}
                  disabled={busy || !model?.sections.length}
                >
                  {t('Download {format}', { format: format.toUpperCase() })}
                </button>
              </>
            )}
            {brandProblems(brand).map((p) => (
              <Notice key={p}>{t(p)}</Notice>
            ))}
            {!valid.success && (
              <ErrorNotice>{t('Check the report title, period and sections.')}</ErrorNotice>
            )}
            {model && !model.sections.length && (
              <Notice>{t('No content matches the selected records, period and sections.')}</Notice>
            )}
            {error && <ErrorNotice>{error}</ErrorNotice>}
            {busy && (
              <>
                <progress max={100} value={progress} aria-label={t('Export progress')} />
                <button className="button secondary" onClick={() => controller.current?.abort()}>
                  {t('Cancel generation')}
                </button>
              </>
            )}
            <p role="status">{message}</p>
            <div className="studio-toolbar">
              <button
                className="button secondary"
                disabled={!step || busy}
                onClick={() => setStep(step - 1)}
              >
                {t('Previous step')}
              </button>
              <button
                className="button primary"
                disabled={step === 5 || busy || !valid.success}
                onClick={() => setStep(step + 1)}
              >
                {t('Next step')}
              </button>
            </div>
          </section>
        </div>
        <section className="studio-preview" aria-label={t('Report preview')}>
          <h2>{t('Report preview')}</h2>
          {previewPage ? (
            <>
              <div className="studio-toolbar">
                <button
                  className="button secondary"
                  disabled={pageIndex <= 0}
                  onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
                >
                  {t('Previous page')}
                </button>
                <span aria-live="polite">
                  {Math.min(pageIndex + 1, pages.length)} / {pages.length}
                </span>
                <button
                  className="button secondary"
                  disabled={pageIndex >= pages.length - 1}
                  onClick={() => setPageIndex(pageIndex + 1)}
                >
                  {t('Next page')}
                </button>
                <button
                  className="button quiet"
                  onClick={() =>
                    saveBlob(
                      new Blob([pageSvg(previewPage, brand)], { type: 'image/svg+xml' }),
                      'report-page.svg',
                    )
                  }
                >
                  {t('Export page SVG')}
                </button>
              </div>
              <svg
                className="report-page-preview"
                viewBox={`0 0 ${previewPage.width} ${previewPage.height}`}
                role="img"
                aria-label={`${previewPage.title} · ${pageIndex + 1}`}
              >
                <title>{previewPage.title}</title>
                {previewPage.rects.map((r, i) => (
                  <rect key={i} x={r.x} y={r.y} width={r.width} height={r.height} fill={r.color} />
                ))}
                {previewPage.texts.map((text, i) => (
                  <text
                    key={i}
                    x={text.x}
                    y={text.y + text.size}
                    fill={text.color}
                    fontSize={text.size}
                    fontFamily={text.font}
                  >
                    {text.text}
                  </text>
                ))}
                {brand.logo && previewPage.logo && (
                  <image
                    href={brand.logo}
                    x={previewPage.logo.x}
                    y={previewPage.logo.y}
                    width={previewPage.logo.width}
                    height={previewPage.logo.height}
                    preserveAspectRatio="xMinYMin meet"
                  />
                )}
              </svg>
              <p className="muted small">
                {t(
                  'Layout preview. PDF pagination uses the embedded font metrics; open the rendered PDF to inspect the final pages.',
                )}
              </p>
              <details>
                <summary>{t('Accessible text preview')}</summary>
                {previewPage.texts.map((line, i) => (
                  <p key={i}>{line.text}</p>
                ))}
              </details>
            </>
          ) : (
            <p>{t('Select content to preview a document.')}</p>
          )}
          {pdfUrl && (
            <iframe title={t('Rendered PDF preview')} src={pdfUrl} className="pdf-preview" />
          )}
        </section>
      </div>
    </>
  );
}
