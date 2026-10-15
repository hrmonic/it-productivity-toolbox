import { describe, expect, it } from 'vitest';
import { contrast } from '../features/brand-studio/domain';
import {
  appearanceSchema,
  defaultAppearance,
  draftTheme,
  palettes,
  parseAppearance,
  resolveColors,
} from './appearance';

describe('safe, portable workspace preferences', () => {
  it('accepts a complete preference round trip without project fields', () => {
    const theme = { ...draftTheme('dark'), name: 'Evening workspace' };
    const preferences = {
      ...defaultAppearance,
      mode: 'dark',
      themes: [theme],
      themeId: theme.id,
      textScale: 200,
    };
    expect(parseAppearance(JSON.parse(JSON.stringify(preferences)))).toEqual(preferences);
    expect(() => parseAppearance({ ...preferences, projects: [] })).toThrow();
  });
  it('rejects broken references, duplicate IDs and incompatible display modes', () => {
    const theme = { ...draftTheme('light'), name: 'My theme' };
    expect(() => parseAppearance({ ...defaultAppearance, themeId: 'missing' })).toThrow();
    expect(() => parseAppearance({ ...defaultAppearance, themes: [theme, theme] })).toThrow();
    expect(() =>
      parseAppearance({ ...defaultAppearance, themes: [theme], themeId: theme.id, mode: 'dark' }),
    ).toThrow();
  });
  it('rejects CSS injection, unreadable themes and out-of-range scale', () => {
    const theme = { ...draftTheme('light'), name: 'My theme' };
    for (const patch of [
      { accent: 'url(https://example.com)' },
      { text: '#ffffff', surface: '#ffffff' },
    ])
      expect(() =>
        parseAppearance({ ...defaultAppearance, themes: [{ ...theme, ...patch }] }),
      ).toThrow();
    expect(appearanceSchema.safeParse({ ...defaultAppearance, textScale: 250 }).success).toBe(
      false,
    );
    expect(appearanceSchema.safeParse({ ...defaultAppearance, textScale: 101 }).success).toBe(
      false,
    );
  });
  it('keeps built-in palette links and buttons readable in both modes', () => {
    for (const palette of palettes)
      for (const dark of [false, true]) {
        const colors = resolveColors({ ...defaultAppearance, themeId: palette.id }, dark);
        for (const background of ['--bg', '--surface', '--surface-soft'] as const)
          expect(contrast(colors['--accent'], colors[background])).toBeGreaterThanOrEqual(4.5);
        expect(contrast(colors['--primary-bg'], colors['--primary-fg'])).toBeGreaterThanOrEqual(
          4.5,
        );
        expect(contrast(colors['--nav-ink'], colors['--nav-active'])).toBeGreaterThanOrEqual(4.5);
      }
  });
  it('corrects a pale custom accent without changing the chosen button color', () => {
    const theme = {
      ...draftTheme('light'),
      name: 'Warm paper',
      accent: '#fff9e0',
      background: '#fff9ef',
      surface: '#ffffff',
      text: '#242020',
    };
    const preferences = parseAppearance({
      ...defaultAppearance,
      themes: [theme],
      themeId: theme.id,
      mode: 'light',
    });
    const colors = resolveColors(preferences, false);
    expect(colors['--primary-bg']).toBe('#fff9e0');
    expect(contrast(colors['--accent'], colors['--surface'])).toBeGreaterThanOrEqual(4.5);
    expect(contrast(colors['--muted'], colors['--bg'])).toBeGreaterThanOrEqual(4.5);
    expect(contrast(colors['--primary-bg'], colors['--primary-fg'])).toBeGreaterThanOrEqual(4.5);
  });
  it('overrides custom surfaces in high contrast while preserving readable text', () => {
    const theme = { ...draftTheme('light'), name: 'My theme' };
    const colors = resolveColors(
      { ...defaultAppearance, themes: [theme], themeId: theme.id },
      false,
      true,
    );
    expect(colors['--bg']).toBe('#ffffff');
    expect(contrast(colors['--ink'], colors['--surface'])).toBeGreaterThan(18);
    expect(colors['--border']).toBe(colors['--ink']);
  });
  it('keeps derived surfaces readable when custom text is near the contrast threshold', () => {
    const theme = {
      ...draftTheme('light'),
      name: 'Threshold',
      background: '#ffffff',
      surface: '#ffffff',
      text: '#767676',
    };
    const colors = resolveColors(
      { ...defaultAppearance, themes: [theme], themeId: theme.id },
      false,
    );
    expect(contrast(colors['--ink'], colors['--surface-soft'])).toBeGreaterThanOrEqual(4.5);
    expect(contrast(colors['--nav-ink'], colors['--nav-active'])).toBeGreaterThanOrEqual(4.5);
  });
});
