import { t, getLanguage, setLanguage, type Language } from '../shared/i18n';
import { useState, type ChangeEvent } from 'react';
import { Download, ExternalLink, HardDrive, Upload } from 'lucide-react';
import type { Backup, Project } from '../shared/types/models';
import { exportBackup, MAX_IMPORT_BYTES, parseBackup, restoreBackup } from '../shared/data/backup';
import { download, errorMessage } from '../shared/lib/utils';
import { ErrorNotice, Modal, Notice, PageHeading } from '../shared/ui/primitives';
import { brand } from './brand';

export default function Settings({
  projects,
  theme,
  onTheme,
  onSelect,
}: {
  projects: Project[];
  theme: string;
  onTheme: (value: string) => void;
  onSelect: (id: string) => void;
}) {
  const [backup, setBackup] = useState<Backup>(),
    [error, setError] = useState(''),
    [success, setSuccess] = useState(''),
    [busy, setBusy] = useState(false);
  async function readFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    setError('');
    setSuccess('');
    if (!file) return;
    try {
      if (file.size > MAX_IMPORT_BYTES)
        throw new Error('The backup exceeds the 5 MiB import limit.');
      setBackup(parseBackup(await file.text()));
    } catch (e) {
      setError(errorMessage(e));
    }
  }
  return (
    <>
      <PageHeading eyebrow={t('Workspace / Settings')} title={t('Your workspace, your control.')}>
        {t('Choose how you work and keep a portable copy of what matters.')}
      </PageHeading>
      <div className="settings-layout">
        <section className="settings-section">
          <div className="settings-label">
            <h2>{t('Appearance')}</h2>
            <p>{t('Considered in the light. Comfortable in the dark.')}</p>
          </div>
          <div className="theme-options">
            {['light', 'dark', 'system'].map((value) => (
              <button
                key={value}
                className={`theme-option ${theme === value ? 'selected' : ''}`}
                aria-pressed={theme === value}
                onClick={() => onTheme(value)}
              >
                <span className={`theme-preview ${value}`}>
                  <i />
                  <i />
                  <i />
                </span>
                <strong>{t(value[0]!.toUpperCase() + value.slice(1))}</strong>
              </button>
            ))}
          </div>
        </section>
        <section className="settings-section">
          <div className="settings-label">
            <h2>{t('Backups & restoration')}</h2>
            <p>{t('Your projects belong to you. Keep a backup outside this browser.')}</p>
          </div>
          <div className="settings-content">
            <Notice>
              {t(
                'Data lives in IndexedDB on this browser and origin. Clearing site data, using another browser, or changing the application address can make projects unavailable. Backups are plain JSON and are not encrypted.',
              )}
            </Notice>
            <div className="backup-actions">
              <button
                className="button primary"
                disabled={!projects.length}
                onClick={() => {
                  try {
                    download('toolbox-backup.json', exportBackup(projects), 'application/json');
                    setSuccess('Backup prepared. Keep the downloaded file in a safe location.');
                  } catch (e) {
                    setError(errorMessage(e));
                  }
                }}
              >
                <Download size={16} />
                {t('Back up all projects')}
              </button>
              <label className="button secondary file-button">
                <Upload size={16} />
                {t('Restore from JSON')}
                <input
                  aria-label={t('Restore from JSON')}
                  type="file"
                  accept="application/json,.json"
                  onChange={(e) => void readFile(e)}
                />
              </label>
            </div>
            <p className="small muted">
              {t(
                'Versioned format · 5 MiB maximum import · Validated references · Restore as copies',
              )}
            </p>
            {error && <ErrorNotice>{error}</ErrorNotice>}
            {success && (
              <p className="success-message" role="status">
                {t(success)}
              </p>
            )}
          </div>
        </section>
        <section className="settings-section">
          <div className="settings-label">
            <h2>{t('Privacy by design')}</h2>
            <p>{t('Useful tools with a small data footprint.')}</p>
          </div>
          <div className="settings-content privacy-content">
            <HardDrive size={26} />
            <div>
              <h3>{t('Local content. Explicit exports.')}</h3>
              <p>
                {t(
                  'There is no account system, analytics, remote analysis, or cloud synchronization. StoryGap uses local deterministic rules. External documentation links open their own websites when you follow them.',
                )}
              </p>
              <p>
                {t(
                  'Storage is not encrypted. Anyone with access to your browser profile or a compromised device may be able to read it. Use your organization’s data-handling policy when deciding what to record.',
                )}
              </p>
            </div>
          </div>
        </section>
        <section className="settings-section">
          <div className="settings-label">
            <h2>{t('Language')}</h2>
            <p>
              {t(
                'Switch the interface language. Project content is never translated automatically.',
              )}
            </p>
          </div>
          <label className="field">
            {t('Application language')}
            <select
              aria-label={t('Application language')}
              value={getLanguage()}
              onChange={(event) => setLanguage(event.target.value as Language)}
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
            <small>
              {t(
                'Structured JSON keeps stable field names. Human-readable reports follow the selected language. Your original content is preserved.',
              )}
            </small>
          </label>
        </section>
        <section className="settings-section">
          <div className="settings-label">
            <h2>{t('About the toolbox')}</h2>
            <p>{t('Version 0.1.0 · Apache License 2.0')}</p>
          </div>
          <div className="settings-content">
            <h3>{brand.name}</h3>
            <p className="muted">
              {t('Created by')} {brand.maintainer}
              {t('. Focused tools for thoughtful IT delivery.')}
            </p>
            <a className="text-link" href={brand.repository} target="_blank" rel="noreferrer">
              {t('Source code & documentation')}
              <ExternalLink size={15} />
            </a>
          </div>
        </section>
      </div>
      {backup && (
        <Modal
          title={t('Review your backup')}
          description={t(
            'The file has passed schema and reference validation. Review its contents before restoring.',
          )}
          open
          onClose={() => {
            if (!busy) setBackup(undefined);
          }}
        >
          <ul className="restore-preview">
            {backup.projects.map((p) => (
              <li key={p.id}>
                <strong>{p.name}</strong>
                <span>
                  {p.decisions.length} {t('decisions ·')} {p.changes.length} {t('changes ·')}{' '}
                  {p.stories.length} {t('stories ·')} {p.relations.length} {t('links')}
                </span>
              </li>
            ))}
          </ul>
          <p className="muted small">
            {t(
              'Each project will be imported as a new copy with remapped identifiers. Existing projects will not be overwritten.',
            )}
          </p>
          {error && <ErrorNotice>{error}</ErrorNotice>}
          <div className="form-actions">
            <button
              className="button secondary"
              disabled={busy}
              onClick={() => setBackup(undefined)}
            >
              {t('Cancel')}
            </button>
            <button
              className="button primary"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                setError('');
                void restoreBackup(backup)
                  .then((copies) => {
                    if (copies[0]) onSelect(copies[0].id);
                    setSuccess(
                      `Restored ${copies.length} project copies. Existing projects were preserved.`,
                    );
                    setBackup(undefined);
                  })
                  .catch((e: unknown) => setError(errorMessage(e)))
                  .finally(() => setBusy(false));
              }}
            >
              {busy ? t('Restoring…') : t('Restore as new copies')}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
