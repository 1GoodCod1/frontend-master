import { useState, useEffect } from 'react';

/**
 * Matches a media query (e.g. min-width). Use for layout breakpoints without MUI.
 * Tailwind md = 768px.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const m = window.matchMedia(query);
    setMatches(m.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    m.addEventListener('change', handler);
    return () => m.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/** True when viewport is >= 768px (Tailwind md). */
export function useIsMdUp(): boolean {
  return useMediaQuery('(min-width: 768px)');
}
