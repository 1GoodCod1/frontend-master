import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Users,
  Mail,
  MessageSquareQuote,
  CreditCard,
  BarChart2,
  Paperclip,
  Layers,
  Calendar,
  Shield,
  BadgeCheck,
  Bell,
  MessageCircle,
  Menu,
  Crown,
  Tag,
  ListChecks,
  Gift,
  Briefcase,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { selectPlan, selectRole, selectIsVerified } from '@/features/auth/selectors';
import { TariffPlan, hasMinPlan } from '@/features/auth/plan';
import { useGetUnreadCountQuery } from '@/features/chat/chatApi';
import { clearUnreadLeads, clearUnreadReviews } from '@/features/socket/socketSlice';
import { useConfigReferralsEnabledQuery } from '@/features/referrals/referralsApi';
import { useIsMdUp } from '@/hooks/useMediaQuery';
import { AppBreadcrumbs } from '@/components/common/AppBreadcrumbs';
import { VerificationRequiredBanner } from '@/components/common/VerificationRequiredBanner';
import { ReportsWarningBanner } from '@/components/common/ReportsWarningBanner';
import { CabinetSidebar, type CabinetNavItem, type CabinetNavSection } from '@/components/layout/CabinetSidebar';
import { CabinetContentShell } from '@/components/layout/CabinetContentShell';
import { Button } from '@/components/ui/button';
import { USER_ROLE } from '@/constants/roles';

function getSections(
  t: ReturnType<typeof useTranslation>['t'],
  plan: TariffPlan,
): { key: string; sectionKey: string; label: string; to: string; icon: React.ReactNode; minPlan: TariffPlan }[] {
  return [
    { key: 'overview', sectionKey: 'main', label: t('dashboard.overview'), to: '/dashboard', icon: <LayoutDashboard className="size-5" />, minPlan: 'BASIC' as TariffPlan },
    { key: 'leads', sectionKey: 'work', label: t('dashboard.leads'), to: '/dashboard/leads', icon: <Mail className="size-5" />, minPlan: 'BASIC' as TariffPlan },
    { key: 'clients', sectionKey: 'work', label: t('dashboard.clients'), to: '/dashboard/clients', icon: <Users className="size-5" />, minPlan: 'BASIC' as TariffPlan },
    { key: 'chat', sectionKey: 'work', label: t('dashboard.chat'), to: '/dashboard/chat', icon: <MessageCircle className="size-5" />, minPlan: 'BASIC' as TariffPlan },
    { key: 'reviews', sectionKey: 'work', label: t('dashboard.reviews'), to: '/dashboard/reviews', icon: <MessageSquareQuote className="size-5" />, minPlan: 'BASIC' as TariffPlan },
    { key: 'bookings', sectionKey: 'work', label: t('dashboard.bookings'), to: '/dashboard/bookings', icon: <Calendar className="size-5" />, minPlan: 'BASIC' as TariffPlan },
    { key: 'applications', sectionKey: 'work', label: t('jobs.myApplications'), to: '/dashboard/jobs/applications', icon: <Briefcase className="size-5" />, minPlan: 'BASIC' as TariffPlan },
    { key: 'profile', sectionKey: 'business', label: t('dashboard.profile'), to: '/dashboard/profile', icon: <User className="size-5" />, minPlan: 'BASIC' as TariffPlan },
    { key: 'services', sectionKey: 'business', label: t('dashboard.services'), to: '/dashboard/services', icon: <ListChecks className="size-5" />, minPlan: 'BASIC' as TariffPlan },
    { key: 'files', sectionKey: 'business', label: t('dashboard.files'), to: '/dashboard/files', icon: <Paperclip className="size-5" />, minPlan: 'BASIC' as TariffPlan },
    { key: 'portfolio', sectionKey: 'business', label: t('dashboard.portfolio'), to: '/dashboard/portfolio', icon: <Layers className="size-5" />, minPlan: 'PLUS' as TariffPlan },
    { key: 'promotions', sectionKey: 'business', label: t('dashboard.promotions'), to: '/dashboard/promotions', icon: <Tag className="size-5" />, minPlan: 'PRO' as TariffPlan },
    { key: 'analytics', sectionKey: 'business', label: t('dashboard.analytics'), to: '/dashboard/analytics', icon: <BarChart2 className="size-5" />, minPlan: 'PLUS' as TariffPlan },
    { key: 'payments', sectionKey: 'finance', label: t('dashboard.payments'), to: '/dashboard/payments', icon: <CreditCard className="size-5" />, minPlan: 'BASIC' as TariffPlan },
    { key: 'subscription', sectionKey: 'finance', label: t('dashboard.subscription'), to: '/dashboard/subscription', icon: <Crown className="size-5" />, minPlan: 'BASIC' as TariffPlan },
    { key: 'security', sectionKey: 'account', label: t('dashboard.security'), to: '/dashboard/security', icon: <Shield className="size-5" />, minPlan: 'BASIC' as TariffPlan },
    { key: 'notifications', sectionKey: 'account', label: t('dashboard.notifications'), to: '/dashboard/notifications', icon: <Bell className="size-5" />, minPlan: 'BASIC' as TariffPlan },
    { key: 'verification', sectionKey: 'account', label: t('dashboard.verification'), to: '/dashboard/verification', icon: <BadgeCheck className="size-5" />, minPlan: 'BASIC' as TariffPlan },
    { key: 'referrals', sectionKey: 'account', label: t('referrals.title'), to: '/dashboard/referrals', icon: <Gift className="size-5" />, minPlan: 'BASIC' as TariffPlan },
  ].filter((it) => hasMinPlan(plan, it.minPlan));
}

