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
import { CabinetSidebar, type CabinetNavItem, type CabinetNavSection } from '@/components/layout/CabinetSidebar';
import { CabinetContentShell } from '@/components/layout/CabinetContentShell';
import { Button } from '@/components/ui/button';
import { USER_ROLE } from '@/constants/roles';

const CLIENT_SECTION_ORDER = ['main', 'personal', 'account'] as const;

function buildClientSections(
  t: ReturnType<typeof useTranslation>['t'],
  unreadChats: number,
  referralsEnabled: boolean,
): CabinetNavSection[] {
  const defs: { key: string; sectionKey: (typeof CLIENT_SECTION_ORDER)[number]; label: string; to: string; icon: React.ReactNode }[] = [
    { key: 'overview', sectionKey: 'main', label: t('clientDashboard.overview'), to: '/client-dashboard', icon: <LayoutDashboard className="size-5" /> },
    { key: 'bookings', sectionKey: 'personal', label: t('clientDashboard.myBookings'), to: '/client-dashboard/bookings', icon: <Calendar className="size-5" /> },
    { key: 'leads', sectionKey: 'personal', label: t('clientDashboard.myLeads'), to: '/client-dashboard/leads', icon: <Mail className="size-5" /> },
    { key: 'chat', sectionKey: 'personal', label: t('clientDashboard.chat'), to: '/client-dashboard/chat', icon: <MessageCircle className="size-5" /> },
    { key: 'favorites', sectionKey: 'personal', label: t('clientDashboard.favorites'), to: '/client-dashboard/favorites', icon: <Heart className="size-5" /> },
    { key: 'reports', sectionKey: 'personal', label: t('clientDashboard.reports'), to: '/client-dashboard/reports', icon: <AlertTriangle className="size-5" /> },
    { key: 'jobs', sectionKey: 'personal', label: t('jobs.myJobs'), to: '/client-dashboard/jobs', icon: <Briefcase className="size-5" /> },
    { key: 'profile', sectionKey: 'account', label: t('clientDashboard.profile'), to: '/client-dashboard/profile', icon: <User className="size-5" /> },
    { key: 'security', sectionKey: 'account', label: t('dashboard.security'), to: '/client-dashboard/security', icon: <Shield className="size-5" /> },
    { key: 'referrals', sectionKey: 'account', label: t('referrals.title'), to: '/client-dashboard/referrals', icon: <Gift className="size-5" /> },
  ];

  const filtered = defs.filter((it) => it.key !== 'referrals' || referralsEnabled);
  const bySection = new Map<string, CabinetNavItem[]>();

  for (const def of filtered) {
    const items = bySection.get(def.sectionKey) ?? [];
    items.push({
      key: def.key,
      label: def.label,
      to: def.to,
      icon: def.icon,
      badge: def.key === 'chat' ? unreadChats : 0,
    });
    bySection.set(def.sectionKey, items);
  }

  return CLIENT_SECTION_ORDER.flatMap((sectionKey) => {
    const items = bySection.get(sectionKey);
    if (!items?.length) return [];
    return [{
      key: sectionKey,
      label: t(`cabinetNav.sections.${sectionKey}`),
      items,
    }];
  });
}

export function ClientDashboardLayout() {
  const { t } = useTranslation();
  const isMdUp = useIsMdUp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { data: referralsConfig } = useConfigReferralsEnabledQuery();
  const referralsEnabled = referralsConfig?.enabled ?? false;
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

  const sections = buildClientSections(t, unreadChats, referralsEnabled);

  return (
    <div className="cabinet-theme-scope flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden md:flex-row md:items-stretch">
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
        sections={sections}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <CabinetContentShell mobileTopPadding={!isMdUp} contentClassName="max-w-[1400px]">
        <AppBreadcrumbs />
        {role === USER_ROLE.CLIENT && (
          <VerificationRequiredBanner role={USER_ROLE.CLIENT} isVerified={isVerified} />
        )}
        <Outlet />
      </CabinetContentShell>
    </div>
  );
}
