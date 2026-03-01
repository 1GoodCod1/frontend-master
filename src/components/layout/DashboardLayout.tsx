import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { selectPlan, selectRole, selectIsVerified } from '@/features/auth/selectors';
import { TariffPlan, hasMinPlan } from '@/features/auth/plan';
import { useGetUnreadCountQuery } from '@/features/chat/chatApi';
import { useIsMdUp } from '@/hooks/useMediaQuery';
import { AppBreadcrumbs } from '@/components/common/AppBreadcrumbs';
import { VerificationRequiredBanner } from '@/components/common/VerificationRequiredBanner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

type NavItem = {
  key: string;
  label: string;
  to: string;
  icon: React.ReactNode;
  minPlan: TariffPlan;
};

function getItems(t: ReturnType<typeof useTranslation>['t']): NavItem[] {
  return [
    { key: 'overview', label: t('dashboard.overview'), to: '/dashboard', icon: <LayoutDashboard className="size-5" />, minPlan: 'BASIC' },
    { key: 'profile', label: t('dashboard.profile'), to: '/dashboard/profile', icon: <User className="size-5" />, minPlan: 'BASIC' },
    { key: 'services', label: t('dashboard.services'), to: '/dashboard/services', icon: <ListChecks className="size-5" />, minPlan: 'BASIC' },
    { key: 'leads', label: t('dashboard.leads'), to: '/dashboard/leads', icon: <Mail className="size-5" />, minPlan: 'BASIC' },
    { key: 'chat', label: t('dashboard.chat', 'Чаты'), to: '/dashboard/chat', icon: <MessageCircle className="size-5" />, minPlan: 'BASIC' },
    { key: 'reviews', label: t('dashboard.reviews'), to: '/dashboard/reviews', icon: <MessageSquareQuote className="size-5" />, minPlan: 'BASIC' },
    { key: 'payments', label: t('dashboard.payments'), to: '/dashboard/payments', icon: <CreditCard className="size-5" />, minPlan: 'BASIC' },
    { key: 'subscription', label: t('dashboard.subscription'), to: '/dashboard/subscription', icon: <Crown className="size-5" />, minPlan: 'BASIC' },
    { key: 'analytics', label: t('dashboard.analytics'), to: '/dashboard/analytics', icon: <BarChart2 className="size-5" />, minPlan: 'VIP' },
    { key: 'promotions', label: t('dashboard.promotions'), to: '/dashboard/promotions', icon: <Tag className="size-5" />, minPlan: 'BASIC' },
    { key: 'bookings', label: t('dashboard.bookings'), to: '/dashboard/bookings', icon: <Calendar className="size-5" />, minPlan: 'BASIC' },
    { key: 'files', label: t('dashboard.files'), to: '/dashboard/files', icon: <Paperclip className="size-5" />, minPlan: 'BASIC' },
    { key: 'portfolio', label: t('dashboard.portfolio'), to: '/dashboard/portfolio', icon: <Layers className="size-5" />, minPlan: 'BASIC' },
    { key: 'security', label: t('dashboard.security'), to: '/dashboard/security', icon: <Shield className="size-5" />, minPlan: 'BASIC' },
    { key: 'notifications', label: t('dashboard.notifications'), to: '/dashboard/notifications', icon: <Bell className="size-5" />, minPlan: 'BASIC' },
    { key: 'verification', label: t('dashboard.verification'), to: '/dashboard/verification', icon: <BadgeCheck className="size-5" />, minPlan: 'BASIC' },
  ];
}

