import { useSyncExternalStore } from 'react';
import french from './fr.json';

export type Language = 'en' | 'fr';
let language: Language = 'en';
try {
  if (localStorage.getItem('toolbox.language') === 'fr') language = 'fr';
} catch {
  /* Preferences are optional. */
}
const listeners = new Set<() => void>();
const templates = Object.entries(french)
  .filter(([key]) => /\{\w+\}/.test(key))
  .map(([key, value]) => {
    const names: string[] = [];
    const source = key
      .split(/(\{\w+\})/)
      .map((part) => {
        if (/^\{\w+\}$/.test(part)) {
          names.push(part.slice(1, -1));
          return '([\\s\\S]*?)';
        }
        return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      })
      .join('');
    return { pattern: new RegExp(`^${source}$`), names, value };
  });
export function getLanguage() {
  return language;
}
export function setLanguage(next: Language) {
  language = next;
  document.documentElement.lang = next;
  try {
    localStorage.setItem('toolbox.language', next);
  } catch {
    /* Keep the in-memory preference. */
  }
  listeners.forEach((listener) => listener());
}
export function useLanguage() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getLanguage,
    () => 'en' as const,
  );
}
export function translate(
  message: string,
  locale: Language,
  values: Record<string, string | number> = {},
  context?: string,
): string {
  const dictionary = french as Record<string, string>;
  let result =
    locale === 'fr'
      ? (dictionary[context ? `${context}::${message}` : message] ?? dictionary[message] ?? message)
      : message;
  if (locale === 'fr' && result === message) {
    for (const template of templates) {
      const match = message.match(template.pattern);
      if (match) {
        result = template.value;
        template.names.forEach((name, i) => {
          result = result.replaceAll(`{${name}}`, match[i + 1] ?? '');
        });
        break;
      }
    }
  }
  return result.replace(/\{(\w+)\}/g, (original, key: string) => String(values[key] ?? original));
}
export const t = (message: string, values?: Record<string, string | number>, context?: string) =>
  translate(message, language, values, context);
