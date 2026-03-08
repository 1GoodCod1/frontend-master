import React, { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { PublicRoute, MasterRoute, AdminRoute, PlanRoute } from '@/features/auth/guards';
import { ClientRoute } from '@/features/auth/ClientRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ClientDashboardLayout } from '@/components/layout/ClientDashboardLayout';
import { LoadingState } from '@/components/common/States';
import { RouteErrorBoundary } from '@/components/common/RouteErrorBoundary';

// Public pages
const HomePage = lazy(() => import('@/pages/public/HomePage'));
const MastersPage = lazy(() => import('@/pages/public/MastersPage'));
const MasterDetailsPage = lazy(() => import('@/pages/public/MasterDetailsPage'));
const PlansPage = lazy(() => import('@/pages/public/PlansPage'));
const PaymentOptionsPage = lazy(() => import('@/pages/public/PaymentOptionsPage'));
const PaymentSuccessPage = lazy(() => import('@/pages/public/PaymentSuccessPage'));
const FAQPage = lazy(() => import('@/pages/public/FAQPage'));
const HowItWorksPage = lazy(() => import('@/pages/public/HowItWorksPage'));
const ContactsPage = lazy(() => import('@/pages/public/ContactsPage'));
const PrivacyPolicyPage = lazy(() => import('@/pages/public/PrivacyPolicyPage'));
const TermsOfUsePage = lazy(() => import('@/pages/public/TermsOfUsePage'));
const NotFoundPage = lazy(() => import('@/pages/public/NotFoundPage'));

// Auth pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));

// Master pages
const DashboardPage = lazy(() => import('@/pages/master/DashboardPage'));
const ProfilePage = lazy(() => import('@/pages/master/ProfilePage'));
const LeadsPage = lazy(() => import('@/pages/master/LeadsPage'));
const LeadDetailsPage = lazy(() => import('@/pages/master/LeadDetailsPage'));
const ReviewsPage = lazy(() => import('@/pages/master/ReviewsPage'));
const PaymentsPage = lazy(() => import('@/pages/master/PaymentsPage'));
const AnalyticsPage = lazy(() => import('@/pages/master/AnalyticsPage'));
const FilesPage = lazy(() => import('@/pages/master/FilesPage'));
const PortfolioPage = lazy(() => import('@/pages/master/PortfolioPage'));
const MasterSecuritySettingsPage = lazy(() => import('@/pages/master/SecuritySettingsPage'));
const NotificationsSettingsPage = lazy(() => import('@/pages/master/NotificationsSettingsPage'));
const VerificationPage = lazy(() => import('@/pages/master/VerificationPage'));
const PromotionsPage = lazy(() => import('@/pages/master/PromotionsPage'));
const ServicesPage = lazy(() => import('@/pages/master/ServicesPage'));
const BookingsPage = lazy(() => import('@/pages/master/BookingsPage'));
const MasterChatPage = lazy(() => import('@/pages/master/ChatPage'));
const SubscriptionPage = lazy(() => import('@/pages/master/SubscriptionPage'));

// Admin pages
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const UsersPage = lazy(() => import('@/pages/admin/UsersPage'));
const MastersAdminPage = lazy(() => import('@/pages/admin/MastersAdminPage'));
const LeadsAdminPage = lazy(() => import('@/pages/admin/LeadsAdminPage'));
const ReviewsAdminPage = lazy(() => import('@/pages/admin/ReviewsAdminPage'));
const PaymentsAdminPage = lazy(() => import('@/pages/admin/PaymentsAdminPage'));
const CategoriesAdminPage = lazy(() => import('@/pages/admin/CategoriesAdminPage'));
const CitiesAdminPage = lazy(() => import('@/pages/admin/CitiesAdminPage'));
const TariffAdminPage = lazy(() => import('@/pages/admin/TariffAdminPage'));
const AnalyticsAdminPage = lazy(() => import('@/pages/admin/AnalyticsAdminPage'));
const SystemPage = lazy(() => import('@/pages/admin/SystemPage'));
const AuditPage = lazy(() => import('@/pages/admin/AuditPage'));
const SecurityPage = lazy(() => import('@/pages/admin/SecurityPage'));
const VerificationRequestsPage = lazy(() => import('@/pages/admin/VerificationRequestsPage'));
const DigestAdminPage = lazy(() => import('@/pages/admin/DigestAdminPage'));
const ReportsAdminPage = lazy(() => import('@/pages/admin/ReportsAdminPage'));
// Client pages
const ClientDashboardPage = lazy(() => import('@/pages/client/ClientDashboardPage'));
const ClientBookingsPage = lazy(() => import('@/pages/client/ClientBookingsPage'));
const ClientLeadBookPage = lazy(() => import('@/pages/client/ClientLeadBookPage'));
const ClientLeadsPage = lazy(() => import('@/pages/client/ClientLeadsPage'));
const ReferralPage = lazy(() => import('@/pages/referrals/ReferralPage'));
const ClientFavoritesPage = lazy(() => import('@/pages/client/ClientFavoritesPage'));
const ClientReportsPage = lazy(() => import('@/pages/client/ClientReportsPage'));
const ClientProfilePage = lazy(() => import('@/pages/client/ClientProfilePage'));
const SecuritySettingsPage = lazy(() => import('@/pages/client/SecuritySettingsPage'));
const ClientChatPage = lazy(() => import('@/pages/client/ChatPage'));
const LeadSuccessPage = lazy(() => import('@/pages/client/LeadSuccessPage'));

// Wrapper для Suspense
const LazyPage = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingState fullScreen />}>
    {children}
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <LazyPage><HomePage /></LazyPage> },
      { path: 'masters', element: <LazyPage><MastersPage /></LazyPage> },
      { path: 'masters/:slug', element: <Suspense fallback={null}><MasterDetailsPage /></Suspense> },
      { path: 'plans', element: <LazyPage><PlansPage /></LazyPage> },
      { path: 'plans/checkout', element: <LazyPage><PaymentOptionsPage /></LazyPage> },
      { path: 'plans/checkout/success', element: <LazyPage><PaymentSuccessPage /></LazyPage> },
      { path: 'faq', element: <LazyPage><FAQPage /></LazyPage> },
      { path: 'how-it-works', element: <LazyPage><HowItWorksPage /></LazyPage> },
      { path: 'contact', element: <LazyPage><ContactsPage /></LazyPage> },
      { path: 'privacy', element: <LazyPage><PrivacyPolicyPage /></LazyPage> },
      { path: 'terms', element: <LazyPage><TermsOfUsePage /></LazyPage> },

      {
        element: <PublicRoute />,
        children: [
          { path: 'login', element: <LazyPage><LoginPage /></LazyPage> },
          { path: 'register', element: <LazyPage><RegisterPage /></LazyPage> },
          { path: 'forgot-password', element: <LazyPage><ForgotPasswordPage /></LazyPage> },
          { path: 'reset-password', element: <LazyPage><ResetPasswordPage /></LazyPage> },
        ],
      },

      {
        element: <MasterRoute />,
        children: [
          {
            path: 'dashboard',
            element: <DashboardLayout />,
            children: [
              { index: true, element: <LazyPage><DashboardPage /></LazyPage> },
              { path: 'profile', element: <LazyPage><ProfilePage /></LazyPage> },
              { path: 'services', element: <LazyPage><ServicesPage /></LazyPage> },
              { path: 'leads', element: <LazyPage><LeadsPage /></LazyPage> },
              { path: 'leads/:id', element: <LazyPage><LeadDetailsPage /></LazyPage> },
              { path: 'reviews', element: <LazyPage><ReviewsPage /></LazyPage> },
              { path: 'payments', element: <LazyPage><PaymentsPage /></LazyPage> },
              { path: 'subscription', element: <LazyPage><SubscriptionPage /></LazyPage> },
              {
                element: <PlanRoute min="VIP" />,
                children: [{ path: 'analytics', element: <LazyPage><AnalyticsPage /></LazyPage> }],
              },
              { path: 'promotions', element: <LazyPage><PromotionsPage /></LazyPage> },
              { path: 'bookings', element: <LazyPage><BookingsPage /></LazyPage> },
              { path: 'files', element: <LazyPage><FilesPage /></LazyPage> },
              { path: 'portfolio', element: <LazyPage><PortfolioPage /></LazyPage> },
              { path: 'security', element: <LazyPage><MasterSecuritySettingsPage /></LazyPage> },
              { path: 'notifications', element: <LazyPage><NotificationsSettingsPage /></LazyPage> },
              { path: 'verification', element: <LazyPage><VerificationPage /></LazyPage> },
              { path: 'referrals', element: <LazyPage><ReferralPage /></LazyPage> },
              { path: 'chat', element: <LazyPage><MasterChatPage /></LazyPage> },
              { path: 'chat/:conversationId', element: <LazyPage><MasterChatPage /></LazyPage> },
            ],
          },
        ],
      },

      {
        element: <ClientRoute />,
        children: [
          {
            path: 'client-dashboard',
            element: <ClientDashboardLayout />,
            children: [
              { index: true, element: <LazyPage><ClientDashboardPage /></LazyPage> },
              { path: 'bookings', element: <LazyPage><ClientBookingsPage /></LazyPage> },
              { path: 'leads/:leadId/book', element: <LazyPage><ClientLeadBookPage /></LazyPage> },
              { path: 'lead-success/:leadId', element: <LazyPage><LeadSuccessPage /></LazyPage> },
              { path: 'leads', element: <LazyPage><ClientLeadsPage /></LazyPage> },
              { path: 'favorites', element: <LazyPage><ClientFavoritesPage /></LazyPage> },
              { path: 'reports', element: <LazyPage><ClientReportsPage /></LazyPage> },
              { path: 'profile', element: <LazyPage><ClientProfilePage /></LazyPage> },
              { path: 'security', element: <LazyPage><SecuritySettingsPage /></LazyPage> },
              { path: 'chat', element: <LazyPage><ClientChatPage /></LazyPage> },
              { path: 'chat/:conversationId', element: <LazyPage><ClientChatPage /></LazyPage> },
              { path: 'referrals', element: <LazyPage><ReferralPage /></LazyPage> },
            ],
          },
        ],
      },

      {
        element: <AdminRoute />,
        children: [
          {
            path: 'admin',
            element: <AdminLayout />,
            children: [
              { index: true, element: <LazyPage><AdminDashboardPage /></LazyPage> },
              { path: 'users', element: <LazyPage><UsersPage /></LazyPage> },
              { path: 'masters', element: <LazyPage><MastersAdminPage /></LazyPage> },
              { path: 'leads', element: <LazyPage><LeadsAdminPage /></LazyPage> },
              { path: 'reviews', element: <LazyPage><ReviewsAdminPage /></LazyPage> },
              { path: 'reports', element: <LazyPage><ReportsAdminPage /></LazyPage> },
              { path: 'payments', element: <LazyPage><PaymentsAdminPage /></LazyPage> },
              { path: 'categories', element: <LazyPage><CategoriesAdminPage /></LazyPage> },
              { path: 'cities', element: <LazyPage><CitiesAdminPage /></LazyPage> },
              { path: 'tariffs', element: <LazyPage><TariffAdminPage /></LazyPage> },
              { path: 'analytics', element: <LazyPage><AnalyticsAdminPage /></LazyPage> },
              { path: 'system', element: <LazyPage><SystemPage /></LazyPage> },
              { path: 'audit', element: <LazyPage><AuditPage /></LazyPage> },
              { path: 'security', element: <LazyPage><SecurityPage /></LazyPage> },
              { path: 'verification-requests', element: <LazyPage><VerificationRequestsPage /></LazyPage> },
              { path: 'digest', element: <LazyPage><DigestAdminPage /></LazyPage> },
            ],
          },
        ],
      },
      { path: '*', element: <LazyPage><NotFoundPage /></LazyPage> },
    ],
  },
]);
