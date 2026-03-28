import { ClientRoute } from '@/features/auth/ClientRoute';
import { ClientDashboardLayout } from '@/components/layout/ClientDashboardLayout';
import { routeSeg } from '@/constants/routes';
import { LazyPage } from './LazyPage';
import * as P from './lazyPages';

const clientLeadBook = `${routeSeg.leads}/:leadId/${routeSeg.book}`;
const clientLeadSuccess = `${routeSeg.leadSuccess}/:leadId`;
const clientBookingSuccess = `${routeSeg.bookingSuccess}/:leadId`;

export const clientRoutes = {
  element: <ClientRoute />,
  children: [
    {
      path: routeSeg.clientDashboard,
      element: <ClientDashboardLayout />,
      children: [
        { index: true, element: <LazyPage><P.ClientDashboardPage /></LazyPage> },
        {
          path: routeSeg.bookings,
          element: <LazyPage><P.ClientBookingsPage /></LazyPage>,
        },
        {
          path: clientLeadBook,
          element: <LazyPage><P.ClientRequestBookingPage /></LazyPage>,
        },
        {
          path: clientLeadSuccess,
          element: <LazyPage><P.RequestSuccessPage /></LazyPage>,
        },
        {
          path: clientBookingSuccess,
          element: <LazyPage><P.BookingSuccessPage /></LazyPage>,
        },
        { path: routeSeg.leads, element: <LazyPage><P.ClientRequestsPage /></LazyPage> },
        {
          path: routeSeg.favorites,
          element: <LazyPage><P.ClientFavoritesPage /></LazyPage>,
        },
        {
          path: routeSeg.reports,
          element: <LazyPage><P.ClientReportsPage /></LazyPage>,
        },
        {
          path: routeSeg.profile,
          element: <LazyPage><P.ClientProfilePage /></LazyPage>,
        },
        {
          path: routeSeg.security,
          element: <LazyPage><P.SecuritySettingsPage /></LazyPage>,
        },
        { path: routeSeg.chat, element: <LazyPage><P.ClientChatPage /></LazyPage> },
        {
          path: `${routeSeg.chat}/:conversationId`,
          element: <LazyPage><P.ClientChatPage /></LazyPage>,
        },
        { path: routeSeg.referrals, element: <LazyPage><P.ReferralPage /></LazyPage> },
      ],
    },
  ],
};
