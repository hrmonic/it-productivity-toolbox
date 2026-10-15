import { t } from '../shared/i18n';
import { val } from '../shared/ui/form-utils';
import { useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Download,
  FolderOpen,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Project } from '../shared/types/models';
import { db, deleteProject, insertProject, saveProject } from '../shared/data/db';
import { createProject, demoProject } from '../shared/data/demo';
import { exportBackup } from '../shared/data/backup';
import { download, errorMessage } from '../shared/lib/utils';
import { humanDate } from '../shared/lib/format';
import {
  Badge,
  Confirm,
  Empty,
  ErrorNotice,
  Field,
  Form,
  Modal,
  PageHeading,
} from '../shared/ui/primitives';

export function CreateProject({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  return (
    <Modal
      title={t('A space for your next project')}
      description={t('Decisions, changes, and stories stay separate for each project.')}
      open
      onClose={onClose}
    >
      <Form
        submit={t('Create project')}
        onCancel={onClose}
        onSave={async (data) => {
          const p = createProject(val(data, 'name'), val(data, 'description'));
          p.dataOrigin = data.get('fictional') === 'on' ? 'fictional' : 'recorded';
          await insertProject(p);
          onCreated(p.id);
          onClose();
        }}
      >
        <Field
          name="name"
          label={t('Project name')}
          required
          placeholder={t('e.g. Customer portal release')}
        />
        <Field
          name="description"
          label={t('Project purpose')}
          type="textarea"
          placeholder={t('What are you trying to achieve?')}
        />
        <label className="checkbox">
          <input name="fictional" type="checkbox" />
          {t('This project contains fictional example data')}
        </label>
      </Form>
    </Modal>
  );
}
export default function Projects({
  projects,
  activeId,
  onSelect,
  onCreate,
  onDemo,
  busy,
}: {
  projects: Project[];
  activeId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDemo: () => void;
  busy: boolean;
}) {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<Project>(),
    [resetting, setResetting] = useState<Project>(),
    [editing, setEditing] = useState<Project>();
  return (
    <>
      <PageHeading
        eyebrow={t('Workspace / Projects')}
        title={t('Give the work a home.')}
        actions={
          <button className="button primary" onClick={onCreate}>
            <Plus size={16} />
            {t('New project')}
          </button>
        }
      >
        {t(
          'Separate contexts. Connected thinking. Each project has its own records and relationships.',
        )}
      </PageHeading>
      {error && <ErrorNotice>{error}</ErrorNotice>}
      {!projects.length ? (
        <Empty
          title={t('Your workspace starts here.')}
          action={t('Create a project')}
          onAction={onCreate}
        >
          {t('Create a blank project or explore the fictional Atlas customer portal below.')}
        </Empty>
      ) : (
        <div className="project-list">
          {projects.map((p) => (
            <article className={`project-card ${p.id === activeId ? 'active' : ''}`} key={p.id}>
              <div className="project-top">
                <span className="project-symbol">
                  <FolderOpen size={23} />
                </span>
                <div className="inline-actions">
                  {p.dataOrigin === 'fictional' && (
                    <Badge tone="demo">{t('Fictional example data')}</Badge>
                  )}
                  {p.id === activeId && <Badge tone="accepted">{t('Active')}</Badge>}
                </div>
              </div>
              <h2>{p.name}</h2>
              <p>
                {p.description || t('A local workspace for the decisions and requirements ahead.')}
              </p>
              <div className="project-facts">
                <span>
                  {p.decisions.length} {t('decisions')}
                </span>
                <span>
                  {p.changes.length} {t('changes')}
                </span>
                <span>
                  {p.stories.length} {t('stories')}
                </span>
              </div>
              <div className="project-bottom">
                <button
                  className="button secondary"
                  onClick={() => {
                    onSelect(p.id);
                    void navigate('/');
                  }}
                >
                  {t('Open project')}
                  <ArrowUpRight size={15} />
                </button>
                <div className="inline-actions">
                  <button
                    className="icon-button"
                    aria-label={t(`Edit ${p.name}`)}
                    onClick={() => setEditing(p)}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label={t(`Back up ${p.name}`)}
                    onClick={() => {
                      try {
                        setError('');
                        download('toolbox-project.json', exportBackup([p]), 'application/json');
                      } catch (e) {
                        setError(errorMessage(e));
                      }
                    }}
                  >
                    <Download size={16} />
                  </button>
                  {p.demo && (
                    <button
                      className="icon-button"
                      aria-label={t(`Reset ${p.name}`)}
                      onClick={() => setResetting(p)}
                    >
                      <RotateCcw size={16} />
                    </button>
                  )}
                  <button
                    className="icon-button danger-text"
                    aria-label={t(`Delete ${p.name}`)}
                    onClick={() => setDeleting(p)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <span className="small muted">
                {t('Updated')} {humanDate(p.updatedAt)}
              </span>
            </article>
          ))}
        </div>
      )}
      <section className="demo-invitation">
        <div>
          <span className="eyebrow">{t('Take a guided first step')}</span>
          <h2>{t('Meet the Atlas delivery team.')}</h2>
          <p>
            {t(
              'A fictional customer portal, real working examples. Trace an export decision through a scope change and into a user story.',
            )}
          </p>
        </div>
        <button className="button secondary" disabled={busy} onClick={onDemo}>
          {projects.some((p) => p.demo) ? t('Open demo project') : t('Load demo project')}
          <ArrowRight size={16} />
        </button>
      </section>
      {deleting && (
        <Confirm
          title={t(`Delete “${deleting.name}”?`)}
          onClose={() => setDeleting(undefined)}
          onConfirm={() => deleteProject(deleting.id)}
        >
          {t(
            'This permanently deletes this project and all its decisions, baselines, changes, stories, and links from this browser. Export a backup first if you need to keep them.',
          )}
        </Confirm>
      )}
      {resetting && (
        <Confirm
          title={t('Reset the demo project?')}
          onClose={() => setResetting(undefined)}
          onConfirm={async () => {
            const fresh = demoProject();
            await db.transaction('rw', db.projects, async () => {
              await db.projects.delete(resetting.id);
              await db.projects.add(fresh);
            });
            onSelect(fresh.id);
          }}
        >
          {t(
            'All edits in this demo project will be replaced with a fresh fictional dataset. Your other projects remain available.',
          )}
        </Confirm>
      )}
      {editing && (
        <Modal title={t('Edit project details')} open onClose={() => setEditing(undefined)}>
          <Form
            version={projects.find((p) => p.id === editing.id)?.revision}
            onCancel={() => setEditing(undefined)}
            onSave={async (data) => {
              const current = projects.find((p) => p.id === editing.id);
              if (!current) throw new Error('This project no longer exists.');
              await saveProject({
                ...current,
                name: val(data, 'name'),
                description: val(data, 'description'),
                dataOrigin:
                  current.demo || data.get('fictional') === 'on' ? 'fictional' : 'recorded',
              });
              setEditing(undefined);
            }}
          >
            <Field name="name" label={t('Project name')} required value={editing.name} />
            <Field
              name="description"
              label={t('Project purpose')}
              type="textarea"
              value={editing.description}
            />
            <label className="checkbox">
              <input
                name="fictional"
                type="checkbox"
                defaultChecked={editing.dataOrigin === 'fictional'}
                disabled={editing.demo}
              />
              {t('This project contains fictional example data')}
            </label>
          </Form>
        </Modal>
      )}
    </>
  );
}
