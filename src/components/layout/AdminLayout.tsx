import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Wrench,
  Mail,
  MessageSquareQuote,
  AlertTriangle,
  CreditCard,
  Folder,
  Building2,
  DollarSign,
  BarChart2,
  BadgeCheck,
  Lightbulb,
  Shield,
  Settings,
  FileCheck,
  Menu,
} from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { useIsMdUp } from '@/hooks/useMediaQuery';
import { AppBreadcrumbs } from '@/components/common/AppBreadcrumbs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const items: { key: string; to: string; icon: React.ReactNode }[] = [
  { key: 'dashboard', to: '/admin', icon: <LayoutDashboard className="size-5" /> },
  { key: 'users', to: '/admin/users', icon: <Users className="size-5" /> },
  { key: 'masters', to: '/admin/masters', icon: <Wrench className="size-5" /> },
  { key: 'leads', to: '/admin/leads', icon: <Mail className="size-5" /> },
  { key: 'reviews', to: '/admin/reviews', icon: <MessageSquareQuote className="size-5" /> },
  { key: 'reports', to: '/admin/reports', icon: <AlertTriangle className="size-5" /> },
  { key: 'payments', to: '/admin/payments', icon: <CreditCard className="size-5" /> },
  { key: 'categories', to: '/admin/categories', icon: <Folder className="size-5" /> },
  { key: 'cities', to: '/admin/cities', icon: <Building2 className="size-5" /> },
  { key: 'tariffs', to: '/admin/tariffs', icon: <DollarSign className="size-5" /> },
  { key: 'analytics', to: '/admin/analytics', icon: <BarChart2 className="size-5" /> },
  { key: 'verificationRequests', to: '/admin/verification-requests', icon: <BadgeCheck className="size-5" /> },
  { key: 'ideas', to: '/admin/ideas', icon: <Lightbulb className="size-5" /> },
  { key: 'security', to: '/admin/security', icon: <Shield className="size-5" /> },
  { key: 'system', to: '/admin/system', icon: <Settings className="size-5" /> },
  { key: 'audit', to: '/admin/audit', icon: <FileCheck className="size-5" /> },
];

export function AdminLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const isMdUp = useIsMdUp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const unreadLeads = useAppSelector((s) => s.socket.unreadLeads);
  const unreadReviews = useAppSelector((s) => s.socket.unreadReviews);

  const badgeFor = (key: string) => {
    if (key === 'leads') return unreadLeads;
    if (key === 'reviews') return unreadReviews;
    return 0;
  };

  const navContent = (
    <div className="p-4">
      <span className="text-xs font-medium uppercase tracking-widest opacity-70 text-muted-foreground">{t('nav.admin')}</span>
      <nav className="mt-2 flex flex-col gap-0.5" aria-label={t('nav.admin')}>
        {items.map((it) => {
          const exactMatch = location.pathname === it.to;
          const nestedMatch = it.to !== '/admin' && location.pathname.startsWith(it.to + '/');
          const selected = exactMatch || nestedMatch;
          const badge = badgeFor(it.key);
          const label = t(`admin.nav.${it.key}`);
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
                  <span className="truncate">{label}</span>
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
                  <span className="truncate">{label}</span>
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
          <Button variant="ghost" size="icon" className="size-11 shrink-0" onClick={() => setMobileOpen(true)} aria-label={t('nav.admin')}>
            <Menu className="size-5" />
          </Button>
          <h2 className="text-lg font-extrabold">{t('nav.admin')}</h2>
        </div>
      )}

      <aside className="hidden w-[286px] shrink-0 md:block" aria-label={t('nav.admin')}>
        <div className="sticky top-0 rounded-xl border border-border dark:border-transparent bg-card dark:shadow-xl dark:shadow-black/40">
          {navContent}
        </div>
      </aside>

      {!isMdUp && (
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className={cn('w-[min(100vw-2rem,286px)] p-0')}>
            <div className="pt-4">{navContent}</div>
          </SheetContent>
        </Sheet>
      )}

      <main className="min-w-0 flex-1 overflow-x-hidden py-6 px-4 md:px-0">
        <AppBreadcrumbs />
        <Outlet />
      </main>
    </div>
  );
}
