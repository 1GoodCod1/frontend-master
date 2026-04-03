import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Маркирует основную прокручиваемую колонку кабинета (см. ScrollToTopOnNavigate). */
export const APP_SCROLL_REGION = 'data-app-scroll-region';

function scrollViewportToTop() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  const root = document.getElementById('root');
  if (root) root.scrollTop = 0;

  document.querySelectorAll('main').forEach((el) => {
    (el as HTMLElement).scrollTop = 0;
  });
  document.querySelectorAll(`[${APP_SCROLL_REGION}]`).forEach((el) => {
    (el as HTMLElement).scrollTop = 0;
  });
}

/**
 * При смене маршрута поднимает скролл вверх (window + все main + кабинетные области).
 * useLayoutEffect + повтор после кадра — чтобы успел смонтироваться вложенный layout с overflow-y-auto.
 */
export function ScrollToTopOnNavigate() {
  const location = useLocation();
  const trigger = `${location.pathname}${location.search}`;

  useLayoutEffect(() => {
    scrollViewportToTop();
    const t = window.setTimeout(scrollViewportToTop, 0);
    let rafOuter = 0;
    let rafInner = 0;
    rafOuter = requestAnimationFrame(() => {
      rafInner = requestAnimationFrame(scrollViewportToTop);
    });
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(rafOuter);
      cancelAnimationFrame(rafInner);
    };
    // pathname + search: без hash — смена только якоря не сбрасывает скролл
  }, [trigger]);

  return null;
}
