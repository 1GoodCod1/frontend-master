import { AdminRoute } from '@/features/auth/guards';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { LazyPage } from './LazyPage';
import * as P from './lazyPages';

export const adminRoutes = {
  element: <AdminRoute />,
  children: [
    {
      path: 'admin',
      element: <AdminLayout />,
      children: [
        { index: true, element: <LazyPage><P.AdminDashboardPage /></LazyPage> },
        { path: 'users', element: <LazyPage><P.UsersPage /></LazyPage> },
        { path: 'masters', element: <LazyPage><P.MastersAdminPage /></LazyPage> },
        { path: 'leads', element: <LazyPage><P.RequestsAdminPage /></LazyPage> },
        { path: 'reviews', element: <LazyPage><P.ReviewsAdminPage /></LazyPage> },
        { path: 'reports', element: <LazyPage><P.ReportsAdminPage /></LazyPage> },
        { path: 'payments', element: <LazyPage><P.PaymentsAdminPage /></LazyPage> },
        { path: 'categories', element: <LazyPage><P.CategoriesAdminPage /></LazyPage> },
        { path: 'cities', element: <LazyPage><P.CitiesAdminPage /></LazyPage> },
        { path: 'tariffs', element: <LazyPage><P.TariffAdminPage /></LazyPage> },
        { path: 'analytics', element: <LazyPage><P.AnalyticsAdminPage /></LazyPage> },
        { path: 'system', element: <LazyPage><P.SystemPage /></LazyPage> },
        { path: 'audit', element: <LazyPage><P.AuditPage /></LazyPage> },
        { path: 'security', element: <LazyPage><P.SecurityPage /></LazyPage> },
        { path: 'verification-requests', element: <LazyPage><P.VerificationRequestsPage /></LazyPage> },
        { path: 'digest', element: <LazyPage><P.DigestAdminPage /></LazyPage> },
      ],
    },
  ],
};