export function DashboardLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const isMdUp = useIsMdUp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const unreadLeads = useAppSelector((s) => s.socket.unreadLeads);
  const unreadReviews = useAppSelector((s) => s.socket.unreadReviews);
  const { data: chatUnreadData } = useGetUnreadCountQuery(undefined, { pollingInterval: 30000 });
  const unreadChats = chatUnreadData?.count ?? 0;

  const plan: TariffPlan = useAppSelector(selectPlan) ?? 'BASIC';
  const role = useAppSelector(selectRole);
  const isVerified = useAppSelector(selectIsVerified);
  const items = getItems(t);
  const visibleItems = items.filter((it) => hasMinPlan(plan, it.minPlan));

  const badgeFor = (key: string) => {
    if (key === 'leads') return unreadLeads;
    if (key === 'reviews') return unreadReviews;
    if (key === 'chat') return unreadChats;
    return 0;
  };

  const navContent = (
    <div className="p-4">
      <span className="text-xs font-medium uppercase tracking-widest opacity-70 text-muted-foreground">MASTER</span>
      <nav className="mt-2 flex flex-col gap-0.5" aria-label={t('dashboard.title')}>
        {visibleItems.map((it) => {
          const exactMatch = location.pathname === it.to;
          const nestedMatch = it.to !== '/dashboard' && location.pathname.startsWith(it.to + '/');
          const selected = exactMatch || nestedMatch;
          const badge = badgeFor(it.key);
          return (
            <Button
              key={it.to}
              variant="ghost"
              className={cn(
                'h-auto justify-start gap-3 rounded-xl px-3 py-2.5 font-normal',
                selected
                  ? 'bg-amber-500/15 !text-gray-900 [&_svg]:!text-gray-900 hover:bg-amber-500/20 dark:bg-amber-500/25 dark:!text-amber-200 dark:[&_svg]:!text-amber-200 dark:hover:bg-amber-500/30'
                  : 'hover:bg-muted'
              )}
              onClick={() => {
                navigate(it.to);
                setMobileOpen(false);
              }}
              asChild={isMdUp}
            >
              {isMdUp ? (
                <RouterLink to={it.to}>
                  <span className="relative flex shrink-0 items-center justify-center">
                    {it.icon}
                    {badge > 0 && (
                      <Badge className="absolute -right-1 -top-1 size-5 justify-center rounded-full p-0 text-[10px] font-bold">
                        {badge > 99 ? '99+' : badge}
                      </Badge>
                    )}
                  </span>
                  <span className="truncate">{it.label}</span>
                </RouterLink>
              ) : (
                <>
                  <span className="relative flex shrink-0 items-center justify-center">
                    {it.icon}
                    {badge > 0 && (
                      <Badge className="absolute -right-1 -top-1 size-5 justify-center rounded-full p-0 text-[10px] font-bold">
                        {badge > 99 ? '99+' : badge}
                      </Badge>
                    )}
                  </span>
                  <span className="truncate">{it.label}</span>
                </>
              )}
            </Button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col gap-0 overflow-x-hidden md:flex-row md:gap-4">
      {!isMdUp && (
        <div className="flex shrink-0 items-center gap-2 border-b border-border py-2 px-2">
          <Button variant="ghost" size="icon" className="size-11 shrink-0" onClick={() => setMobileOpen(true)} aria-label={t('nav.settings')}>
            <Menu className="size-5" />
          </Button>
          <h2 className="text-lg font-extrabold">{t('dashboard.title')}</h2>
        </div>
      )}

      <aside className="hidden w-[268px] shrink-0 md:block" aria-label={t('dashboard.title')}>
        <div className="sticky top-0 rounded-xl border border-border dark:border-transparent bg-card dark:shadow-xl dark:shadow-black/40">
          {navContent}
        </div>
      </aside>

      {!isMdUp && (
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className={cn('w-[min(100vw-2rem,268px)] p-0')}>
            <div className="pt-4">{navContent}</div>
          </SheetContent>
        </Sheet>
      )}

      <main className="min-w-0 flex-1 overflow-x-hidden py-6 px-4 md:px-0">
        <AppBreadcrumbs />
        {role === 'MASTER' && <VerificationRequiredBanner role="MASTER" isVerified={isVerified} />}
        <Outlet />
      </main>
    </div>
  );
}
