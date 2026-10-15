import { useSyncExternalStore } from 'react';

const query = '(prefers-color-scheme: dark)';
const subscribe = (listener: () => void) => {
  const media = matchMedia(query);
  media.addEventListener('change', listener);
  return () => media.removeEventListener('change', listener);
};
export function useSystemTheme() {
  return useSyncExternalStore(
    subscribe,
    () => matchMedia(query).matches,
    () => false,
  );
}
