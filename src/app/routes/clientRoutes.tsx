import { ClientRoute } from '@/features/auth/ClientRoute';
import { ClientDashboardLayout } from '@/components/layout/ClientDashboardLayout';
import { LazyPage } from './LazyPage';
import * as P from './lazyPages';

export const clientRoutes = {
  element: <ClientRoute />,
  children: [
    {
      path: 'client-dashboard',
      element: <ClientDashboardLayout />,
      children: [
        { index: true, element: <LazyPage><P.ClientDashboardPage /></LazyPage> },
        { path: 'bookings', element: <LazyPage><P.ClientBookingsPage /></LazyPage> },
        { path: 'leads/:leadId/book', element: <LazyPage><P.ClientRequestBookingPage /></LazyPage> },
        { path: 'lead-success/:leadId', element: <LazyPage><P.RequestSuccessPage /></LazyPage> },
        { path: 'booking-success/:leadId', element: <LazyPage><P.BookingSuccessPage /></LazyPage> },
        { path: 'leads', element: <LazyPage><P.ClientRequestsPage /></LazyPage> },
        { path: 'favorites', element: <LazyPage><P.ClientFavoritesPage /></LazyPage> },
        { path: 'reports', element: <LazyPage><P.ClientReportsPage /></LazyPage> },
        { path: 'profile', element: <LazyPage><P.ClientProfilePage /></LazyPage> },
        { path: 'security', element: <LazyPage><P.SecuritySettingsPage /></LazyPage> },
        { path: 'chat', element: <LazyPage><P.ClientChatPage /></LazyPage> },
        { path: 'chat/:conversationId', element: <LazyPage><P.ClientChatPage /></LazyPage> },
        { path: 'referrals', element: <LazyPage><P.ReferralPage /></LazyPage> },
      ],
    },
  ],
};
