import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useReducedMotionPreference } from '@/hooks/useReducedMotionPreference';
import { Menu } from 'lucide-react';
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
import { AppShellGuestAuthButtons } from './AppShellHeaderActions';

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
      <div className="relative flex h-16 min-w-0 items-center gap-2 px-4 sm:px-4 md:px-6">
        <RouterLink
          to="/"
          className="relative z-10 flex shrink-0 items-center gap-2 text-foreground no-underline transition-opacity hover:opacity-90"
        >
          <img
            src={colorMode === 'dark' ? '/brand/logo-dark.svg' : '/brand/logo-light.svg'}
            alt={t('appName')}
            className="h-8 w-auto md:h-10 transition-transform hover:scale-[1.02] motion-reduce:hover:scale-100"
          />
        </RouterLink>

        <AppShellNavDesktop
          items={navItems}
          navLinkClass={navLinkClass}
          centered={isNavCentered}
        />

        <div className="relative z-10 ml-auto hidden items-center gap-2 md:flex">
          {isAuthed && role === USER_ROLE.MASTER && <JointsBalanceBadge />}
          {isAuthed && <NotificationMenu />}
          {!isAuthed && <AppShellGuestAuthButtons />}

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

        <div className="relative z-10 ml-auto flex items-center gap-1 md:hidden">
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
