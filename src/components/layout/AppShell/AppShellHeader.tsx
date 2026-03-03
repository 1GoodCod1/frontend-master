import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Menu, LogIn, UserPlus } from 'lucide-react';
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
  navLinkBaseClass,
  navLinkClass,
  isNavCentered,
  onLogout,
  onToggleColorMode,
  onLanguageChange,
  onOpenMobileNav,
}: Props) {
  const { t } = useTranslation();
  const navItems = getVisibleNavItems(isAuthed, role as 'ADMIN' | 'MASTER' | 'CLIENT' | null);

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'fixed top-0 left-0 right-0 z-40 w-full bg-background/85 backdrop-blur-xl',
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
            className="h-8 w-auto md:h-10 transition-transform hover:scale-[1.02]"
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
                  'border-t-[3px] border-transparent text-foreground hover:bg-accent hover:text-accent-foreground',
                  'dark:text-amber-400 dark:hover:text-amber-300 dark:font-semibold'
                )}
                asChild
              >
                <RouterLink to="/login">
                  <LogIn className="shrink-0" strokeWidth={2} />
                  {t('nav.login')}
                </RouterLink>
              </Button>
              <Button
                className="rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all gap-2 bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-400 dark:text-amber-950 dark:hover:bg-amber-300 dark:shadow-[0_0_20px_rgba(251,191,36,0.25)]"
                asChild
              >
                <RouterLink to="/register">
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
            className="h-10 w-10"
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
