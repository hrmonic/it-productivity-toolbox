export function readPreference(key: string, fallback = '') {
  try {
    return localStorage.getItem(`toolbox.${key}`) ?? fallback;
  } catch {
    return fallback;
  }
}
export function writePreference(key: string, value: string) {
  try {
    localStorage.setItem(`toolbox.${key}`, value);
  } catch {
    /* Preferences are optional; project storage errors are handled separately. */
  }
}
