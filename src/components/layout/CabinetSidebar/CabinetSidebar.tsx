import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotionPreference } from '@/hooks/useReducedMotionPreference';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Rocket, X } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { selectMe, selectPlan, selectRole } from '@/features/auth/selectors';
import { useMastersMyProfileQuery } from '@/features/masters/mastersApi';
import { CabinetProfileMenu } from '@/components/layout/CabinetSidebar/CabinetProfileMenu';
import { CABINET_COLUMN_HEIGHT } from '@/components/layout/CabinetContentShell';
import { mediaUrl } from '@/utils/media';
import { cn } from '@/lib/utils';

export interface CabinetNavItem {
  key: string;
  label: string;
  to: string;
  icon: React.ReactNode;
  badge?: number;
}

export interface CabinetNavSection {
  key: string;
  label: string;
  items: CabinetNavItem[];
}

interface CabinetSidebarProps {
  sections: CabinetNavSection[];
  showPremiumBanner?: boolean;
  collapsed: boolean;
  onToggle: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function CabinetSidebar({
  sections,
  showPremiumBanner = false,
  collapsed,
  onToggle,
  isMobileOpen = false,
  onMobileClose,
}: CabinetSidebarProps) {
  const reduceMotion = useReducedMotionPreference();
  const location = useLocation();
  const me = useAppSelector(selectMe);
  const plan = useAppSelector(selectPlan);
  const role = useAppSelector(selectRole);
  const { data: masterProfile } = useMastersMyProfileQuery(undefined, { skip: role !== 'MASTER' });

  const meData = me as {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    avatarFile?: { path?: string };
  } | null;
  const profileData =
    (masterProfile as { data?: { isOnline?: boolean; user?: { firstName?: string; lastName?: string; avatarFile?: { path?: string } }; avatarFile?: { path?: string } } } | undefined)
      ?.data ??
    (masterProfile as {
      isOnline?: boolean;
      user?: { firstName?: string; lastName?: string; avatarFile?: { path?: string } };
      avatarFile?: { path?: string };
    } | undefined);
  const isOnline = profileData?.isOnline ?? false;

  const avatarPath =
    meData?.avatarFile?.path ??
    profileData?.avatarFile?.path ??
    profileData?.user?.avatarFile?.path;
  const avatarUrl = avatarPath ? mediaUrl(avatarPath) : undefined;

  const masterUser = profileData?.user;
  const fullNameFromMaster = masterUser?.firstName || masterUser?.lastName
    ? `${masterUser?.firstName ?? ''} ${masterUser?.lastName ?? ''}`.trim()
    : '';
  const fullNameFromMe = meData?.firstName || meData?.lastName
    ? `${meData?.firstName ?? ''} ${meData?.lastName ?? ''}`.trim()
    : '';
  const displayName = fullNameFromMaster || fullNameFromMe || '';

  const allItems = sections.flatMap((section) => section.items);

  const sidebarContent = (
    <div className="grid h-full min-h-0 grid-rows-[1fr_auto]">
      <div className="min-h-0 overflow-y-auto overscroll-y-contain">
        {isMobileOpen && (
          <button
            onClick={onMobileClose}
            className="absolute top-3 right-3 z-10 md:hidden flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted"
          >
            <X size={16} />
          </button>
        )}

        {/* Premium Banner */}
        <AnimatePresence>
          {!collapsed && showPremiumBanner && plan === 'PREMIUM' && (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
              className="mx-3 mt-3 shrink-0 overflow-hidden"
            >
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-600 p-3">
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 80% 50%, white 0%, transparent 60%)',
                  }}
                />
                <div className="relative flex items-center gap-2">
                  <Rocket size={16} className="shrink-0 text-white" />
                  <div>
                    <p className="text-xs font-bold text-white">PREMIUM ACTIV</p>
                    <p className="text-[10px] text-white/80">Acces complet</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <nav className="mt-2 px-2.5 py-3">
        {sections.map((section, sectionIndex) => (
          <div key={section.key} className={cn(sectionIndex > 0 && 'mt-4')}>
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.15 }}
                  className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#9C958C] dark:text-white/30"
                >
                  {section.label}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              {section.items.map((item) => {
                const exactMatch = location.pathname === item.to;
                const anyExactMatch = allItems.some((i) => i.to === location.pathname);
                const nestedMatch =
                  !anyExactMatch &&
                  item.to !== '/dashboard' &&
                  item.to !== '/client-dashboard' &&
                  item.to !== '/admin' &&
                  location.pathname.startsWith(item.to + '/');
                const selected = exactMatch || nestedMatch;

                const navButton = (
                  <div
                    className={cn(
                      'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-all duration-200',
                      '[&_svg]:size-[1.125rem] [&_svg]:shrink-0 [&_svg]:stroke-[1.75]',
                      selected
                        ? 'bg-[#FFF7ED] font-semibold text-[#D97706] dark:bg-[#E97525]/12 dark:text-[#E97525]'
                        : 'font-medium text-[#475569] hover:bg-[#F4F6F8] hover:text-[#334155] dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-slate-200',
                      collapsed && 'justify-center px-2.5',
                    )}
                  >
                    <span
                      className={cn(
                        'flex shrink-0 items-center justify-center transition-colors',
                        selected
                          ? 'text-[#E97525]'
                          : 'text-[#64748b] group-hover:text-[#475569] dark:text-slate-400 dark:group-hover:text-slate-300',
                      )}
                    >
                      {item.icon}
                    </span>
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={reduceMotion ? false : { opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: reduceMotion ? 0 : 0.15 }}
                          className="flex-1 truncate text-left leading-snug"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {!collapsed && item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={cn(
                          'min-w-[1.125rem] shrink-0 rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold',
                          selected
                            ? 'bg-[#E97525] text-white'
                            : 'bg-[#EEF1F4] text-[#64748b] dark:bg-white/10 dark:text-slate-400',
                        )}
                      >
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                    {collapsed && item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute right-1.5 top-1.5 size-2 rounded-full border border-[#FAF9F6] bg-[#E97525] dark:border-[hsl(var(--cabinet-sidebar-bg))]" />
                    )}
                  </div>
                );

                return (
                  <RouterLink
                    key={item.to}
                    to={item.to}
                    onClick={onMobileClose}
                  >
                    {navButton}
                  </RouterLink>
                );
              })}
            </div>
          </div>
        ))}
        </nav>
      </div>

