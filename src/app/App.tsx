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
  CodeXml,
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
import { Empty, ErrorNotice } from '../shared/ui/primitives';
import { WorkspaceProvider } from './workspace';
import { readPreference, writePreference } from './preferences';
import { brand } from './brand';
import { BrandIdentity } from './BrandIdentity';
import { useSystemTheme } from '../shared/lib/use-system-theme';
import { applyAppearance, setDisplayMode, useAppearance } from './appearance-store';
import Home from './Home';
import Projects, { CreateProject } from './Projects';
import Settings from './Settings';

const Decisions = lazy(() => import('../features/decision-trace/DecisionTrace'));
const Scope = lazy(() => import('../features/scope-radar/ScopeRadar'));
const Stories = lazy(() => import('../features/story-gap/StoryGap'));
const Traceability = lazy(() => import('../features/traceability/Traceability'));
const Reports = lazy(() => import('../features/report-studio/ReportStudio'));
const Brands = lazy(() => import('../features/brand-studio/BrandStudio'));
const navigation = [
  { to: '/', label: 'Overview', icon: House },
  { to: '/decisions', label: 'DecisionTrace', icon: GitBranch, number: '01' },
  { to: '/scope', label: 'Scope Radar', icon: ListFilter, number: '02' },
  { to: '/stories', label: 'StoryGap', icon: ScanText, number: '03' },
  { to: '/traceability', label: 'Traceability', icon: Layers },
  { to: '/reports', label: 'Report Studio', icon: BookOpen },
  { to: '/brands', label: 'Brand Studio', icon: CodeXml },
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
  const appearance = useAppearance();
  const theme = appearance.mode;
  const systemDark = useSystemTheme();
  const resolvedTheme = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
  const [mobile, setMobile] = useState(false),
    [creating, setCreating] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const location = useLocation();
  function closeNavigation() {
    setMobile(false);
    requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('.mobile-menu')?.focus());
  }
  const projects = data?.projects ?? [],
    project = projects.find((p) => p.id === activeId) ?? projects[0];
  function select(id: string) {
    setActiveId(id);
    writePreference('project', id);
  }
  useEffect(() => {
    applyAppearance(appearance);
    const media = [
      '(prefers-color-scheme: dark)',
      '(prefers-contrast: more)',
      '(prefers-reduced-motion: reduce)',
    ].map((query) => matchMedia(query));
    const refresh = () => applyAppearance(appearance);
    media.forEach((query) => query.addEventListener('change', refresh));
    return () => media.forEach((query) => query.removeEventListener('change', refresh));
  }, [appearance]);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 761px)');
    const resize = () => {
      if (media.matches) setMobile(false);
    };
    media.addEventListener('change', resize);
    return () => media.removeEventListener('change', resize);
  }, []);
  useEffect(() => {
    if (!mobile) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const navigation = document.querySelector<HTMLElement>('.sidebar');
    navigation?.querySelector<HTMLButtonElement>('.mobile-close')?.focus();
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeNavigation();
      }
      if (event.key === 'Tab') {
        const controls = navigation?.querySelectorAll<HTMLElement>(
          'a[href], button:not(:disabled)',
        );
        const first = controls?.[0],
          last = controls?.[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('keydown', close);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobile]);
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
        <Route path="/settings" element={<Settings projects={projects} onSelect={select} />} />
        {[
          ['decisions', <Decisions key={project?.id} />],
          ['scope', <Scope key={project?.id} />],
          ['stories', <Stories key={project?.id} />],
          ['traceability', <Traceability key={project?.id} />],
          ['reports', <Reports key={project?.id} />],
          ['brands', <Brands key={project?.id} />],
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
          tabIndex={-1}
          aria-label={t('Close navigation')}
          onClick={closeNavigation}
        />
      )}
      <aside
        id="workspace-navigation"
        className={`sidebar ${mobile ? 'is-open' : ''}`}
        role={mobile ? 'dialog' : undefined}
        aria-modal={mobile || undefined}
        aria-label={t('Main navigation')}
      >
        <Link className="brand" to="/" aria-label={brand.name} onClick={closeNavigation}>
          <BrandIdentity />
        </Link>
        <button
          className="mobile-close icon-button"
          aria-label={t('Close navigation')}
          onClick={closeNavigation}
        >
          <X size={20} />
        </button>
        <div className="sidebar-section-label">{t('WORKSPACE')}</div>
        <nav aria-label={t('Main navigation')}>
          {navigation.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} onClick={closeNavigation}>
              <n.icon size={18} />
              <span>{t(n.label)}</span>
              {n.number && <small>{n.number}</small>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-rule" />
        <nav aria-label={t('Workspace management')}>
          <NavLink to="/projects" onClick={closeNavigation}>
            <FolderOpen size={18} />
            <span>{t('Projects')}</span>
            <small>{projects.length}</small>
          </NavLink>
          <NavLink to="/settings" onClick={closeNavigation}>
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
            <strong>IT Productivity Toolbox</strong>
            <span>{t('Created by Réda Touzani')}</span>
            <div>
              <a href="https://github.com/hrmonic" target="_blank" rel="noreferrer">
                GitHub
              </a>
              <span aria-hidden="true"> · </span>
              <a href="mailto:dev@hrmonic.fr">{t('Contact')}</a>
            </div>
            <a href={`${brand.repository}/blob/main/LICENSE`} target="_blank" rel="noreferrer">
              Apache License 2.0
            </a>
          </div>
        </div>
      </aside>
      <div className="main-shell" inert={mobile}>
        <header className="app-header">
          <div className="header-left">
            <button
              className="icon-button mobile-menu"
              aria-label={t('Open navigation')}
              aria-expanded={mobile}
              aria-controls="workspace-navigation"
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
            <button
              className="icon-button"
              aria-label={t('Toggle color theme')}
              title={
                resolvedTheme === 'dark' ? t('Switch to light theme') : t('Switch to dark theme')
              }
              onClick={() =>
                setDisplayMode(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark')
              }
            >
              {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link className="icon-button" aria-label={t('Help and settings')} to="/settings">
              <CircleHelp size={18} />
            </Link>
            <a
              className="icon-button source-link"
              href={brand.repository}
              target="_blank"
              rel="noreferrer"
              aria-label={t('View source on GitHub')}
              title={t('View source on GitHub')}
            >
              <CodeXml size={18} />
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
