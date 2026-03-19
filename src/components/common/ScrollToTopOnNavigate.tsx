import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls to top when route changes.
 * Fixes the bug where some pages open scrolled to the bottom.
 */
export function ScrollToTopOnNavigate() {
  const { pathname } = useLocation();

  useEffect(() => {
    // requestAnimationFrame avoids forced reflow by deferring scroll
    // until after the browser has finished layout/paint for the new route
    const raf = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTo(0, 0);
      document.querySelectorAll('main').forEach((el) => el.scrollTo(0, 0));
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
}
