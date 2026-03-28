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
import { paths } from '@/constants/routes';

const pathToCrumbs: Record<
  string,
  (t: TFunction, lastSegment?: string) => Crumb[]
> = {
  [paths.admin.root]: (t) => [{ label: t('nav.admin') }],
  [paths.admin.users]: (t) => [
    { label: t('nav.admin'), to: paths.admin.root },
    { label: t('admin.users.title') },
  ],
  [paths.admin.masters]: (t) => [
    { label: t('nav.admin'), to: paths.admin.root },
    { label: t('admin.masters.title') },
  ],
  [paths.admin.leads]: (t) => [
    { label: t('nav.admin'), to: paths.admin.root },
    { label: t('leads.title') },
  ],
  [paths.admin.reviews]: (t) => [
    { label: t('nav.admin'), to: paths.admin.root },
    { label: t('admin.reviews.title') },
  ],
  [paths.admin.reports]: (t) => [
    { label: t('nav.admin'), to: paths.admin.root },
    { label: t('admin.reports.title') },
  ],
  [paths.admin.payments]: (t) => [
    { label: t('nav.admin'), to: paths.admin.root },
    { label: t('admin.payments.title') },
  ],
  [paths.admin.categories]: (t) => [
    { label: t('nav.admin'), to: paths.admin.root },
    { label: t('admin.categories.title') },
  ],
  [paths.admin.cities]: (t) => [
    { label: t('nav.admin'), to: paths.admin.root },
    { label: t('admin.cities.title') },
  ],
  [paths.admin.tariffs]: (t) => [
    { label: t('nav.admin'), to: paths.admin.root },
    { label: t('admin.tariffs.title') },
  ],
  [paths.admin.analytics]: (t) => [
    { label: t('nav.admin'), to: paths.admin.root },
    { label: t('dashboard.analytics') },
  ],
  [paths.admin.verificationRequests]: (t) => [
    { label: t('nav.admin'), to: paths.admin.root },
    { label: t('verification.requests') },
  ],
  [paths.admin.security]: (t) => [
    { label: t('nav.admin'), to: paths.admin.root },
    { label: t('security.title') },
  ],
  [paths.admin.system]: (t) => [
    { label: t('nav.admin'), to: paths.admin.root },
    { label: t('admin.system.title') },
  ],
  [paths.admin.audit]: (t) => [
    { label: t('nav.admin'), to: paths.admin.root },
    { label: t('admin.audit.title') },
  ],
  [paths.dashboard.root]: (t) => [{ label: t('dashboard.title') }],
  [paths.dashboard.profile]: (t) => [
    { label: t('dashboard.title'), to: paths.dashboard.root },
    { label: t('dashboard.profile') },
  ],
  [paths.dashboard.leads]: (t) => [
    { label: t('dashboard.title'), to: paths.dashboard.root },
    { label: t('leads.title') },
  ],
  [paths.dashboard.reviews]: (t) => [
    { label: t('dashboard.title'), to: paths.dashboard.root },
    { label: t('dashboard.reviews') },
  ],
  [paths.dashboard.payments]: (t) => [
    { label: t('dashboard.title'), to: paths.dashboard.root },
    { label: t('dashboard.payments') },
  ],
  [paths.dashboard.analytics]: (t) => [
    { label: t('dashboard.title'), to: paths.dashboard.root },
    { label: t('dashboard.analytics') },
  ],
  [paths.dashboard.promotions]: (t) => [
    { label: t('dashboard.title'), to: paths.dashboard.root },
    { label: t('dashboard.promotions') },
  ],
  [paths.dashboard.bookings]: (t) => [
    { label: t('dashboard.title'), to: paths.dashboard.root },
    { label: t('dashboard.bookings') },
  ],
  [paths.dashboard.files]: (t) => [
    { label: t('dashboard.title'), to: paths.dashboard.root },
    { label: t('dashboard.files') },
  ],
  [paths.dashboard.services]: (t) => [
    { label: t('dashboard.title'), to: paths.dashboard.root },
    { label: t('dashboard.services') },
  ],
  [paths.dashboard.chat]: (t) => [
    { label: t('dashboard.title'), to: paths.dashboard.root },
    { label: t('dashboard.chat') },
  ],
  [paths.dashboard.subscription]: (t) => [
    { label: t('dashboard.title'), to: paths.dashboard.root },
    { label: t('dashboard.subscription') },
  ],
  [paths.dashboard.notifications]: (t) => [
    { label: t('dashboard.title'), to: paths.dashboard.root },
    { label: t('dashboard.notifications') },
  ],
  [paths.dashboard.referrals]: (t) => [
    { label: t('dashboard.title'), to: paths.dashboard.root },
    { label: t('referrals.title') },
  ],
  [paths.dashboard.portfolio]: (t) => [
    { label: t('dashboard.title'), to: paths.dashboard.root },
    { label: t('dashboard.portfolio') },
  ],
  [paths.dashboard.security]: (t) => [
    { label: t('dashboard.title'), to: paths.dashboard.root },
    { label: t('dashboard.security') },
  ],
  [paths.dashboard.verification]: (t) => [
    { label: t('dashboard.title'), to: paths.dashboard.root },
    { label: t('dashboard.verification') },
  ],
  [paths.clientDashboard.root]: (t) => [{ label: t('nav.clientDashboard') }],
  [paths.clientDashboard.leads]: (t) => [
    { label: t('nav.clientDashboard'), to: paths.clientDashboard.root },
    { label: t('leads.title') },
  ],
  [paths.clientDashboard.favorites]: (t) => [
    { label: t('nav.clientDashboard'), to: paths.clientDashboard.root },
    { label: t('favorites.title') },
  ],
  [paths.clientDashboard.reports]: (t) => [
    { label: t('nav.clientDashboard'), to: paths.clientDashboard.root },
    { label: t('clientDashboard.reports') },
  ],
  [paths.clientDashboard.profile]: (t) => [
    { label: t('nav.clientDashboard'), to: paths.clientDashboard.root },
    { label: t('clientDashboard.profile') },
  ],
  [paths.clientDashboard.bookings]: (t) => [
    { label: t('nav.clientDashboard'), to: paths.clientDashboard.root },
    { label: t('clientDashboard.myBookings') },
  ],
  [paths.clientDashboard.security]: (t) => [
    { label: t('nav.clientDashboard'), to: paths.clientDashboard.root },
    { label: t('dashboard.security') },
  ],
};

function getCrumbsForPath(pathname: string, t: TFunction): Crumb[] {
  const base = pathname.replace(/\/$/, '') || '/';
  const exact = pathToCrumbs[base];
  if (exact) return exact(t);

  if (
    base.startsWith(`${paths.admin.masters}/`) ||
    base.match(/^\/admin\/[^/]+\/[^/]+/)
  ) {
    const parent = base.replace(/\/[^/]+$/, '');
    const parentCrumbs =
      pathToCrumbs[parent]?.(t) ?? [
        { label: t('nav.admin'), to: paths.admin.root },
      ];
    return [...parentCrumbs, { label: t('common.details') }];
  }
  if (base.startsWith(`${paths.dashboard.leads}/`)) {
    return [
      { label: t('dashboard.title'), to: paths.dashboard.root },
      { label: t('leads.title'), to: paths.dashboard.leads },
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
