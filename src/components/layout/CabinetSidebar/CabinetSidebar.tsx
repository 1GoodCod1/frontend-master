import { motion, AnimatePresence } from 'framer-motion';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Rocket, X } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { selectMe, selectRole } from '@/features/auth/selectors';
import { selectPlan } from '@/features/auth/selectors';
import { useMastersMyProfileQuery } from '@/features/masters/mastersApi';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mediaUrl } from '@/utils/media';
import { cn } from '@/lib/utils';

export interface CabinetNavItem {
  key: string;
  label: string;
  to: string;
  icon: React.ReactNode;
  badge?: number;
}

interface CabinetSidebarProps {
  sectionLabel: string;
  items: CabinetNavItem[];
  showPremiumBanner?: boolean;
  collapsed: boolean;
  onToggle: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function CabinetSidebar({
  sectionLabel,
  items,
  showPremiumBanner = false,
  collapsed,
  onToggle,
  isMobileOpen = false,
  onMobileClose,
}: CabinetSidebarProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const me = useAppSelector(selectMe);
  const plan = useAppSelector(selectPlan);
  const role = useAppSelector(selectRole);
  const { data: masterProfile } = useMastersMyProfileQuery(undefined, { skip: role !== 'MASTER' });

  const meData = me as { firstName?: string; lastName?: string; email?: string; avatarFile?: { path?: string } } | null;
  const profileData = (masterProfile as { data?: { isOnline?: boolean; user?: { firstName?: string; lastName?: string }; avatarFile?: { path?: string } } } | undefined)?.data ?? (masterProfile as { isOnline?: boolean; user?: { firstName?: string; lastName?: string }; avatarFile?: { path?: string } } | undefined);
  const isOnline = profileData?.isOnline ?? false;

  const avatarPath = (profileData as { avatarFile?: { path?: string } } | undefined)?.avatarFile?.path ?? meData?.avatarFile?.path;
  const avatarUrl = avatarPath ? mediaUrl(avatarPath) : undefined;

  const masterUser = profileData?.user;
  const fullNameFromMaster = masterUser?.firstName || masterUser?.lastName
    ? `${masterUser?.firstName ?? ''} ${masterUser?.lastName ?? ''}`.trim()
    : '';
  const fullNameFromMe = meData?.firstName || meData?.lastName
    ? `${meData?.firstName ?? ''} ${meData?.lastName ?? ''}`.trim()
    : '';
  const displayName = fullNameFromMaster || fullNameFromMe || '';
  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .map((s) => s[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || meData?.email?.slice(0, 2)?.toUpperCase() || 'U';

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {isMobileOpen && (
        <button
          onClick={onMobileClose}
          className="absolute top-3 right-3 md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-[#2c2a24] transition-all"
        >
          <X size={16} />
        </button>
      )}

      {/* User Profile Header */}
      <div className="p-4 border-b border-slate-100 dark:border-[#2c2a24]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <Avatar className="w-10 h-10 rounded-xl shadow-lg shadow-violet-500/25">
              <AvatarImage src={avatarUrl} alt="" className="object-cover" />
              <AvatarFallback className="rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 text-white text-sm font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {role === 'MASTER' && (
              <div
                className={cn(
                  'absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#1e1c17]',
                  isOnline ? 'bg-emerald-400' : 'bg-slate-400'
                )}
              />
            )}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="min-w-0 flex-1 overflow-hidden"
              >
                <p
                  className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 break-words"
                  title={displayName || undefined}
                >
                  {displayName || '—'}
                </p>
                {role === 'MASTER' && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={cn(
                        'w-1.5 h-1.5 rounded-full inline-block',
                        isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                      )}
                    />
                    <span
                      className={cn(
                        'text-xs',
                        isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
                      )}
                    >
                      {isOnline ? t('master.status.online') : t('master.status.offline')}
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Premium Banner */}
      <AnimatePresence>
        {!collapsed && showPremiumBanner && plan === 'PREMIUM' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mx-3 mt-3 overflow-hidden"
          >
            <div className="relative rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 p-3 overflow-hidden">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 80% 50%, white 0%, transparent 60%)',
                }}
              />
              <div className="relative flex items-center gap-2">
                <Rocket size={16} className="text-white shrink-0" />
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
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5 mt-1">
        <AnimatePresence>
          {!collapsed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-3 pt-1 pb-2 text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest"
            >
              {sectionLabel}
            </motion.p>
          )}
        </AnimatePresence>

        {items.map((item) => {
          const exactMatch = location.pathname === item.to;
          const nestedMatch =
            item.to !== '/dashboard' &&
            item.to !== '/client-dashboard' &&
            item.to !== '/admin' &&
            location.pathname.startsWith(item.to + '/');
          const selected = exactMatch || nestedMatch;

          const navButton = (
            <div
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 relative group',
                selected
                  ? 'bg-violet-50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#2c2a24] hover:text-slate-900 dark:hover:text-slate-100',
                collapsed ? 'justify-center' : ''
              )}
            >
              {selected && (
                <motion.div
                  layoutId="cabinetActiveIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-violet-600 rounded-r-full"
                />
              )}
              <span
                className={cn(
                  'shrink-0 transition-colors flex items-center justify-center',
                  selected ? 'text-violet-600 dark:text-violet-400' : ''
                )}
              >
                {item.icon}
              </span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex-1 text-left truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!collapsed && item.badge !== undefined && item.badge > 0 && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 min-w-[18px] text-center',
                    selected
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-200 dark:bg-[#2c2a24] text-slate-600 dark:text-slate-400'
                  )}
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
              {collapsed && item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full border border-white dark:border-[#1e1c17]" />
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
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="relative hidden md:flex shrink-0">
        <motion.aside
          animate={{ width: collapsed ? 72 : 256 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col h-full bg-white dark:bg-[#1e1c17] border-r border-slate-200 dark:border-[#2c2a24] overflow-hidden transition-colors duration-300"
        >
          {sidebarContent}
        </motion.aside>
        <motion.button
          onClick={onToggle}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="absolute -right-3.5 top-8 z-30 w-7 h-7 bg-white dark:bg-[#2c2a24] border border-slate-200 dark:border-[#3a3730] rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all"
        >
          {collapsed ? (
            <ChevronRight size={12} className="text-slate-500 dark:text-slate-400" />
          ) : (
            <ChevronLeft size={12} className="text-slate-500 dark:text-slate-400" />
          )}
        </motion.button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="fixed top-0 left-0 h-full w-72 bg-white dark:bg-[#1e1c17] z-50 md:hidden overflow-hidden"
            >
              <div className="relative h-full">{sidebarContent}</div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
