import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import type { Crumb } from '@/types/ui';

const pathToCrumbs: Record<
  string,
  (t: TFunction, lastSegment?: string) => Crumb[]
> = {
  '/admin': (t) => [{ label: t('nav.admin') }],
  '/admin/users': (t) => [
    { label: t('nav.admin'), to: '/admin' },
    { label: t('admin.users.title') },
  ],
  '/admin/masters': (t) => [
    { label: t('nav.admin'), to: '/admin' },
    { label: t('admin.masters.title') },
  ],
  '/admin/leads': (t) => [
    { label: t('nav.admin'), to: '/admin' },
    { label: t('leads.title') },
  ],
  '/admin/reviews': (t) => [
    { label: t('nav.admin'), to: '/admin' },
    { label: t('admin.reviews.title') },
  ],
  '/admin/reports': (t) => [
    { label: t('nav.admin'), to: '/admin' },
    { label: t('admin.reports.title') },
  ],
  '/admin/payments': (t) => [
    { label: t('nav.admin'), to: '/admin' },
    { label: t('admin.payments.title') },
  ],
  '/admin/categories': (t) => [
    { label: t('nav.admin'), to: '/admin' },
    { label: t('admin.categories.title') },
  ],
  '/admin/cities': (t) => [
    { label: t('nav.admin'), to: '/admin' },
    { label: t('admin.cities.title') },
  ],
  '/admin/tariffs': (t) => [
    { label: t('nav.admin'), to: '/admin' },
    { label: t('admin.tariffs.title') },
  ],
  '/admin/analytics': (t) => [
    { label: t('nav.admin'), to: '/admin' },
    { label: t('dashboard.analytics') },
  ],
  '/admin/verification-requests': (t) => [
    { label: t('nav.admin'), to: '/admin' },
    { label: t('verification.requests') },
  ],
  '/admin/security': (t) => [
    { label: t('nav.admin'), to: '/admin' },
    { label: t('security.title') },
  ],
  '/admin/system': (t) => [
    { label: t('nav.admin'), to: '/admin' },
    { label: t('admin.system.title') },
  ],
  '/admin/audit': (t) => [
    { label: t('nav.admin'), to: '/admin' },
    { label: t('admin.audit.title') },
  ],
  '/dashboard': (t) => [{ label: t('dashboard.title') }],
  '/dashboard/profile': (t) => [
    { label: t('dashboard.title'), to: '/dashboard' },
    { label: t('dashboard.profile') },
  ],
  '/dashboard/leads': (t) => [
    { label: t('dashboard.title'), to: '/dashboard' },
    { label: t('leads.title') },
  ],
  '/dashboard/reviews': (t) => [
    { label: t('dashboard.title'), to: '/dashboard' },
    { label: t('dashboard.reviews') },
  ],
  '/dashboard/payments': (t) => [
    { label: t('dashboard.title'), to: '/dashboard' },
    { label: t('dashboard.payments') },
  ],
  '/dashboard/analytics': (t) => [
    { label: t('dashboard.title'), to: '/dashboard' },
    { label: t('dashboard.analytics') },
  ],
  '/dashboard/promotions': (t) => [
    { label: t('dashboard.title'), to: '/dashboard' },
    { label: t('dashboard.promotions') },
  ],
  '/dashboard/bookings': (t) => [
    { label: t('dashboard.title'), to: '/dashboard' },
    { label: t('dashboard.bookings') },
  ],
  '/dashboard/files': (t) => [
    { label: t('dashboard.title'), to: '/dashboard' },
    { label: t('dashboard.files') },
  ],
  '/dashboard/security': (t) => [
    { label: t('dashboard.title'), to: '/dashboard' },
    { label: t('dashboard.security') },
  ],
  '/dashboard/verification': (t) => [
    { label: t('dashboard.title'), to: '/dashboard' },
    { label: t('dashboard.verification') },
  ],
  '/client-dashboard': (t) => [{ label: t('nav.clientDashboard') }],
  '/client-dashboard/leads': (t) => [
    { label: t('nav.clientDashboard'), to: '/client-dashboard' },
    { label: t('leads.title') },
  ],
  '/client-dashboard/favorites': (t) => [
    { label: t('nav.clientDashboard'), to: '/client-dashboard' },
    { label: t('favorites.title') },
  ],
  '/client-dashboard/reports': (t) => [
    { label: t('nav.clientDashboard'), to: '/client-dashboard' },
    { label: t('clientDashboard.reports') },
  ],
  '/client-dashboard/profile': (t) => [
    { label: t('nav.clientDashboard'), to: '/client-dashboard' },
    { label: t('clientDashboard.profile') },
  ],
  '/client-dashboard/bookings': (t) => [
    { label: t('nav.clientDashboard'), to: '/client-dashboard' },
    { label: t('clientDashboard.myBookings') },
  ],
  '/client-dashboard/security': (t) => [
    { label: t('nav.clientDashboard'), to: '/client-dashboard' },
    { label: t('dashboard.security') },
  ],
};

function getCrumbsForPath(pathname: string, t: TFunction): Crumb[] {
  const base = pathname.replace(/\/$/, '') || '/';
  const exact = pathToCrumbs[base];
  if (exact) return exact(t);

  if (
    base.startsWith('/admin/masters/') ||
    base.match(/^\/admin\/[^/]+\/[^/]+/)
  ) {
    const parent = base.replace(/\/[^/]+$/, '');
    const parentCrumbs =
      pathToCrumbs[parent]?.(t) ?? [
        { label: t('nav.admin'), to: '/admin' },
      ];
    return [...parentCrumbs, { label: t('common.details') }];
  }
  if (base.startsWith('/dashboard/leads/')) {
    return [
      { label: t('dashboard.title'), to: '/dashboard' },
      { label: t('leads.title'), to: '/dashboard/leads' },
      { label: t('common.details') },
    ];
  }

  const parent = base.replace(/\/[^/]+$/, '');
  const parentCrumbs = pathToCrumbs[parent]?.(t);
  if (parentCrumbs)
    return [...parentCrumbs, { label: base.split('/').pop() ?? '—' }];
  return [];
}

export function AppBreadcrumbs() {
  const { t } = useTranslation();
  const location = useLocation();
  const pathname = location.pathname;
  const crumbs = getCrumbsForPath(pathname, t);

  if (crumbs.length <= 1) return null;

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {crumbs.map((c, i) => (
          <React.Fragment key={c.to ?? c.label + i}>
            {i > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {c.to && i < crumbs.length - 1 ? (
                <BreadcrumbLink asChild>
                  <RouterLink to={c.to}>{c.label}</RouterLink>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="font-semibold text-foreground">
                  {c.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
