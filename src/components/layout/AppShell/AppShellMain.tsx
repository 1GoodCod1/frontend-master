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

const PAGE_MOTION = {
  duration: 0.5,
  ease: [0.22, 1, 0.36, 1] as const,
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
  const isJobsPage = pathname === paths.jobs.list || pathname.startsWith(`${paths.jobs.list}/`);
  const isPublicPage =
    isHomePage ||
    isMasterDetailsPage ||
    isMastersListPage ||
    isPlansPage ||
    isOtherPublicPage ||
    isJobsPage;
  const fullWidth = isDashboardOrAdmin || isPublicPage;
  const isAuthPage = AUTH_PATHS.has(pathname);
  const hideFooter = isDashboardOrAdmin;

  return (
    <>
      {!isLoggingOut && (
        <motion.main
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{
            duration: reduceMotion ? 0 : PAGE_MOTION.duration,
            ease: PAGE_MOTION.ease,
          }}
          className={cn(
            'flex min-w-0 flex-col overflow-x-hidden transition-colors',
            isDashboardOrAdmin
              ? 'flex min-h-0 flex-1 flex-col overflow-hidden bg-[hsl(var(--background))] pt-16'
              : cn(
                  'min-h-[calc(100dvh-4rem)]',
                  isPublicPage || isAuthPage
                    ? 'bg-[hsl(var(--background))] dark:bg-[#0a0a0a]'
                    : 'bg-background',
                  fullWidth ? 'pt-16' : isAuthPage ? 'pt-4 md:pt-6 pb-6 md:pb-8' : 'pt-[4.5rem] md:pt-[5.5rem] pb-6 md:pb-8',
                ),
          )}
        >
          {fullWidth ? (
            <div className={cn(isDashboardOrAdmin && 'flex h-full min-h-0 flex-1 flex-col overflow-hidden')}>
              <Outlet />
            </div>
          ) : (
            <div className="container mx-auto min-w-0 max-w-7xl flex-1 px-4 sm:px-6">
              <Outlet />
            </div>
          )}
          {!hideFooter && <Footer />}
        </motion.main>
      )}
    </>
  );
}
