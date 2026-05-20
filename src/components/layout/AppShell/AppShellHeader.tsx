import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useReducedMotionPreference } from '@/hooks/useReducedMotionPreference';
import { Menu, LogIn, UserPlus } from 'lucide-react';
import { RemoveScroll } from 'react-remove-scroll';
import { NotificationMenu } from '@/components/common/NotificationMenu';
import { JointsBalanceBadge } from '@/components/common/JointsBalanceBadge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { USER_ROLE } from '@/constants/roles';
import { getVisibleNavItems } from './navUtils';
import { AppShellNavDesktop } from './AppShellNavDesktop';
import { AppShellSettingsMenu } from './AppShellSettingsMenu';
import { AppShellAccountMenu } from './AppShellAccountMenu';

type Props = {
  isAuthed: boolean;
  role: string | null;
  colorMode: 'light' | 'dark';
  isInCabinet?: boolean;
  navLinkClass: (isActive: boolean) => string;
  isNavCentered: boolean;
  onLogout: () => void;
  onToggleColorMode: () => void;
  onLanguageChange: (lang: 'en' | 'ru' | 'ro') => void;
  onOpenMobileNav: () => void;
};

export function AppShellHeader({
  isAuthed,
  role,
  colorMode,
  isInCabinet = false,
  navLinkClass,
  isNavCentered,
  onLogout,
  onToggleColorMode,
  onLanguageChange,
  onOpenMobileNav,
}: Props) {
  const reduceMotion = useReducedMotionPreference();
  const { t } = useTranslation();
  const navItems = getVisibleNavItems(isAuthed, role as 'ADMIN' | 'MASTER' | 'CLIENT' | null);

  const headerBg = isInCabinet
    ? 'bg-[hsl(var(--cabinet-header-bg)/0.92)] border-b border-[hsl(var(--border))]'
    : 'bg-background/85';

  return (
    <motion.header
      initial={reduceMotion ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: reduceMotion ? 0 : 0.25 }}
      className={cn(
        'fixed top-0 left-0 right-0 z-40 w-full backdrop-blur-xl',
        headerBg,
        RemoveScroll.classNames.fullWidth,
        'shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.25)]'
      )}
    >
      <div className={cn('flex h-14 min-w-0 items-center gap-2 px-4 sm:px-4 md:px-6', isNavCentered && 'relative')}>
        <RouterLink
          to="/"
          className="flex items-center gap-2 text-foreground no-underline hover:opacity-90 transition-opacity shrink-0"
        >
          <img
            src={colorMode === 'dark' ? '/brand/logo-dark.svg' : '/brand/logo-light.svg'}
            alt={t('appName')}
            className="h-8 w-auto md:h-10 transition-transform hover:scale-[1.02] motion-reduce:hover:scale-100"
          />
        </RouterLink>

        <div className="flex-1" />

        <AppShellNavDesktop
          items={navItems}
          navLinkClass={navLinkClass}
          centered={isNavCentered}
        />

        {/* Divider between nav links and the auth/settings cluster */}
        {!isNavCentered && (
          <div className="hidden md:block h-6 w-px bg-border/70 mx-3" aria-hidden />
        )}

        <div className="hidden md:flex items-center gap-1.5">
          {isAuthed && role === USER_ROLE.MASTER && <JointsBalanceBadge />}
          {isAuthed && <NotificationMenu />}
          {!isAuthed && (
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                className={cn(
                  'h-9 rounded-lg px-3.5 gap-2 text-sm font-medium transition-colors duration-200',
                  'text-slate-600 hover:bg-[#E97525]/10 hover:text-[#E97525]',
                  'dark:text-white/75 dark:hover:bg-[#E97525]/15 dark:hover:text-[#E97525]'
                )}
                asChild
              >
                <RouterLink to="/login">
                  <LogIn className="h-4 w-4 shrink-0" strokeWidth={2} />
                  {t('nav.login')}
                </RouterLink>
              </Button>
              <Button
                className={cn(
                  'h-9 rounded-lg px-4 gap-2 text-sm font-semibold text-white transition duration-200',
                  'bg-[#E97525] hover:bg-[#d9651a]',
                  'shadow-sm shadow-[#E97525]/25 hover:shadow-md hover:shadow-[#E97525]/35',
                  'hover:-translate-y-0.5 motion-reduce:hover:translate-y-0'
                )}
                asChild
              >
                <RouterLink to="/register">
                  <UserPlus className="h-4 w-4 shrink-0" strokeWidth={2} />
                  {t('nav.register')}
                </RouterLink>
              </Button>
            </div>
          )}

          {!isInCabinet && (
            <AppShellSettingsMenu
              colorMode={colorMode}
              onToggleColorMode={onToggleColorMode}
              onLanguageChange={onLanguageChange}
            />
          )}

          {isAuthed && !isInCabinet && (
            <AppShellAccountMenu onLogout={onLogout} />
          )}
        </div>

        <div className="flex md:hidden items-center gap-1">
          {isAuthed && role === USER_ROLE.MASTER && <JointsBalanceBadge />}
          {isAuthed && <NotificationMenu />}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 transition-transform duration-200 hover:scale-110 active:scale-95 motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
            onClick={onOpenMobileNav}
            aria-label={t('nav.settings')}
          >
            <Menu className="h-5 w-5 shrink-0" strokeWidth={2} />
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
