import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Footer } from '../Footer';

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
  const fullWidth = isDashboardOrAdmin || isHomePage;

  return (
    <>
      {!isLoggingOut && (
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'flex min-h-[calc(100vh-3.5rem)] min-w-0 flex-col overflow-x-hidden bg-background transition-colors',
            !fullWidth && 'py-6 md:py-8'
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
