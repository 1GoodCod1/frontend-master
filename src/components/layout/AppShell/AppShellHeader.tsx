import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useReducedMotionPreference } from '@/hooks/useReducedMotionPreference';
import { Menu, LogIn, UserPlus } from 'lucide-react';
import { RemoveScroll } from 'react-remove-scroll';
import { NotificationMenu } from '@/components/common/NotificationMenu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getVisibleNavItems } from './navUtils';
import { AppShellNavDesktop } from './AppShellNavDesktop';
import { AppShellSettingsMenu } from './AppShellSettingsMenu';
import { AppShellAccountMenu } from './AppShellAccountMenu';

type Props = {
  isAuthed: boolean;
  role: string | null;
  colorMode: 'light' | 'dark';
  isInCabinet?: boolean;
  navLinkBaseClass: string;
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
  navLinkBaseClass,
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

  const headerBg =
    isInCabinet && colorMode === 'dark'
      ? 'bg-[#171510]/85'
      : isInCabinet && colorMode === 'light'
        ? 'bg-white/85'
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

        <div className="hidden md:flex items-center gap-1">
          {isAuthed && <NotificationMenu />}
          {!isAuthed && (
            <>
              <Button
                variant="ghost"
                className={cn(
                  navLinkBaseClass,
                  'border-t-[3px] border-transparent text-foreground hover:bg-accent hover:text-accent-foreground transition duration-200',
                  'dark:text-primary dark:hover:text-primary/80 dark:font-semibold'
                )}
                asChild
              >
                <RouterLink to="/login" className="transition-colors duration-200">
                  <LogIn className="shrink-0" strokeWidth={2} />
                  {t('nav.login')}
                </RouterLink>
              </Button>
              <Button
                className="rounded-xl hover:shadow-xl hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 transition duration-200 gap-2"
                asChild
              >
                <RouterLink to="/register" className="transition-colors duration-200">
                  <UserPlus className="shrink-0" strokeWidth={2} />
                  {t('nav.register')}
                </RouterLink>
              </Button>
            </>
          )}

          <AppShellSettingsMenu
            colorMode={colorMode}
            onToggleColorMode={onToggleColorMode}
            onLanguageChange={onLanguageChange}
          />

          {isAuthed && (
            <AppShellAccountMenu onLogout={onLogout} />
          )}
        </div>

        <div className="flex md:hidden items-center gap-1">
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
