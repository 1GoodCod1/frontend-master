import { AdminRoute } from '@/features/auth/guards';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { routeSeg } from '@/constants/routes';
import { LazyPage } from './LazyPage';
import * as P from './lazyPages';

export const adminRoutes = {
  element: <AdminRoute />,
  children: [
    {
      path: routeSeg.admin,
      element: <AdminLayout />,
      children: [
        { index: true, element: <LazyPage><P.AdminDashboardPage /></LazyPage> },
        { path: routeSeg.users, element: <LazyPage><P.UsersPage /></LazyPage> },
        {
          path: routeSeg.masters,
          element: <LazyPage><P.MastersAdminPage /></LazyPage>,
        },
        { path: routeSeg.leads, element: <LazyPage><P.RequestsAdminPage /></LazyPage> },
        {
          path: routeSeg.reviews,
          element: <LazyPage><P.ReviewsAdminPage /></LazyPage>,
        },
        {
          path: routeSeg.reports,
          element: <LazyPage><P.ReportsAdminPage /></LazyPage>,
        },
        {
          path: routeSeg.payments,
          element: <LazyPage><P.PaymentsAdminPage /></LazyPage>,
        },
        {
          path: routeSeg.categories,
          element: <LazyPage><P.CategoriesAdminPage /></LazyPage>,
        },
        { path: routeSeg.cities, element: <LazyPage><P.CitiesAdminPage /></LazyPage> },
        {
          path: routeSeg.tariffs,
          element: <LazyPage><P.TariffAdminPage /></LazyPage>,
        },
        {
          path: routeSeg.analytics,
          element: <LazyPage><P.AnalyticsAdminPage /></LazyPage>,
        },
        { path: routeSeg.system, element: <LazyPage><P.SystemPage /></LazyPage> },
        { path: routeSeg.audit, element: <LazyPage><P.AuditPage /></LazyPage> },
        {
          path: routeSeg.security,
          element: <LazyPage><P.SecurityPage /></LazyPage>,
        },
        {
          path: routeSeg.verificationRequests,
          element: <LazyPage><P.VerificationRequestsPage /></LazyPage>,
        },
        { path: routeSeg.digest, element: <LazyPage><P.DigestAdminPage /></LazyPage> },
        {
          path: routeSeg.compliance,
          element: <LazyPage><P.CompliancePage /></LazyPage>,
        },
      ],
    },
  ],
};
