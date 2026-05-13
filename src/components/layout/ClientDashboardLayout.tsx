import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Heart,
  Mail,
  AlertTriangle,
  Shield,
  Menu,
  User,
  MessageCircle,
  Gift,
  Calendar,
  Briefcase,
} from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { selectRole, selectIsVerified } from '@/features/auth/selectors';
import { useGetUnreadCountQuery } from '@/features/chat/chatApi';
import { useConfigReferralsEnabledQuery } from '@/features/referrals/referralsApi';
import { useIsMdUp } from '@/hooks/useMediaQuery';
import { AppBreadcrumbs } from '@/components/common/AppBreadcrumbs';
import { VerificationRequiredBanner } from '@/components/common/VerificationRequiredBanner';
import { CabinetSidebar, type CabinetNavItem } from '@/components/layout/CabinetSidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { USER_ROLE } from '@/constants/roles';

function getItems(t: ReturnType<typeof useTranslation>['t']): CabinetNavItem[] {
  return [
    { key: 'overview', label: t('clientDashboard.overview'), to: '/client-dashboard', icon: <LayoutDashboard className="size-5" /> },
    { key: 'bookings', label: t('clientDashboard.myBookings'), to: '/client-dashboard/bookings', icon: <Calendar className="size-5" /> },
    { key: 'leads', label: t('clientDashboard.myLeads'), to: '/client-dashboard/leads', icon: <Mail className="size-5" /> },
    { key: 'chat', label: t('clientDashboard.chat', 'Чаты'), to: '/client-dashboard/chat', icon: <MessageCircle className="size-5" /> },
    { key: 'favorites', label: t('clientDashboard.favorites'), to: '/client-dashboard/favorites', icon: <Heart className="size-5" /> },
    { key: 'reports', label: t('clientDashboard.reports'), to: '/client-dashboard/reports', icon: <AlertTriangle className="size-5" /> },
    { key: 'profile', label: t('clientDashboard.profile'), to: '/client-dashboard/profile', icon: <User className="size-5" /> },
    { key: 'security', label: t('dashboard.security'), to: '/client-dashboard/security', icon: <Shield className="size-5" /> },
    { key: 'jobs', label: t('jobs.jobs', 'Jobs'), to: '/client-dashboard/jobs', icon: <Briefcase className="size-5" /> },
    { key: 'referrals', label: t('referrals.title'), to: '/client-dashboard/referrals', icon: <Gift className="size-5" /> },
  ];
}

export function ClientDashboardLayout() {
  const { t } = useTranslation();
  const isMdUp = useIsMdUp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { data: referralsConfig } = useConfigReferralsEnabledQuery();
  const referralsEnabled = referralsConfig?.enabled ?? false;
  const items = getItems(t).filter((it) => it.key !== 'referrals' || referralsEnabled);
  const role = useAppSelector(selectRole);
  const isVerified = useAppSelector(selectIsVerified);
  const location = useLocation();
  const { data: chatUnreadData, refetch: refetchChatUnread } = useGetUnreadCountQuery(undefined, {
    pollingInterval: 30000,
  });
  const unreadChats = chatUnreadData?.count ?? 0;

  useEffect(() => {
    if (location.pathname.startsWith('/client-dashboard/chat')) {
      refetchChatUnread();
    }
  }, [location.pathname, refetchChatUnread]);

  const itemsWithBadge: CabinetNavItem[] = items.map((it) => ({
    ...it,
    badge: it.key === 'chat' ? unreadChats : 0,
  }));

  return (
    <div className="cabinet-theme-scope flex h-full min-h-0 min-w-0 flex-col overflow-x-hidden md:flex-row">
      {!isMdUp && (
        <div className="fixed top-14 left-0 right-0 z-30 flex items-center gap-2 border-b border-[hsl(var(--cabinet-sidebar-border))] bg-[hsl(var(--cabinet-sidebar-bg))] py-2 px-4 md:static md:z-auto">
          <Button
            variant="ghost"
            size="icon"
            className="size-11 shrink-0 rounded-xl text-muted-foreground hover:bg-muted"
            onClick={() => setMobileOpen(true)}
            aria-label={t('nav.settings')}
          >
            <Menu className="size-5" />
          </Button>
          <h2 className="text-lg font-extrabold text-foreground">
            {t('nav.clientDashboard')}
          </h2>
        </div>
      )}

      <CabinetSidebar
        sectionLabel="CLIENT"
        items={itemsWithBadge}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main
        data-app-scroll-region=""
        className={cn(
        'flex-1 overflow-y-auto overflow-x-hidden bg-[hsl(var(--cabinet-main-bg))] transition-colors duration-300',
        !isMdUp && 'pt-14'
      )}
      >
        <div className="min-w-0 px-4 md:px-6 py-6 max-w-[1400px] mx-auto">
          <AppBreadcrumbs />
          {role === USER_ROLE.CLIENT && (
            <VerificationRequiredBanner
              role={USER_ROLE.CLIENT}
              isVerified={isVerified}
            />
          )}
          <Outlet />
        </div>
      </main>
    </div>
  );
}
