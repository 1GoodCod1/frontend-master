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
import { useUsersSetPreferredLanguageMutation } from '@/features/users/usersApi';
import { toggleColorMode } from '@/features/ui/uiSlice';
import { setLanguage } from '@/i18n';
import type { SupportedLanguage } from './types';
import { cn } from '@/lib/utils';

const SCROLL_THRESHOLD = 150;

function getScrollTop(): number {
  const winScroll = window.scrollY || document.documentElement.scrollTop || 0;
  const main = document.querySelector<HTMLElement>('main');
  const mainScroll = main && main.scrollHeight > main.clientHeight ? main.scrollTop : 0;
  return Math.max(winScroll, mainScroll, 0);
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
  const [setPreferredLanguage] = useUsersSetPreferredLanguageMutation();
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
    const isScrollLocked = () => document.body.hasAttribute('data-scroll-locked');
    const updateShow = () => {
      if (isScrollLocked()) return;
      setShowScrollTop(getScrollTop() > SCROLL_THRESHOLD);
    };
    const main = document.querySelector<HTMLElement>('main');

    updateShow();
    window.addEventListener('scroll', updateShow, { passive: true });
    main?.addEventListener('scroll', updateShow, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateShow);
      main?.removeEventListener('scroll', updateShow);
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
    'inline-flex items-center gap-2 text-sm font-medium rounded-none px-3 py-2 h-14 transition-all duration-200';

  const navLinkClass = (isActive: boolean) =>
    cn(
      navLinkBaseClass,
      isActive
        ? 'border-t-[3px] border-primary text-primary dark:border-primary'
        : 'border-t-[3px] border-transparent text-foreground hover:bg-accent hover:text-accent-foreground hover:font-semibold'
    );

  const isNavCentered = isAuthed;

  const closeMobileNav = () => setMobileNavOpen(false);

  const scrollToTop = () => {
    const main = document.querySelector<HTMLElement>('main');
    const isMainScrollable = !!main && main.scrollHeight > main.clientHeight && main.scrollTop > 0;

    if (isMainScrollable) {
      main.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
    if (isAuthed) {
      setPreferredLanguage({ lang }).catch(() => {
        // ignore — email language sync is best-effort
      });
    }
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
