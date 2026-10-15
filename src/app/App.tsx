import { t, useLanguage } from '../shared/i18n';
import { lazy, Suspense, useEffect, useState } from 'react';
import { HashRouter, Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  CircleHelp,
  FolderOpen,
  GitBranch,
  House,
  Layers,
  ListFilter,
  Menu,
  Moon,
  PanelLeftClose,
  ScanText,
  Settings as SettingsIcon,
  ShieldCheck,
  Sun,
  X,
} from 'lucide-react';
import { db, insertProject, saveProject } from '../shared/data/db';
import { validateProject } from '../shared/data/validation';
import { demoProject } from '../shared/data/demo';
import type { Project } from '../shared/types/models';
import { errorMessage, download } from '../shared/lib/utils';
import { Badge, Empty, ErrorNotice } from '../shared/ui/primitives';
import { WorkspaceProvider } from './workspace';
import { readPreference, writePreference } from './preferences';
import { brand } from './brand';
import Home from './Home';
import Projects, { CreateProject } from './Projects';
import Settings from './Settings';

const Decisions = lazy(() => import('../features/decision-trace/DecisionTrace'));
const Scope = lazy(() => import('../features/scope-radar/ScopeRadar'));
const Stories = lazy(() => import('../features/story-gap/StoryGap'));
const Traceability = lazy(() => import('../features/traceability/Traceability'));
const navigation = [
  { to: '/', label: 'Overview', icon: House },
  { to: '/decisions', label: 'DecisionTrace', icon: GitBranch, number: '01' },
  { to: '/scope', label: 'Scope Radar', icon: ListFilter, number: '02' },
  { to: '/stories', label: 'StoryGap', icon: ScanText, number: '03' },
  { to: '/traceability', label: 'Traceability', icon: Layers },
];

