import { useSyncExternalStore } from 'react';

/**
 * Matches a media query (e.g. min-width). Use for layout breakpoints without MUI.
 * Tailwind md = 768px.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener('change', cb);
      return () => m.removeEventListener('change', cb);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

/** True when viewport is >= 768px (Tailwind md). */
export function useIsMdUp(): boolean {
  return useMediaQuery('(min-width: 768px)');
}
