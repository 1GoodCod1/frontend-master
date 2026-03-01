import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Heart,
  Calendar,
  Mail,
  AlertTriangle,
  Shield,
  Menu,
  User,
  MessageCircle,
} from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { selectRole, selectIsVerified } from '@/features/auth/selectors';
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
};

function getItems(t: ReturnType<typeof useTranslation>['t']): NavItem[] {
  return [
    { key: 'overview', label: t('clientDashboard.overview'), to: '/client-dashboard', icon: <LayoutDashboard className="size-5" /> },
    { key: 'bookings', label: t('clientDashboard.bookings'), to: '/client-dashboard/bookings', icon: <Calendar className="size-5" /> },
    { key: 'leads', label: t('clientDashboard.myLeads'), to: '/client-dashboard/leads', icon: <Mail className="size-5" /> },
    { key: 'chat', label: t('clientDashboard.chat', 'Чаты'), to: '/client-dashboard/chat', icon: <MessageCircle className="size-5" /> },
    { key: 'favorites', label: t('clientDashboard.favorites'), to: '/client-dashboard/favorites', icon: <Heart className="size-5" /> },
    { key: 'reports', label: t('clientDashboard.reports'), to: '/client-dashboard/reports', icon: <AlertTriangle className="size-5" /> },
    { key: 'profile', label: t('clientDashboard.profile'), to: '/client-dashboard/profile', icon: <User className="size-5" /> },
    { key: 'security', label: t('dashboard.security'), to: '/client-dashboard/security', icon: <Shield className="size-5" /> },
  ];
}

export function ClientDashboardLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const isMdUp = useIsMdUp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = getItems(t);
  const role = useAppSelector(selectRole);
  const isVerified = useAppSelector(selectIsVerified);
  const { data: chatUnreadData } = useGetUnreadCountQuery(undefined, { pollingInterval: 30000 });
  const unreadChats = chatUnreadData?.count ?? 0;

  const badgeFor = (key: string) => (key === 'chat' ? unreadChats : 0);

  const navContent = (
    <div className="p-4">
      <span className="text-xs font-medium uppercase tracking-widest opacity-70 text-muted-foreground">CLIENT</span>
      <nav className="mt-2 flex flex-col gap-0.5" aria-label={t('nav.clientDashboard')}>
        {items.map((it) => {
          const exactMatch = location.pathname === it.to;
          const nestedMatch = it.to !== '/client-dashboard' && location.pathname.startsWith(it.to + '/');
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
          <h2 className="text-lg font-extrabold">{t('nav.clientDashboard')}</h2>
        </div>
      )}

      <aside className="hidden w-[268px] shrink-0 md:block" aria-label={t('nav.clientDashboard')}>
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

      <main className="flex min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
        <div className="min-w-0 flex-1 px-4 md:px-0">
          <AppBreadcrumbs />
          {role === 'CLIENT' && <VerificationRequiredBanner role="CLIENT" isVerified={isVerified} />}
          <Outlet />
        </div>
      </main>
    </div>
  );
}