function Shell() {
  const language = useLanguage();
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  const data = useLiveQuery(async () => {
    const raw = await db.projects.toArray();
    const projects: Project[] = [],
      invalid: { id: string; error: string }[] = [];
    for (const p of raw) {
      try {
        projects.push(validateProject(p));
      } catch (e) {
        invalid.push({ id: p.id, error: errorMessage(e) });
      }
    }
    return {
      projects: projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
      invalid,
      raw,
    };
  }, []);
  const [activeId, setActiveId] = useState(() => readPreference('project'));
  const [theme, setTheme] = useState(() => readPreference('theme', 'system'));
  const [mobile, setMobile] = useState(false),
    [creating, setCreating] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const location = useLocation();
  const projects = data?.projects ?? [],
    project = projects.find((p) => p.id === activeId) ?? projects[0];
  function select(id: string) {
    setActiveId(id);
    writePreference('project', id);
  }
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      document.documentElement.dataset.theme =
        theme === 'system' ? (media.matches ? 'dark' : 'light') : theme;
    };
    apply();
    media.addEventListener('change', apply);
    writePreference('theme', theme);
    return () => media.removeEventListener('change', apply);
  }, [theme]);
  async function openDemo() {
    const existing = projects.find((p) => p.demo);
    if (existing) {
      select(existing.id);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const p = demoProject();
      await insertProject(p);
      select(p.id);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  const pageName =
    [
      ...navigation,
      { to: '/projects', label: 'Projects' },
      { to: '/settings', label: 'Settings' },
    ].find((n) => n.to === location.pathname)?.label ?? 'Workspace';
  const content = (
    <Suspense
      fallback={
        <p className="loading" role="status">
          {t('Opening your tool…')}
        </p>
      }
    >
      <Routes>
        <Route
          path="/"
          element={
            <Home
              project={project}
              onDemo={() => void openDemo()}
              onCreate={() => setCreating(true)}
              busy={busy}
            />
          }
        />
        <Route
          path="/projects"
          element={
            <Projects
              projects={projects}
              activeId={project?.id ?? ''}
              onSelect={select}
              onCreate={() => setCreating(true)}
              onDemo={() => void openDemo()}
              busy={busy}
            />
          }
        />
        <Route
          path="/settings"
          element={
            <Settings projects={projects} theme={theme} onTheme={setTheme} onSelect={select} />
          }
        />
        {[
          ['decisions', <Decisions key={project?.id} />],
          ['scope', <Scope key={project?.id} />],
          ['stories', <Stories key={project?.id} />],
          ['traceability', <Traceability key={project?.id} />],
        ].map(([path, element]) => (
          <Route
            key={String(path)}
            path={`/${path}`}
            element={
              project ? (
                element
              ) : (
                <Empty
                  title={t('Choose a project to get started.')}
                  action={t('Create a project')}
                  onAction={() => setCreating(true)}
                >
                  {t('Each tool works within a project. You can also')}{' '}
                  <button className="text-button" onClick={() => void openDemo()}>
                    {t('explore the fictional demo')}
                  </button>
                  .
                </Empty>
              )
            }
          />
        ))}
        <Route
          path="*"
          element={
            <Empty title={t('This page is not in the toolbox.')}>
              <Link to="/">{t('Return to the overview')}</Link>
            </Empty>
          }
        />
      </Routes>
    </Suspense>
  );
  return (
    <div className="app-shell">
      <a
        href="#main-content"
        className="skip-link"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('main-content')?.focus();
        }}
      >
        {t('Skip to content')}
      </a>
      {mobile && (
        <button
          className="mobile-overlay"
          aria-label={t('Close navigation')}
          onClick={() => setMobile(false)}
        />
      )}
      <aside className={`sidebar ${mobile ? 'is-open' : ''}`}>
        <Link className="brand" to="/" onClick={() => setMobile(false)}>
          <span className="brand-logo">
            <i />
            <i />
            <i />
          </span>
          <span>
            {t('IT Productivity')}
            <strong>
              {t('Toolbox')}
              <span className="brand-dot">.</span>
            </strong>
          </span>
        </Link>
        <button
          className="mobile-close icon-button"
          aria-label={t('Close navigation')}
          onClick={() => setMobile(false)}
        >
          <X size={20} />
        </button>
        <div className="sidebar-section-label">{t('WORKSPACE')}</div>
        <nav aria-label={t('Main navigation')}>
          {navigation.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} onClick={() => setMobile(false)}>
              <n.icon size={18} />
              <span>{t(n.label)}</span>
              {n.number && <small>{n.number}</small>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-rule" />
        <nav aria-label={t('Workspace management')}>
          <NavLink to="/projects" onClick={() => setMobile(false)}>
            <FolderOpen size={18} />
            <span>{t('Projects')}</span>
            <small>{projects.length}</small>
          </NavLink>
          <NavLink to="/settings" onClick={() => setMobile(false)}>
            <SettingsIcon size={18} />
            <span>{t('Settings')}</span>
          </NavLink>
        </nav>
        <div className="sidebar-bottom">
          <div className="local-note">
            <ShieldCheck size={19} />
            <div>
              <strong>{t('Quietly local.')}</strong>
              <p>
                {t('Your workspace stays')}
                <br />
                {t('in your browser.')}
              </p>
            </div>
          </div>
          <a
            className="sidebar-docs"
            href={`${brand.repository}/tree/main/docs`}
            target="_blank"
            rel="noreferrer"
          >
            <BookOpen size={16} />
            {t('Documentation')}
            <ArrowUpRight size={13} />
          </a>
          <div className="sidebar-footer">
            <span>{t('v0.1.0 / Apache 2.0')}</span>
            <PanelLeftClose size={15} />
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="app-header">
          <div className="header-left">
            <button
              className="icon-button mobile-menu"
              aria-label={t('Open navigation')}
              onClick={() => setMobile(true)}
            >
              <Menu size={21} />
            </button>
            <div className="project-picker">
              <FolderOpen size={17} />
              <select
                aria-label={t('Active project')}
                value={project?.id ?? ''}
                onChange={(e) => select(e.target.value)}
              >
                {!projects.length && <option value="">{t('Select a project')}</option>}
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.demo ? t(' · demo') : ''}
                  </option>
                ))}
              </select>
              <ChevronDown size={13} />
            </div>
            <span className="header-slash">/</span>
            <span className="header-page">{t(pageName)}</span>
          </div>
          <div className="header-right">
            {project?.demo && <Badge tone="demo">{t('Demo project')}</Badge>}
            <button
              className="icon-button"
              aria-label={t('Toggle color theme')}
              onClick={() =>
                setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark')
              }
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link className="icon-button" aria-label={t('Help and settings')} to="/settings">
              <CircleHelp size={18} />
            </Link>
            <a
              className="avatar"
              href="https://github.com/hrmonic"
              target="_blank"
              rel="noreferrer"
              aria-label={t('Maintainer on GitHub')}
            >
              {t('RT')}
            </a>
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="main-content">
          {error && (
            <div className="global-error">
              <ErrorNotice>{error}</ErrorNotice>
              <button className="text-button" onClick={() => setError('')}>
                {t('Dismiss')}
              </button>
            </div>
          )}
          {data?.invalid.length ? (
            <ErrorNotice>
              {data.invalid.length}{' '}
              {t('project records could not be validated. They have been preserved.')}{' '}
              <button
                className="text-button"
                onClick={() =>
                  download(
                    'toolbox-recovery-unvalidated.json',
                    JSON.stringify(data.raw, null, 2),
                    'application/json',
                  )
                }
              >
                {t('Download raw recovery data')}
              </button>
              <p>
                {t('Keep this file for manual recovery; it is not a validated Toolbox backup.')}
              </p>
            </ErrorNotice>
          ) : null}
          {data === undefined ? (
            <p className="loading" role="status">
              {t('Opening your local workspace…')}
            </p>
          ) : project ? (
            <WorkspaceProvider value={{ project, save: saveProject }}>{content}</WorkspaceProvider>
          ) : (
            content
          )}
        </main>
        <footer className="app-footer">
          <span>{t('Built for thoughtful delivery.')}</span>
          <a href={brand.repository} target="_blank" rel="noreferrer">
            {t('Open source on GitHub')}
            <ArrowUpRight size={12} />
          </a>
        </footer>
      </div>
      {creating && <CreateProject onClose={() => setCreating(false)} onCreated={select} />}
    </div>
  );
}
export default function App() {
  return (
    <HashRouter>
      <Shell />
    </HashRouter>
  );
}
