import { useState, useEffect } from 'react';

/**
 * Returns true when document has class "dark" (shadcn/dark mode).
 * Subscribes to class changes on document.documentElement.
 */
export function useIsDark(): boolean {
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  );

  useEffect(() => {
    const el = document.documentElement;
    const check = () => setIsDark(el.classList.contains('dark'));

    const observer = new MutationObserver(check);
    observer.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}
