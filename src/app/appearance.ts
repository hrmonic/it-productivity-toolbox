import { z } from 'zod';
import { contrast, readableOn } from '../features/brand-studio/domain';

const hex = z.string().regex(/^#[0-9a-f]{6}$/i);
export const customThemeSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().trim().min(1).max(48),
    mode: z.enum(['light', 'dark']),
    accent: hex,
    background: hex,
    surface: hex,
    text: hex,
  })
  .strict();
export type CustomTheme = z.infer<typeof customThemeSchema>;
export const appearanceSchema = z
  .object({
    version: z.literal(1),
    mode: z.enum(['light', 'dark', 'system']),
    themeId: z.string().max(60),
    themes: z.array(customThemeSchema).max(12),
    textScale: z.number().min(100).max(200).multipleOf(12.5),
    font: z.enum(['system', 'sans', 'serif', 'mono']),
    contrast: z.enum(['system', 'standard', 'high']),
    motion: z.enum(['system', 'reduce']),
    textSpacing: z.boolean(),
    underlineLinks: z.boolean(),
    strongFocus: z.boolean(),
    largeControls: z.boolean(),
    density: z.enum(['comfortable', 'compact']),
  })
  .strict();
export type Appearance = z.infer<typeof appearanceSchema>;
export const defaultAppearance: Appearance = {
  version: 1,
  mode: 'system',
  themeId: 'indigo',
  themes: [],
  textScale: 100,
  font: 'system',
  contrast: 'system',
  motion: 'system',
  textSpacing: false,
  underlineLinks: false,
  strongFocus: false,
  largeControls: false,
  density: 'comfortable',
};
export const palettes = [
  { id: 'indigo', name: 'Indigo', light: '#4f46e5', dark: '#a5b4fc' },
  { id: 'ocean', name: 'Ocean', light: '#0369a1', dark: '#7dd3fc' },
  { id: 'forest', name: 'Forest', light: '#047857', dark: '#6ee7b7' },
  { id: 'rose', name: 'Rose', light: '#be185d', dark: '#f9a8d4' },
  { id: 'amber', name: 'Amber', light: '#92400e', dark: '#fcd34d' },
];
export function themeProblems(theme: CustomTheme) {
  if (
    ![theme.accent, theme.background, theme.surface, theme.text].every((color) =>
      /^#[0-9a-f]{6}$/i.test(color),
    )
  )
    return ['Use six-digit HEX colors.'];
  return contrast(theme.text, theme.background) < 4.5 || contrast(theme.text, theme.surface) < 4.5
    ? ['Choose text with at least 4.5:1 contrast on both backgrounds.']
    : [];
}
export function parseAppearance(raw: unknown): Appearance {
  const result = appearanceSchema.parse(raw);
  if (new Set(result.themes.map((theme) => theme.id)).size !== result.themes.length)
    throw new Error('Theme identifiers must be unique.');
  if (result.themes.some((theme) => themeProblems(theme).length))
    throw new Error('Choose text with at least 4.5:1 contrast on both backgrounds.');
  const custom = result.themes.find((theme) => theme.id === result.themeId);
  if (!custom && !palettes.some((palette) => palette.id === result.themeId))
    throw new Error('The selected theme is missing.');
  if (custom && result.mode !== custom.mode)
    throw new Error('A custom theme must use its saved display mode.');
  return result;
}
export function mixColor(a: string, b: string, amount: number) {
  return (
    '#' +
    [1, 3, 5]
      .map((i) =>
        Math.round(
          parseInt(a.slice(i, i + 2), 16) * (1 - amount) + parseInt(b.slice(i, i + 2), 16) * amount,
        )
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}
function readableAccent(accent: string, text: string, surfaces: string[]) {
  for (let step = 0; step <= 20; step++) {
    const color = mixColor(accent, text, step / 20);
    if (surfaces.every((surface) => contrast(color, surface) >= 4.5)) return color;
  }
  return text;
}
export function resolveColors(preferences: Appearance, dark: boolean, highContrast = false) {
  const custom = preferences.themes.find((theme) => theme.id === preferences.themeId);
  const palette = palettes.find((item) => item.id === preferences.themeId) ?? palettes[0]!;
  const background = highContrast
    ? dark
      ? '#000000'
      : '#ffffff'
    : (custom?.background ?? (dark ? '#111318' : '#f5f7fb'));
  const surface = highContrast ? background : (custom?.surface ?? (dark ? '#191c24' : '#ffffff'));
  const text = highContrast
    ? dark
      ? '#ffffff'
      : '#111111'
    : (custom?.text ?? (dark ? '#e9edf5' : '#1b2436'));
  const softCandidate =
    custom || highContrast
      ? mixColor(surface, text, highContrast ? 0 : 0.035)
      : dark
        ? '#222632'
        : '#f0f3f9';
  const soft = contrast(text, softCandidate) >= 4.5 ? softCandidate : surface;
  const primary = custom?.accent ?? (dark ? palette.dark : palette.light);
  const accent = readableAccent(primary, text, [background, surface, soft]);
  const muted =
    custom || highContrast
      ? readableAccent(mixColor(text, surface, 0.25), text, [background, surface, soft])
      : dark
        ? '#a2adc1'
        : '#58647a';
  const accentSoftCandidate = mixColor(surface, accent, dark ? 0.14 : 0.09);
  const accentSoft = contrast(text, accentSoftCandidate) >= 4.5 ? accentSoftCandidate : surface;
  return {
    '--bg': background,
    '--surface': surface,
    '--surface-soft': soft,
    '--ink': text,
    '--muted': muted,
    '--border': highContrast
      ? text
      : custom
        ? mixColor(surface, text, 0.25)
        : dark
          ? '#313746'
          : '#dfe4ee',
    '--accent': accent,
    '--accent-soft': accentSoft,
    '--primary-bg': primary,
    '--primary-fg': readableOn(primary),
    '--sidebar': custom || highContrast ? surface : dark ? '#14171e' : '#fbfcfe',
    '--sidebar-muted': custom || highContrast ? muted : dark ? '#a2adc1' : '#667188',
    '--nav-active': accentSoft,
    '--nav-ink': readableAccent(accent, text, [accentSoft]),
    ...(highContrast
      ? {
          '--amber-bg': surface,
          '--amber-fg': text,
          '--red-bg': surface,
          '--red-fg': text,
          '--accepted-bg': surface,
          '--accepted-fg': text,
        }
      : {}),
  };
}
export function draftTheme(mode: 'light' | 'dark'): CustomTheme {
  return {
    id: crypto.randomUUID(),
    name: '',
    mode,
    accent: mode === 'dark' ? '#a5b4fc' : '#4f46e5',
    background: mode === 'dark' ? '#111318' : '#f5f7fb',
    surface: mode === 'dark' ? '#191c24' : '#ffffff',
    text: mode === 'dark' ? '#e9edf5' : '#1b2436',
  };
}
