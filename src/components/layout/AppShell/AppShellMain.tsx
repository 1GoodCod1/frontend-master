import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useReducedMotionPreference } from '@/hooks/useReducedMotionPreference';
import { OTHER_PUBLIC_PATHS, paths } from '@/constants/routes';
import { cn } from '@/lib/utils';
import { Footer } from '../Footer';

const AUTH_PATHS = new Set([
  paths.login,
  paths.register,
  paths.forgotPassword,
  paths.resetPassword,
]);

type Props = {
  isLoggingOut: boolean;
  isDashboardOrAdmin: boolean;
  isHomePage: boolean;
};

export function AppShellMain({
  isLoggingOut,
  isDashboardOrAdmin,
  isHomePage,
}: Props) {
  const reduceMotion = useReducedMotionPreference();
  const { pathname } = useLocation();
  const masterPrefix = `${paths.masters}/`;
  const isMasterDetailsPage =
    pathname.startsWith(masterPrefix) &&
    !pathname.slice(masterPrefix.length).includes('/');
  const isMastersListPage = pathname === paths.masters;
  const isPlansPage =
    pathname === paths.plans || pathname.startsWith(`${paths.plans}/`);
  const isOtherPublicPage = (OTHER_PUBLIC_PATHS as readonly string[]).includes(
    pathname,
  );
  const isPublicPage =
    isHomePage ||
    isMasterDetailsPage ||
    isMastersListPage ||
    isPlansPage ||
    isOtherPublicPage;
  const fullWidth = isDashboardOrAdmin || isPublicPage;
  const isAuthPage = AUTH_PATHS.has(pathname);

  return (
    <>
      {!isLoggingOut && (
        <motion.main
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
          className={cn(
            'flex min-h-[calc(100dvh-3.5rem)] min-w-0 flex-col overflow-x-hidden transition-colors',
            isPublicPage || isAuthPage ? 'bg-[hsl(var(--background))] dark:bg-[#171510]' : 'bg-background',
            fullWidth ? 'pt-14' : isAuthPage ? 'pt-4 md:pt-6 pb-6 md:pb-8' : 'pt-20 md:pt-24 pb-6 md:pb-8'
          )}
        >
          {fullWidth ? (
            <Outlet />
          ) : (
            <div className="container mx-auto min-w-0 max-w-7xl flex-1 px-4 sm:px-6">
              <Outlet />
            </div>
          )}
          <Footer />
        </motion.main>
      )}
    </>
  );
}
