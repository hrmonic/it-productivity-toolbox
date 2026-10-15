import { useId, useState, type ChangeEvent, type FormEvent } from 'react';
import { Check, Download, Palette, Plus, RotateCcw, Settings2, Upload } from 'lucide-react';
import { t } from '../shared/i18n';
import { contrast, readableOn } from '../features/brand-studio/domain';
import { download, errorMessage } from '../shared/lib/utils';
import { ErrorNotice } from '../shared/ui/primitives';
import { brand } from './brand';
import { useSystemTheme } from '../shared/lib/use-system-theme';
import {
  defaultAppearance,
  draftTheme,
  palettes,
  parseAppearance,
  themeProblems,
  type Appearance,
  type CustomTheme,
} from './appearance';
import { setDisplayMode, updateAppearance, useAppearance } from './appearance-store';

const colorFields = [
  ['accent', 'Accent color'],
  ['background', 'Page background'],
  ['surface', 'Card background'],
  ['text', 'Text color'],
] as const;
function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  const descriptionId = useId();
  return (
    <label className="preference-toggle">
      <span>
        <strong>{t(label)}</strong>
        <small id={descriptionId}>{t(description)}</small>
      </span>
      <input
        type="checkbox"
        aria-label={t(label)}
        aria-describedby={descriptionId}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}
