import { useState, useEffect } from 'react';

function readIsDark(): boolean {
  if (typeof document === 'undefined') return false;
  const el = document.documentElement;
  return el.classList.contains('dark') || el.getAttribute('data-theme') === 'dark';
}

/**
 * Returns true when document is in dark mode (`class="dark"` or `data-theme="dark"`).
 */
export function useIsDark(): boolean {
  const [isDark, setIsDark] = useState(readIsDark);

  useEffect(() => {
    const el = document.documentElement;
    const check = () => setIsDark(readIsDark());

    const observer = new MutationObserver(check);
    observer.observe(el, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });
    return () => observer.disconnect();
  }, []);

  return isDark;
}
