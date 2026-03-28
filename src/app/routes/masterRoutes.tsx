import { MasterRoute, PlanRoute } from '@/features/auth/guards';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { routeSeg } from '@/constants/routes';
import { LazyPage } from './LazyPage';
import * as P from './lazyPages';

export const masterRoutes = {
  element: <MasterRoute />,
  children: [
    {
      path: routeSeg.dashboard,
      element: <DashboardLayout />,
      children: [
        { index: true, element: <LazyPage><P.DashboardPage /></LazyPage> },
        { path: routeSeg.profile, element: <LazyPage><P.ProfilePage /></LazyPage> },
        { path: routeSeg.services, element: <LazyPage><P.ServicesPage /></LazyPage> },
        { path: routeSeg.leads, element: <LazyPage><P.RequestsPage /></LazyPage> },
        {
          path: `${routeSeg.leads}/:id`,
          element: <LazyPage><P.RequestDetailsPage /></LazyPage>,
        },
        { path: routeSeg.reviews, element: <LazyPage><P.ReviewsPage /></LazyPage> },
        { path: routeSeg.payments, element: <LazyPage><P.PaymentsPage /></LazyPage> },
        {
          path: routeSeg.subscription,
          element: <LazyPage><P.SubscriptionPage /></LazyPage>,
        },
        {
          element: <PlanRoute min="VIP" />,
          children: [
            {
              path: routeSeg.analytics,
              element: <LazyPage><P.AnalyticsPage /></LazyPage>,
            },
          ],
        },
        {
          element: <PlanRoute min="PREMIUM" />,
          children: [
            {
              path: routeSeg.promotions,
              element: <LazyPage><P.PromotionsPage /></LazyPage>,
            },
          ],
        },
        { path: routeSeg.bookings, element: <LazyPage><P.BookingsPage /></LazyPage> },
        { path: routeSeg.files, element: <LazyPage><P.FilesPage /></LazyPage> },
        {
          element: <PlanRoute min="VIP" />,
          children: [
            {
              path: routeSeg.portfolio,
              element: <LazyPage><P.PortfolioPage /></LazyPage>,
            },
          ],
        },
        {
          path: routeSeg.security,
          element: <LazyPage><P.MasterSecuritySettingsPage /></LazyPage>,
        },
        {
          path: routeSeg.notifications,
          element: <LazyPage><P.NotificationsSettingsPage /></LazyPage>,
        },
        {
          path: routeSeg.verification,
          element: <LazyPage><P.VerificationPage /></LazyPage>,
        },
        { path: routeSeg.referrals, element: <LazyPage><P.ReferralPage /></LazyPage> },
        { path: routeSeg.chat, element: <LazyPage><P.MasterChatPage /></LazyPage> },
        {
          path: `${routeSeg.chat}/:conversationId`,
          element: <LazyPage><P.MasterChatPage /></LazyPage>,
        },
      ],
    },
  ],
};
