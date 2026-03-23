import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
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
import { CabinetSidebar, type CabinetNavItem } from '@/components/layout/CabinetSidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function getItems(
  t: ReturnType<typeof useTranslation>['t'],
  plan: TariffPlan
): CabinetNavItem[] {
  const base = [
    { key: 'overview', label: t('dashboard.overview'), to: '/dashboard', icon: <LayoutDashboard className="size-5" />, minPlan: 'BASIC' as TariffPlan },
    { key: 'profile', label: t('dashboard.profile'), to: '/dashboard/profile', icon: <User className="size-5" />, minPlan: 'BASIC' as TariffPlan },
    { key: 'services', label: t('dashboard.services'), to: '/dashboard/services', icon: <ListChecks className="size-5" />, minPlan: 'BASIC' as TariffPlan },
    { key: 'leads', label: t('dashboard.leads'), to: '/dashboard/leads', icon: <Mail className="size-5" />, minPlan: 'BASIC' as TariffPlan },
    { key: 'chat', label: t('dashboard.chat', 'Чаты'), to: '/dashboard/chat', icon: <MessageCircle className="size-5" />, minPlan: 'BASIC' as TariffPlan },
    { key: 'reviews', label: t('dashboard.reviews'), to: '/dashboard/reviews', icon: <MessageSquareQuote className="size-5" />, minPlan: 'BASIC' as TariffPlan },
    { key: 'payments', label: t('dashboard.payments'), to: '/dashboard/payments', icon: <CreditCard className="size-5" />, minPlan: 'BASIC' as TariffPlan },
    { key: 'subscription', label: t('dashboard.subscription'), to: '/dashboard/subscription', icon: <Crown className="size-5" />, minPlan: 'BASIC' as TariffPlan },
    { key: 'analytics', label: t('dashboard.analytics'), to: '/dashboard/analytics', icon: <BarChart2 className="size-5" />, minPlan: 'VIP' as TariffPlan },
    { key: 'promotions', label: t('dashboard.promotions'), to: '/dashboard/promotions', icon: <Tag className="size-5" />, minPlan: 'PREMIUM' as TariffPlan },
    { key: 'bookings', label: t('dashboard.bookings'), to: '/dashboard/bookings', icon: <Calendar className="size-5" />, minPlan: 'BASIC' as TariffPlan },
    { key: 'files', label: t('dashboard.files'), to: '/dashboard/files', icon: <Paperclip className="size-5" />, minPlan: 'BASIC' as TariffPlan },
    { key: 'portfolio', label: t('dashboard.portfolio'), to: '/dashboard/portfolio', icon: <Layers className="size-5" />, minPlan: 'BASIC' as TariffPlan },
    { key: 'security', label: t('dashboard.security'), to: '/dashboard/security', icon: <Shield className="size-5" />, minPlan: 'BASIC' as TariffPlan },
    { key: 'notifications', label: t('dashboard.notifications'), to: '/dashboard/notifications', icon: <Bell className="size-5" />, minPlan: 'BASIC' as TariffPlan },
    { key: 'verification', label: t('dashboard.verification'), to: '/dashboard/verification', icon: <BadgeCheck className="size-5" />, minPlan: 'BASIC' as TariffPlan },
    { key: 'referrals', label: t('referrals.title'), to: '/dashboard/referrals', icon: <Gift className="size-5" />, minPlan: 'BASIC' as TariffPlan },
  ];
  return base
    .filter((it) => hasMinPlan(plan, it.minPlan))
    .map(({ key, label, to, icon, minPlan: _ }) => ({ key, label, to, icon }));
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
  const baseItems = getItems(t, plan).filter((it) => it.key !== 'referrals' || referralsEnabled);

  const badgeFor = (key: string) => {
    if (key === 'leads') return unreadLeads;
    if (key === 'reviews') return unreadReviews;
    if (key === 'chat') return unreadChats;
    return 0;
  };

  const items: CabinetNavItem[] = baseItems.map((it) => ({
    ...it,
    badge: badgeFor(it.key),
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
            {t('dashboard.title')}
          </h2>
        </div>
      )}

      <CabinetSidebar
        sectionLabel="MASTER"
        items={items}
        showPremiumBanner
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main className={cn(
        'flex-1 overflow-y-auto overflow-x-hidden bg-[hsl(var(--cabinet-main-bg))] transition-colors duration-300',
        !isMdUp && 'pt-14'
      )}>
        <div className="min-w-0 py-6 px-4 md:px-6 max-w-[1400px] mx-auto">
          <AppBreadcrumbs />
          {role === 'MASTER' && <VerificationRequiredBanner role="MASTER" isVerified={isVerified} />}
          {role === 'MASTER' && <ReportsWarningBanner />}
          <Outlet />
        </div>
      </main>
    </div>
  );
}
