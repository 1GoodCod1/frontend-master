import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  selectIsAuthed,
  selectRole,
  selectRefreshToken,
  selectRestoring,
} from '@/features/auth/selectors';
import { useAuthLogoutMutation, useAuthMeQuery } from '@/features/auth/authApi';
import { toggleColorMode } from '@/features/ui/uiSlice';
import { setLanguage } from '@/i18n';
import type { SupportedLanguage } from './types';
import { cn } from '@/lib/utils';

const SCROLL_THRESHOLD = 150;

function getScrollTop(): number {
  const win =
    typeof window.scrollY === 'number' ? window.scrollY : 0;
  const docEl = document.documentElement.scrollTop ?? 0;
  const body = document.body.scrollTop ?? 0;
  const main = document.querySelector('main');
  const mainScroll =
    main && main.scrollHeight > main.clientHeight ? main.scrollTop : 0;
  return Math.max(win, docEl, body, mainScroll, 0);
}

export function useAppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isAuthed = useAppSelector(selectIsAuthed);
  const role = useAppSelector(selectRole);
  const refreshToken = useAppSelector(selectRefreshToken);
  const restoring = useAppSelector(selectRestoring);
  const [logout] = useAuthLogoutMutation();
  const { isLoading: isLoadingMe } = useAuthMeQuery(undefined, { skip: !isAuthed });

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLoadingNavbar, setShowLoadingNavbar] = useState(false);
  const colorMode = useAppSelector((s) => s.ui.colorMode);

  useEffect(() => {
    if (restoring) {
      setShowLoadingNavbar(true);
      return;
    }
    if (isAuthed && !role && isLoadingMe) {
      const timer = setTimeout(() => setShowLoadingNavbar(true), 100);
      return () => clearTimeout(timer);
    }
    setShowLoadingNavbar(false);
  }, [restoring, isAuthed, role, isLoadingMe]);

  useEffect(() => {
    const updateShow = (scrollValue?: number) => {
      const top = scrollValue ?? getScrollTop();
      setShowScrollTop(top > SCROLL_THRESHOLD);
    };
    const onScroll = (e: Event) => {
      const target = e.target;
      if (target instanceof Element && typeof (target as HTMLElement).scrollTop === 'number') {
        updateShow(Math.max(getScrollTop(), (target as HTMLElement).scrollTop));
      } else {
        updateShow();
      }
    };
    const rafId = { current: 0 };
    const scheduleUpdate = () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => updateShow());
    };
    updateShow();
    const t1 = setTimeout(updateShow, 100);
    const t2 = setTimeout(updateShow, 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    document.documentElement.addEventListener('scroll', onScroll, { passive: true });
    document.body.addEventListener('scroll', onScroll, { passive: true });
    const main = document.querySelector('main');
    main?.addEventListener('scroll', onScroll, { passive: true });
    const interval = setInterval(scheduleUpdate, 400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('scroll', onScroll, true);
      document.documentElement.removeEventListener('scroll', onScroll);
      document.body.removeEventListener('scroll', onScroll);
      main?.removeEventListener('scroll', onScroll);
      clearInterval(interval);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [location.pathname]);

  const isDashboardOrAdmin =
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/client-dashboard') ||
    location.pathname.startsWith('/admin');

  const showNavbar =
    !restoring &&
    !showLoadingNavbar &&
    (!isAuthed || (isAuthed && Boolean(role)));

  const navLinkBaseClass =
    'inline-flex items-center gap-2 text-sm font-medium transition-colors rounded-none px-3 py-2 h-14';

  const navLinkClass = (isActive: boolean) =>
    cn(
      navLinkBaseClass,
      isActive
        ? 'border-t-[3px] border-amber-500 text-amber-600 dark:text-amber-400 dark:border-amber-400'
        : 'border-t-[3px] border-transparent text-foreground hover:bg-accent hover:text-accent-foreground'
    );

  const isNavCentered = isAuthed;

  const closeMobileNav = () => setMobileNavOpen(false);

  const scrollToTop = () => {
    const duration = 600;
    const start = performance.now();
    const startY = getScrollTop();

    const step = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const easeOut = 1 - (1 - t) * (1 - t);
      const y = Math.round(startY * (1 - easeOut));
      window.scrollTo(0, y);
      document.documentElement.scrollTop = y;
      document.body.scrollTop = y;
      const main = document.querySelector('main');
      if (main && main.scrollHeight > main.clientHeight) {
        (main as HTMLElement).scrollTop = y;
      }
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  async function onLogout() {
    setMobileNavOpen(false);
    setIsLoggingOut(true);
    navigate('/', { replace: true });
    try {
      await logout({ refreshToken: refreshToken ?? '' }).unwrap();
    } catch {
      // ignore
    } finally {
      setIsLoggingOut(false);
    }
  }

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setLanguage(lang);
  };

  const handleToggleColorMode = () => {
    dispatch(toggleColorMode());
  };

  return {
    isAuthed,
    role,
    colorMode,
    mobileNavOpen,
    setMobileNavOpen,
    showScrollTop,
    isLoggingOut,
    showNavbar,
    isDashboardOrAdmin,
    location,
    navLinkBaseClass,
    navLinkClass,
    isNavCentered,
    closeMobileNav,
    scrollToTop,
    onLogout,
    handleLanguageChange,
    handleToggleColorMode,
  };
}
