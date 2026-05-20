import { AnimatePresence } from 'framer-motion';
import { TooltipProvider } from '@/components/ui/tooltip';
import { CookieConsentBanner } from '@/components/common/CookieConsentBanner';
import { ScrollToTopOnNavigate } from '@/components/common/ScrollToTopOnNavigate';
import { cn } from '@/lib/utils';
import { useAppShell } from './useAppShell';
import { getVisibleNavItems } from './navUtils';
import { AppShellHeader } from './AppShellHeader';
import { AppShellNavMobile } from './AppShellNavMobile';
import { AppShellMain } from './AppShellMain';
import { ScrollToTopButton } from './ScrollToTopButton';

export function AppShell() {
  const {
    isAuthed,
    role,
    colorMode,
    mobileNavOpen,
    setMobileNavOpen,
    showScrollTop,
    scrollToTop,
    isLoggingOut,
    showNavbar,
    isDashboardOrAdmin,
    location,
    navLinkClass,
    isNavCentered,
    closeMobileNav,
    onLogout,
    handleLanguageChange,
    handleToggleColorMode,
  } = useAppShell();

  const navItems = getVisibleNavItems(isAuthed, role);

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn(isDashboardOrAdmin && 'cabinet-theme-scope flex h-dvh min-h-0 flex-col overflow-hidden')}>
        <ScrollToTopOnNavigate />
        <AnimatePresence mode="wait">
          {showNavbar && (
            <AppShellHeader
              isAuthed={isAuthed}
              role={role}
              colorMode={colorMode}
              isInCabinet={isDashboardOrAdmin}
              navLinkClass={navLinkClass}
              isNavCentered={isNavCentered}
              onLogout={onLogout}
              onToggleColorMode={handleToggleColorMode}
              onLanguageChange={handleLanguageChange}
              onOpenMobileNav={() => setMobileNavOpen(true)}
            />
          )}
        </AnimatePresence>

        <AppShellNavMobile
          open={mobileNavOpen}
          onOpenChange={setMobileNavOpen}
          items={navItems}
          isAuthed={isAuthed}
          colorMode={colorMode}
          onClose={closeMobileNav}
          onLogout={onLogout}
          onToggleColorMode={handleToggleColorMode}
          onLanguageChange={handleLanguageChange}
        />

        <AnimatePresence>
          <AppShellMain
            isLoggingOut={isLoggingOut}
            isDashboardOrAdmin={isDashboardOrAdmin}
            isHomePage={location.pathname === '/'}
          />
        </AnimatePresence>

        <AnimatePresence>
          {showScrollTop && <ScrollToTopButton onClick={scrollToTop} />}
        </AnimatePresence>

        <CookieConsentBanner />
      </div>
    </TooltipProvider>
  );
}