      <CabinetProfileMenu
        collapsed={collapsed}
        displayName={displayName}
        avatarUrl={avatarUrl}
        avatarPath={avatarPath}
        userId={meData?.id}
        role={role}
        plan={plan}
        isOnline={isOnline}
        onMobileClose={onMobileClose}
      />
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="relative hidden min-h-0 shrink-0 md:block">
        <motion.aside
          animate={{ width: collapsed ? 72 : 256 }}
          transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.4, 0, 0.2, 1] }}
          className={cn(
            CABINET_COLUMN_HEIGHT,
            'flex min-h-0 flex-col overflow-hidden border-r border-[#E8E4DE] bg-[#FAF9F6] transition-colors duration-300 dark:border-[hsl(var(--cabinet-sidebar-border))] dark:bg-[hsl(var(--cabinet-sidebar-bg))]',
          )}
        >
          {sidebarContent}
        </motion.aside>
        <motion.button
          onClick={onToggle}
          whileHover={reduceMotion ? undefined : { scale: 1.05 }}
          whileTap={reduceMotion ? undefined : { scale: 0.95 }}
          className="absolute -right-3.5 top-8 z-30 flex size-7 items-center justify-center rounded-full border border-[#E8E4DE] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.08)] transition hover:shadow-md dark:border-[hsl(var(--cabinet-sidebar-border))] dark:bg-[hsl(var(--cabinet-sidebar-bg))]"
        >
          {collapsed ? (
            <ChevronRight size={12} className="text-[#64748b] dark:text-slate-400" />
          ) : (
            <ChevronLeft size={12} className="text-[#64748b] dark:text-slate-400" />
          )}
        </motion.button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
              onClick={onMobileClose}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.aside
              initial={reduceMotion ? false : { x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: reduceMotion ? 0 : 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="fixed top-0 left-0 z-50 flex h-full w-72 min-h-0 flex-col overflow-hidden border-r border-[#E8E4DE] bg-[#FAF9F6] dark:border-[hsl(var(--cabinet-sidebar-border))] dark:bg-[hsl(var(--cabinet-sidebar-bg))] md:hidden"
            >
              <div className="relative h-full min-h-0">{sidebarContent}</div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
