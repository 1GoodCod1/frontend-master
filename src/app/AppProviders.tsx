import { useEffect, useRef } from 'react';
import { useAppSelector } from '@/app/hooks';
import type { RootState } from '@/app/store';

/**
 * Temporarily kills CSS transitions so a theme switch applies instantly
 * (otherwise elements with `transition: color` animate at different speeds
 * and the text appears to flicker). Mirrors next-themes' disableTransitionOnChange.
 */
function withoutTransitions(apply: () => void): void {
  const style = document.createElement('style');
  style.appendChild(
    document.createTextNode('*,*::before,*::after{transition:none!important}'),
  );
  document.head.appendChild(style);

  apply();

  // Force a reflow so the theme change is committed without transitions...
  void window.getComputedStyle(document.body).opacity;
  // ...then restore transitions on the next tick.
  window.setTimeout(() => {
    document.head.removeChild(style);
  }, 1);
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const mode = useAppSelector((s: RootState) => s.ui.colorMode);
  const isFirstRun = useRef(true);

  useEffect(() => {
    const applyTheme = () => {
      document.documentElement.setAttribute('data-theme', mode);
      document.documentElement.classList.toggle('dark', mode === 'dark');
    };

    // First run = initial mount, nothing to animate — apply directly.
    if (isFirstRun.current) {
      isFirstRun.current = false;
      applyTheme();
      return;
    }

    withoutTransitions(applyTheme);
  }, [mode]);

  return <>{children}</>;
}
