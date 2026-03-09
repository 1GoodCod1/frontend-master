import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls to top when route changes.
 * Fixes the bug where some pages open scrolled to the bottom.
 */
export function ScrollToTopOnNavigate() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTo(0, 0);
    document.querySelectorAll('main').forEach((el) => el.scrollTo(0, 0));
  }, [pathname]);

  return null;
}
