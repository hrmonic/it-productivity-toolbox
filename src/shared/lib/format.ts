import { getLanguage, t } from '../i18n';

export const humanDate = (value: string) =>
  new Intl.DateTimeFormat(getLanguage() === 'fr' ? 'fr-FR' : 'en-GB', {
    dateStyle: 'medium',
  }).format(new Date(value));
export const label = (value: string, context?: string) =>
  t(
    value
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replaceAll('-', ' ')
      .replace(/^./, (c) => c.toUpperCase()),
    {},
    context,
  );