const MASTER_SECTION_ORDER = ['main', 'work', 'business', 'finance', 'account'] as const;

function buildMasterSections(
  t: ReturnType<typeof useTranslation>['t'],
  plan: TariffPlan,
  badgeFor: (key: string) => number,
  referralsEnabled: boolean,
): CabinetNavSection[] {
  const defs = getSections(t, plan).filter((it) => it.key !== 'referrals' || referralsEnabled);
  const bySection = new Map<string, CabinetNavItem[]>();

  for (const def of defs) {
    const items = bySection.get(def.sectionKey) ?? [];
    items.push({
      key: def.key,
      label: def.label,
      to: def.to,
      icon: def.icon,
      badge: badgeFor(def.key),
    });
    bySection.set(def.sectionKey, items);
  }

  return MASTER_SECTION_ORDER.flatMap((sectionKey) => {
    const items = bySection.get(sectionKey);
    if (!items?.length) return [];
    return [{
      key: sectionKey,
      label: t(`cabinetNav.sections.${sectionKey}`),
      items,
    }];
  });
}

export function DashboardLayout() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const isMdUp = useIsMdUp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const unreadLeads = useAppSelector((s) => s.socket.unreadLeads);
  const unreadReviews = useAppSelector((s) => s.socket.unreadReviews);
  const { data: chatUnreadData, refetch: refetchChatUnread } = useGetUnreadCountQuery(undefined, {
    pollingInterval: 30000,
  });
  const unreadChats = chatUnreadData?.count ?? 0;

  useEffect(() => {
    if (location.pathname.startsWith('/dashboard/chat')) {
      refetchChatUnread();
    }
    if (location.pathname.startsWith('/dashboard/leads')) {
      dispatch(clearUnreadLeads());
    }
    if (location.pathname.startsWith('/dashboard/reviews')) {
      dispatch(clearUnreadReviews());
    }
  }, [location.pathname, refetchChatUnread, dispatch]);

  const plan: TariffPlan = useAppSelector(selectPlan) ?? 'BASIC';
  const role = useAppSelector(selectRole);
  const isVerified = useAppSelector(selectIsVerified);
  const { data: referralsConfig } = useConfigReferralsEnabledQuery();
  const referralsEnabled = referralsConfig?.enabled ?? false;

  const badgeFor = (key: string) => {
    if (key === 'leads') return unreadLeads;
    if (key === 'reviews') return unreadReviews;
    if (key === 'chat') return unreadChats;
    return 0;
  };

  const sections = buildMasterSections(t, plan, badgeFor, referralsEnabled);

  return (
    <div className="cabinet-theme-scope flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden md:flex-row md:items-stretch">
      {!isMdUp && (
        <div className="fixed top-16 left-0 right-0 z-30 flex items-center gap-2 border-b border-[hsl(var(--cabinet-sidebar-border))] bg-[hsl(var(--cabinet-sidebar-bg))] py-2 px-4 md:static md:z-auto">
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
            {t('dashboard.title')}
          </h2>
        </div>
      )}

      <CabinetSidebar
        sections={sections}
        showProBanner
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <CabinetContentShell mobileTopPadding={!isMdUp} contentClassName="max-w-[1400px]">
        <AppBreadcrumbs />
        {role === USER_ROLE.MASTER && (
          <VerificationRequiredBanner
            role={USER_ROLE.MASTER}
            isVerified={isVerified}
          />
        )}
        {role === USER_ROLE.MASTER && <ReportsWarningBanner />}
        <Outlet />
      </CabinetContentShell>
    </div>
  );
}
