import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWorkspace } from '../../app/workspace-context';
import {
  brandSchema,
  colorSchema,
  fonts,
  templates,
  type BrandProfile,
} from '../../shared/types/brand';
import { t } from '../../shared/i18n';
import { Confirm, ErrorNotice, Notice, PageHeading } from '../../shared/ui/primitives';
import { errorMessage } from '../../shared/lib/utils';
import {
  brandProblems,
  duplicateBrand,
  importLogo,
  newBrand,
  readableOn,
  templateNames,
} from './domain';
import BrandPreview from './BrandPreview';

const colors = {
  primary: 'Primary color',
  secondary: 'Secondary color',
  accent: 'Accent color',
  titleColor: 'Heading color',
  textColor: 'Body text color',
  background: 'Page background',
} as const;
const palette = [
  '#4338ca',
  '#0f766e',
  '#b45309',
  '#be123c',
  '#182445',
  '#334155',
  '#ffffff',
  '#111111',
];
export default function BrandStudio() {
  const { project, save } = useWorkspace();
  const [draft, setDraft] = useState<BrandProfile>(() => project.brands[0] ?? newBrand());
  const [revision, setRevision] = useState(project.revision);
  const [error, setError] = useState(''),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false),
    [deleting, setDeleting] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [colorTarget, setColorTarget] = useState<keyof typeof colors>('primary');
  const [hexDraft, setHexDraft] = useState<Record<string, string>>({});
  function update<K extends keyof BrandProfile>(key: K, value: BrandProfile[K]) {
    setDraft((b) => ({ ...b, [key]: value }));
    setMessage('');
  }
  function load(b: BrandProfile) {
    setDraft(b);
    setRevision(project.revision);
    setHexDraft({});
    setError('');
    setMessage('');
  }
  async function persist() {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      if (project.revision !== revision)
        throw new Error('This project changed in another tab. Reload it before saving again.');
      const result = brandSchema.safeParse(draft);
      if (!result.success) throw new Error('Check the profile name, colors and document settings.');
      const b = result.data;
      if (Object.values(hexDraft).some((v) => !colorSchema.safeParse(v).success))
        throw new Error('Enter a six-digit HEX color.');
      await save({ ...project, brands: [...project.brands.filter((p) => p.id !== b.id), b] });
      setRevision(revision + 1);
      setMessage(t('Brand profile saved.'));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="05 / Brand Studio"
        title={t('Your documents, your identity.')}
        actions={
          <Link to="/reports" className="button secondary">
            {t('Open Report Studio')}
          </Link>
        }
      >
        {t('Create reusable brand profiles. Preview changes before saving them to this project.')}
      </PageHeading>
      <div className="studio-grid">
        <div className="studio-controls">
          <div className="studio-toolbar">
            <button
              className="button secondary"
              onClick={() => load(newBrand())}
              disabled={busy || project.brands.length >= 30}
            >
              {t('New profile')}
            </button>
            <button
              className="button secondary"
              onClick={() => load(duplicateBrand(draft))}
              disabled={busy || project.brands.length >= 30}
            >
              {t('Duplicate profile')}
            </button>
            <button
              className="button quiet"
              disabled={busy || !project.brands.some((b) => b.id === draft.id)}
              onClick={() => setDeleting(true)}
            >
              {t('Delete profile')}
            </button>
          </div>
          {project.brands.length > 0 && (
            <label>
              {t('Saved profiles')}
              <select
                value={project.brands.some((b) => b.id === draft.id) ? draft.id : ''}
                onChange={(e) => {
                  const b = project.brands.find((p) => p.id === e.target.value);
                  if (b) load(b);
                }}
              >
                <option value="" disabled>
                  {t('Unsaved profile')}
                </option>
                {project.brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <section className="panel studio-controls">
            <h2>{t('Identity')}</h2>
            <label>
              {t('Profile name')}
              <input
                value={draft.name}
                maxLength={100}
                onChange={(e) => update('name', e.target.value)}
              />
            </label>
            <label>
              {t('Company name')}
              <input
                value={draft.company}
                maxLength={180}
                onChange={(e) => update('company', e.target.value)}
              />
            </label>
            <label>
              {t('Company logo')}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setBusy(true);
                  setError('');
                  void importLogo(file)
                    .then((logo) => update('logo', logo))
                    .catch((e) => setError(errorMessage(e)))
                    .finally(() => setBusy(false));
                  e.target.value = '';
                }}
              />
            </label>
            <p className="muted small">
              {t('PNG, JPEG or WebP · 2 MiB maximum · 4096 px maximum. SVG is not supported.')}
            </p>
            {draft.logo && (
              <button className="button quiet" onClick={() => update('logo', '')}>
                {t('Remove logo')}
              </button>
            )}
            <label>
              {t('Logo position')}
              <select
                value={draft.logoPosition}
                onChange={(e) => update('logoPosition', e.target.value as 'left' | 'right')}
              >
                <option value="left">{t('Left')}</option>
                <option value="right">{t('Right')}</option>
              </select>
            </label>
          </section>
          <section className="panel studio-controls">
            <h2>{t('Colors')}</h2>
            {Object.entries(colors).map(([key, name]) => {
              const k = key as keyof typeof colors;
              return (
                <div className="color-row" key={key}>
                  <label htmlFor={`hex-${key}`}>{t(name)}</label>
                  <input
                    type="color"
                    aria-label={t('Visual picker: {name}', { name: t(name) })}
                    value={draft[k]}
                    onFocus={() => setColorTarget(k)}
                    onChange={(e) => {
                      update(k, e.target.value);
                      setHexDraft((d) => ({ ...d, [key]: e.target.value }));
                      setRecent((r) =>
                        [e.target.value, ...r.filter((c) => c !== e.target.value)].slice(0, 8),
                      );
                    }}
                  />
                  <input
                    id={`hex-${key}`}
                    aria-invalid={
                      hexDraft[key] !== undefined && !colorSchema.safeParse(hexDraft[key]).success
                    }
                    value={hexDraft[key] ?? draft[k]}
                    maxLength={7}
                    onFocus={() => setColorTarget(k)}
                    onChange={(e) => {
                      setHexDraft((d) => ({ ...d, [key]: e.target.value }));
                      if (colorSchema.safeParse(e.target.value).success) update(k, e.target.value);
                    }}
                  />
                </div>
              );
            })}
            <label>
              {t('Palette applies to')}
              <select
                value={colorTarget}
                onChange={(e) => setColorTarget(e.target.value as keyof typeof colors)}
              >
                {Object.entries(colors).map(([key, label]) => (
                  <option key={key} value={key}>
                    {t(label)}
                  </option>
                ))}
              </select>
            </label>
            <div className="color-palette" role="group" aria-label={t('Color palette')}>
              {[...new Set([...palette, ...recent])].map((c) => (
                <button
                  className="color-swatch"
                  style={{ background: c }}
                  key={c}
                  aria-label={t('Use color {color}', { color: c })}
                  onClick={() => {
                    update(colorTarget, c);
                    setHexDraft((d) => ({ ...d, [colorTarget]: c }));
                    setRecent((r) => [c, ...r.filter((v) => v !== c)].slice(0, 8));
                  }}
                />
              ))}
            </div>
            <button
              className="button quiet"
              onClick={() => {
                const preset = newBrand();
                setDraft((b) => ({
                  ...b,
                  ...Object.fromEntries(
                    Object.keys(colors).map((k) => [k, preset[k as keyof typeof colors]]),
                  ),
                }));
                setHexDraft({});
              }}
            >
              {t('Restore corporate palette')}
            </button>
            {brandProblems(draft).map((p) => (
              <Notice key={p}>{t(p)}</Notice>
            ))}
            {brandProblems(draft).length > 0 && (
              <button
                className="button secondary"
                onClick={() => {
                  update('textColor', readableOn(draft.background));
                  update('titleColor', readableOn(draft.background));
                  setHexDraft({});
                }}
              >
                {t('Use readable text colors')}
              </button>
            )}
          </section>
          <section className="panel studio-controls">
            <h2>{t('Typography & layout')}</h2>
            {(['headingFont', 'subtitleFont', 'bodyFont'] as const).map((key, i) => (
              <label key={key}>
                {t(['Heading font', 'Subtitle font', 'Body font'][i]!)}
                <select
                  value={draft[key]}
                  onChange={(e) => update(key, e.target.value as BrandProfile[typeof key])}
                >
                  {fonts.map((font) => (
                    <option key={font}>{font}</option>
                  ))}
                </select>
              </label>
            ))}
            <p className="muted small">
              {t(
                'PDF uses embedded Noto substitutes. PowerPoint uses the selected system fonts; recipients may see substitutions if unavailable.',
              )}
            </p>
            <label>
              {t('Document template')}
              <select
                value={draft.template}
                onChange={(e) => update('template', e.target.value as BrandProfile['template'])}
              >
                {templates.map((k) => (
                  <option key={k} value={k}>
                    {templateNames[k]}
                  </option>
                ))}
              </select>
            </label>
            {(['header', 'footer'] as const).map((key) => (
              <label key={key}>
                {t(key === 'header' ? 'Document header' : 'Document footer')}
                <input
                  value={draft[key]}
                  maxLength={180}
                  onChange={(e) => update(key, e.target.value)}
                />
              </label>
            ))}
          </section>
          {error && <ErrorNotice>{error}</ErrorNotice>}
          <p role="status">{message}</p>
          <button className="button primary" disabled={busy} onClick={() => void persist()}>
            {busy ? t('Working…') : t('Save brand profile')}
          </button>
        </div>
        <section className="studio-preview" aria-label={t('Live document preview')}>
          <h2>{t('Live document preview')}</h2>
          <BrandPreview brand={draft} />
        </section>
      </div>
      {deleting && (
        <Confirm
          title={t('Delete brand profile?')}
          onClose={() => setDeleting(false)}
          onConfirm={async () => {
            await save({ ...project, brands: project.brands.filter((b) => b.id !== draft.id) });
            load(project.brands.find((b) => b.id !== draft.id) ?? newBrand());
            setRevision(project.revision + 1);
          }}
        >
          {t(
            'This removes only this project’s saved profile. Downloaded documents remain available.',
          )}
        </Confirm>
      )}
    </>
  );
}