export default function AppearanceSettings() {
  const preferences = useAppearance();
  const [draft, setDraft] = useState<CustomTheme>(() => draftTheme('light'));
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const systemDark = useSystemTheme();
  const dark = preferences.mode === 'system' ? systemDark : preferences.mode === 'dark';
  const problems = themeProblems(draft);
  const preview = problems.length ? draftTheme(draft.mode) : draft;
  const active = preferences.themes.find((theme) => theme.id === preferences.themeId);
  function change(patch: Partial<Appearance>) {
    updateAppearance(patch);
    setStatus('Preferences applied.');
    setError('');
  }
  function save(event: FormEvent) {
    event.preventDefault();
    if (!draft.name.trim()) {
      setError('Give your theme a name.');
      return;
    }
    if (problems.length) {
      setError(problems[0]!);
      return;
    }
    const existing = preferences.themes.some((theme) => theme.id === draft.id);
    if (!existing && preferences.themes.length >= 12) {
      setError('You can save up to 12 custom themes.');
      return;
    }
    const themes = existing
      ? preferences.themes.map((theme) =>
          theme.id === draft.id ? { ...draft, name: draft.name.trim() } : theme,
        )
      : [...preferences.themes, { ...draft, name: draft.name.trim() }];
    change({ themes, themeId: draft.id, mode: draft.mode });
    setStatus('Theme saved and applied.');
  }
  async function importPreferences(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      if (file.size > 32 * 1024) throw new Error('Settings files must be smaller than 32 KiB.');
      const result = parseAppearance(JSON.parse(await file.text()));
      updateAppearance(result);
      setEditing(false);
      setError('');
      setStatus('Preferences imported. Project data was preserved.');
    } catch {
      setError('This settings file is invalid. Your current preferences were preserved.');
    }
  }
  return (
    <>
      <section className="settings-section" aria-labelledby="appearance-title">
        <div className="settings-label">
          <h2 id="appearance-title">{t('Appearance')}</h2>
          <p>{t('Your colors, your workspace. Changes apply immediately.')}</p>
        </div>
        <div className="preference-content">
          <div className="preference-brand">
            <img src={brand.mark} width="56" height="56" alt="" />
            <div>
              <strong>{t('Make room for your way of working.')}</strong>
              <p>{t('A personal workspace, with readable colors and controls that suit you.')}</p>
            </div>
          </div>
          <div className="theme-options" role="group" aria-label={t('Display mode')}>
            {(['light', 'dark', 'system'] as const).map((mode) => (
              <button
                key={mode}
                className={`theme-option ${preferences.mode === mode ? 'selected' : ''}`}
                aria-pressed={preferences.mode === mode}
                onClick={() => {
                  setDisplayMode(mode);
                  setStatus('Preferences applied.');
                }}
              >
                <span className={`theme-preview ${mode}`} aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <strong>{t(mode[0]!.toUpperCase() + mode.slice(1))}</strong>
              </button>
            ))}
          </div>
          <div>
            <h3>{t('Color palette')}</h3>
            <div className="palette-options" role="group" aria-label={t('Color palette')}>
              {palettes.map((palette) => (
                <button
                  key={palette.id}
                  className={`palette-option ${preferences.themeId === palette.id ? 'selected' : ''}`}
                  aria-pressed={preferences.themeId === palette.id}
                  onClick={() => change({ themeId: palette.id })}
                >
                  <span
                    style={{
                      background: dark ? palette.dark : palette.light,
                      color: readableOn(dark ? palette.dark : palette.light),
                    }}
                    aria-hidden="true"
                  >
                    {preferences.themeId === palette.id && <Check size={16} />}
                  </span>
                  {t(palette.name)}
                </button>
              ))}
            </div>
          </div>
          {preferences.themes.length > 0 && (
            <div>
              <h3>{t('Your saved themes')}</h3>
              <div className="saved-themes">
                {preferences.themes.map((theme) => (
                  <div className="saved-theme" key={theme.id}>
                    <button
                      className="saved-theme-select"
                      aria-pressed={preferences.themeId === theme.id}
                      onClick={() => change({ themeId: theme.id, mode: theme.mode })}
                    >
                      <span
                        className="theme-dot"
                        style={{ background: theme.accent }}
                        aria-hidden="true"
                      />
                      <span>{theme.name}</span>
                      {preferences.themeId === theme.id && <Check size={16} />}
                    </button>
                    <button
                      className="text-link"
                      aria-label={t('Edit theme {name}', { name: theme.name })}
                      onClick={() => {
                        setDraft({ ...theme });
                        setEditing(true);
                        setError('');
                      }}
                    >
                      {t('Edit')}
                    </button>
                    <button
                      className="text-link"
                      aria-label={t('Delete theme {name}', { name: theme.name })}
                      onClick={() => {
                        change({
                          themes: preferences.themes.filter((item) => item.id !== theme.id),
                          ...(preferences.themeId === theme.id ? { themeId: 'indigo' } : {}),
                        });
                        if (draft.id === theme.id) setEditing(false);
                      }}
                    >
                      {t('Delete')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <button
            className="button secondary"
            onClick={() => {
              setDraft(draftTheme(dark ? 'dark' : 'light'));
              setEditing(true);
              setError('');
            }}
          >
            <Plus size={16} />
            {t('Create a custom theme')}
          </button>
          {active && (
            <p className="small muted">{t('Active theme: {name}', { name: active.name })}</p>
          )}
          <p className="small muted">
            {t(
              'Changing display mode returns custom themes to a built-in palette. Saved themes remain available.',
            )}
          </p>
          {editing && (
            <form className="theme-editor" onSubmit={save}>
              <div className="section-heading">
                <h3>
                  <Palette size={17} /> {t('Theme editor')}
                </h3>
                <button className="text-link" type="button" onClick={() => setEditing(false)}>
                  {t('Close editor')}
                </button>
              </div>
              <div className="preference-grid">
                <label className="field">
                  {t('Theme name')}
                  <input
                    value={draft.name}
                    maxLength={48}
                    required
                    onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                    placeholder={t('My workspace')}
                  />
                </label>
                <label className="field">
                  {t('Theme base')}
                  <select
                    value={draft.mode}
                    onChange={(event) =>
                      setDraft({
                        ...draftTheme(event.target.value as 'light' | 'dark'),
                        id: draft.id,
                        name: draft.name,
                      })
                    }
                  >
                    <option value="light">{t('Light')}</option>
                    <option value="dark">{t('Dark')}</option>
                  </select>
                </label>
              </div>
              <div className="theme-color-grid">
                {colorFields.map(([key, label]) => (
                  <div className="theme-color-field" key={key}>
                    <label htmlFor={`theme-${key}`}>{t(label)}</label>
                    <div>
                      <input
                        type="color"
                        aria-label={t('{label} picker', { label: t(label) })}
                        value={/^#[0-9a-f]{6}$/i.test(draft[key]) ? draft[key] : '#000000'}
                        onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
                      />
                      <input
                        id={`theme-${key}`}
                        value={draft[key]}
                        maxLength={7}
                        pattern="#[0-9a-fA-F]{6}"
                        required
                        spellCheck={false}
                        onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div
                className="theme-live-preview"
                style={{ background: preview.background, color: preview.text }}
              >
                <div className="preview-mini-sidebar" style={{ background: preview.surface }}>
                  <img src={brand.mark} width="32" height="32" alt="" />
                  <span style={{ background: preview.accent }} />
                  <span />
                  <span />
                </div>
                <div className="preview-mini-content">
                  <span>{t('Workspace preview')}</span>
                  <strong>{t('Clarity, in your colors.')}</strong>
                  <p>{t('Decisions, scope and stories in one connected workspace.')}</p>
                  <div style={{ background: preview.surface }}>
                    <span>{t('Ready for review')}</span>
                    <span
                      className="preview-action"
                      style={{ background: preview.accent, color: readableOn(preview.accent) }}
                    >
                      {t('Open report')}
                    </span>
                  </div>
                </div>
              </div>
              <p className="small muted">
                {t('Text contrast: page {page}:1 · cards {cards}:1', {
                  page: contrast(preview.text, preview.background).toFixed(2),
                  cards: contrast(preview.text, preview.surface).toFixed(2),
                })}
              </p>
              {problems.length > 0 && (
                <p className="theme-warning" role="status">
                  {t(problems[0]!)}
                </p>
              )}
              <p className="small muted">
                {t(
                  'Text must reach 4.5:1 contrast on both backgrounds. Link colors are adjusted for readability; high contrast overrides custom surfaces.',
                )}
              </p>
              <button className="button primary" type="submit">
                <Check size={16} />
                {t('Save and apply theme')}
              </button>
            </form>
          )}
        </div>
      </section>
      <section className="settings-section" aria-labelledby="reading-title">
        <div className="settings-label">
          <h2 id="reading-title">{t('Reading & layout')}</h2>
          <p>{t('Adjust text and spacing to your reading comfort.')}</p>
        </div>
        <div className="preference-content">
          <label className="field">
            {t('Text size')}
            <div className="text-size-control">
              <input
                type="range"
                min="100"
                max="200"
                step="12.5"
                value={preferences.textScale}
                aria-valuetext={`${preferences.textScale}%`}
                onChange={(event) => change({ textScale: Number(event.target.value) })}
              />
              <output>{preferences.textScale}%</output>
            </div>
            <small>{t('Scales interface text up to 200%. Browser zoom remains available.')}</small>
          </label>
          <div className="preference-grid">
            <label className="field">
              {t('Interface font')}
              <select
                value={preferences.font}
                onChange={(event) => change({ font: event.target.value as Appearance['font'] })}
              >
                <option value="system">{t('System default')}</option>
                <option value="sans">{t('Readable sans serif')}</option>
                <option value="serif">{t('Serif')}</option>
                <option value="mono">{t('Monospace')}</option>
              </select>
            </label>
            <label className="field">
              {t('Content density')}
              <select
                value={preferences.density}
                onChange={(event) =>
                  change({ density: event.target.value as Appearance['density'] })
                }
              >
                <option value="comfortable">{t('Comfortable')}</option>
                <option value="compact">{t('Compact')}</option>
              </select>
            </label>
          </div>
          <Toggle
            label="Relaxed text spacing"
            description="Increase paragraph line height, letter spacing and word spacing."
            checked={preferences.textSpacing}
            onChange={(textSpacing) => change({ textSpacing })}
          />
          <Toggle
            label="Larger controls"
            description="Use larger buttons, inputs and touch targets."
            checked={preferences.largeControls}
            onChange={(largeControls) => change({ largeControls })}
          />
        </div>
      </section>
      <section className="settings-section" aria-labelledby="accessibility-title">
        <div className="settings-label">
          <h2 id="accessibility-title">{t('Accessibility')}</h2>
          <p>{t('Make focus, links and content easier to follow.')}</p>
        </div>
        <div className="preference-content">
          <div className="preference-grid">
            <label className="field">
              {t('Contrast')}
              <select
                aria-label={t('Contrast')}
                value={preferences.contrast}
                onChange={(event) =>
                  change({ contrast: event.target.value as Appearance['contrast'] })
                }
              >
                <option value="system">{t('Follow device preference')}</option>
                <option value="standard">{t('Standard')}</option>
                <option value="high">{t('High contrast')}</option>
              </select>
            </label>
            <label className="field">
              {t('Motion')}
              <select
                aria-label={t('Motion')}
                value={preferences.motion}
                onChange={(event) => change({ motion: event.target.value as Appearance['motion'] })}
              >
                <option value="system">{t('Follow device preference')}</option>
                <option value="reduce">{t('Reduce motion')}</option>
              </select>
              <small>{t('Your device’s reduced-motion preference is always respected.')}</small>
            </label>
          </div>
          <Toggle
            label="Underline links"
            description="Identify links without relying on color alone."
            checked={preferences.underlineLinks}
            onChange={(underlineLinks) => change({ underlineLinks })}
          />
          <Toggle
            label="Stronger keyboard focus"
            description="Show a wider focus ring around keyboard-selected controls."
            checked={preferences.strongFocus}
            onChange={(strongFocus) => change({ strongFocus })}
          />
        </div>
      </section>
      <section className="settings-section" aria-labelledby="preferences-title">
        <div className="settings-label">
          <h2 id="preferences-title">{t('Your preferences')}</h2>
          <p>{t('Keep your themes and accessibility choices with you.')}</p>
        </div>
        <div className="preference-content">
          <p className="small muted">
            {t(
              'Preferences are stored in this browser, separately from project backups. If browser storage is unavailable, changes last for this session. Project data and document brand profiles are unchanged.',
            )}
          </p>
          <div className="preference-actions">
            <button
              className="button secondary"
              onClick={() => {
                try {
                  download(
                    'toolbox-settings.json',
                    JSON.stringify(preferences, null, 2),
                    'application/json',
                  );
                  setStatus('Settings export prepared.');
                } catch (e) {
                  setError(errorMessage(e));
                }
              }}
            >
              <Download size={16} />
              {t('Export settings')}
            </button>
            <label className="button secondary file-button">
              <Upload size={16} />
              {t('Import settings')}
              <input
                type="file"
                accept="application/json,.json"
                aria-label={t('Import settings')}
                onChange={(event) => void importPreferences(event)}
              />
            </label>
            <button
              className="button secondary"
              onClick={() => {
                change({ ...defaultAppearance, themes: preferences.themes });
                setEditing(false);
                setStatus('Default preferences restored. Project data was preserved.');
              }}
            >
              <RotateCcw size={16} />
              {t('Reset preferences')}
            </button>
          </div>
          {error && <ErrorNotice>{t(error)}</ErrorNotice>}
          <p className="preference-status small" role="status">
            <Settings2 size={15} />
            {t(status || 'Changes apply immediately. No account or remote service is required.')}
          </p>
        </div>
      </section>
    </>
  );
}
