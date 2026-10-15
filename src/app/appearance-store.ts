import { useSyncExternalStore } from 'react';
import { defaultAppearance, parseAppearance, resolveColors, type Appearance } from './appearance';
import { readPreference, writePreference } from './preferences';

function readAppearance(): Appearance {
  try {
    const raw = readPreference('appearance');
    if (raw) return parseAppearance(JSON.parse(raw));
  } catch {
    /* An invalid preference never prevents access to projects. */
  }
  const legacy = readPreference('theme', 'system');
  return {
    ...defaultAppearance,
    mode: legacy === 'light' || legacy === 'dark' ? legacy : 'system',
  };
}
let current = readAppearance();
const listeners = new Set<() => void>();
function sync(event: StorageEvent) {
  if (
    event.storageArea === localStorage &&
    (event.key === 'toolbox.appearance' || event.key === null)
  ) {
    current = readAppearance();
    listeners.forEach((notify) => notify());
  }
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener('storage', sync);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener('storage', sync);
  };
}
export function updateAppearance(patch: Partial<Appearance>) {
  current = parseAppearance({ ...current, ...patch });
  writePreference('appearance', JSON.stringify(current));
  writePreference('theme', current.mode);
  listeners.forEach((listener) => listener());
}
export function useAppearance() {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => defaultAppearance,
  );
}
export function setDisplayMode(mode: Appearance['mode']) {
  updateAppearance({
    mode,
    ...(current.themes.some((theme) => theme.id === current.themeId) ? { themeId: 'indigo' } : {}),
  });
}
const fonts = {
  system: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  sans: 'Verdana, Arial, sans-serif',
  serif: 'Georgia, Cambria, serif',
  mono: "'SFMono-Regular', Consolas, monospace",
};
const colorKeys = [
  '--amber-bg',
  '--amber-fg',
  '--red-bg',
  '--red-fg',
  '--accepted-bg',
  '--accepted-fg',
];
export function applyAppearance(preferences = current) {
  const root = document.documentElement;
  const dark =
    preferences.mode === 'system'
      ? matchMedia('(prefers-color-scheme: dark)').matches
      : preferences.mode === 'dark';
  const high =
    preferences.contrast === 'high' ||
    (preferences.contrast === 'system' && matchMedia('(prefers-contrast: more)').matches);
  root.dataset.theme = dark ? 'dark' : 'light';
  root.dataset.contrast = high ? 'high' : 'standard';
  root.dataset.motion =
    preferences.motion === 'reduce' || matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'reduce'
      : 'standard';
  root.dataset.textSpacing = String(preferences.textSpacing);
  root.dataset.underlineLinks = String(preferences.underlineLinks);
  root.dataset.strongFocus = String(preferences.strongFocus);
  root.dataset.largeControls = String(preferences.largeControls);
  root.dataset.density = preferences.density;
  root.dataset.largeText = String(preferences.textScale >= 150);
  root.style.setProperty('--text-scale', String(preferences.textScale / 100));
  root.style.setProperty('--app-font', fonts[preferences.font]);
  colorKeys.forEach((key) => root.style.removeProperty(key));
  for (const [key, value] of Object.entries(resolveColors(preferences, dark, high)))
    root.style.setProperty(key, value);
  root.style.colorScheme = dark ? 'dark' : 'light';
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', root.style.getPropertyValue('--bg'));
}
