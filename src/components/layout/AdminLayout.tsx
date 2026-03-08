import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
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
  Shield,
  Settings,
  FileCheck,
  Menu,
  Mailbox,
} from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { useIsMdUp } from '@/hooks/useMediaQuery';
import { AppBreadcrumbs } from '@/components/common/AppBreadcrumbs';
import { CabinetSidebar, type CabinetNavItem } from '@/components/layout/CabinetSidebar';
import { Button } from '@/components/ui/button';

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
  { key: 'digest', to: '/admin/digest', icon: <Mailbox className="size-5" /> },
  { key: 'security', to: '/admin/security', icon: <Shield className="size-5" /> },
  { key: 'system', to: '/admin/system', icon: <Settings className="size-5" /> },
  { key: 'audit', to: '/admin/audit', icon: <FileCheck className="size-5" /> },
];

export function AdminLayout() {
  const { t } = useTranslation();
  const isMdUp = useIsMdUp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const unreadLeads = useAppSelector((s) => s.socket.unreadLeads);
  const unreadReviews = useAppSelector((s) => s.socket.unreadReviews);

  const badgeFor = (key: string) => {
    if (key === 'leads') return unreadLeads;
    if (key === 'reviews') return unreadReviews;
    return 0;
  };

  const navItems: CabinetNavItem[] = items.map((it) => ({
    key: it.key,
    label: t(`admin.nav.${it.key}`),
    to: it.to,
    icon: it.icon,
    badge: badgeFor(it.key),
  }));

  return (
    <div className="cabinet-theme-scope flex h-full min-h-0 min-w-0 flex-col overflow-x-hidden md:flex-row">
      {!isMdUp && (
        <div className="flex shrink-0 items-center gap-2 border-b border-[hsl(var(--cabinet-sidebar-border))] bg-[hsl(var(--cabinet-sidebar-bg))] py-2 px-4">
          <Button
            variant="ghost"
            size="icon"
            className="size-11 shrink-0 rounded-xl text-muted-foreground hover:bg-muted"
            onClick={() => setMobileOpen(true)}
            aria-label={t('nav.admin')}
          >
            <Menu className="size-5" />
          </Button>
          <h2 className="text-lg font-extrabold text-foreground">
            {t('nav.admin')}
          </h2>
        </div>
      )}

      <CabinetSidebar
        sectionLabel={t('nav.admin').toUpperCase()}
        items={navItems}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[hsl(var(--cabinet-main-bg))] transition-colors duration-300">
        <div className="min-w-0 py-6 px-4 md:px-6 max-w-[1400px] mx-auto">
          <AppBreadcrumbs />
          <Outlet />
        </div>
      </main>
    </div>
  );
}
