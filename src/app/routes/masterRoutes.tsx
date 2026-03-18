import { MasterRoute, PlanRoute } from '@/features/auth/guards';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LazyPage } from './LazyPage';
import * as P from './lazyPages';

export const masterRoutes = {
  element: <MasterRoute />,
  children: [
    {
      path: 'dashboard',
      element: <DashboardLayout />,
      children: [
        { index: true, element: <LazyPage><P.DashboardPage /></LazyPage> },
        { path: 'profile', element: <LazyPage><P.ProfilePage /></LazyPage> },
        { path: 'services', element: <LazyPage><P.ServicesPage /></LazyPage> },
        { path: 'leads', element: <LazyPage><P.LeadsPage /></LazyPage> },
        { path: 'leads/:id', element: <LazyPage><P.LeadDetailsPage /></LazyPage> },
        { path: 'reviews', element: <LazyPage><P.ReviewsPage /></LazyPage> },
        { path: 'payments', element: <LazyPage><P.PaymentsPage /></LazyPage> },
        { path: 'subscription', element: <LazyPage><P.SubscriptionPage /></LazyPage> },
        {
          element: <PlanRoute min="VIP" />,
          children: [{ path: 'analytics', element: <LazyPage><P.AnalyticsPage /></LazyPage> }],
        },
        {
          element: <PlanRoute min="PREMIUM" />,
          children: [{ path: 'promotions', element: <LazyPage><P.PromotionsPage /></LazyPage> }],
        },
        { path: 'bookings', element: <LazyPage><P.BookingsPage /></LazyPage> },
        { path: 'files', element: <LazyPage><P.FilesPage /></LazyPage> },
        { path: 'portfolio', element: <LazyPage><P.PortfolioPage /></LazyPage> },
        { path: 'security', element: <LazyPage><P.MasterSecuritySettingsPage /></LazyPage> },
        { path: 'notifications', element: <LazyPage><P.NotificationsSettingsPage /></LazyPage> },
        { path: 'verification', element: <LazyPage><P.VerificationPage /></LazyPage> },
        { path: 'referrals', element: <LazyPage><P.ReferralPage /></LazyPage> },
        { path: 'chat', element: <LazyPage><P.MasterChatPage /></LazyPage> },
        { path: 'chat/:conversationId', element: <LazyPage><P.MasterChatPage /></LazyPage> },
      ],
    },
  ],
};
