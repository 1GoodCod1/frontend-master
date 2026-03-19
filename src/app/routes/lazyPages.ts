import { lazy } from 'react';

export const HomePage = lazy(() => import('@/pages/public/HomePage'));
export const MastersPage = lazy(() => import('@/pages/public/MastersPage'));
export const MasterDetailsPage = lazy(() => import('@/pages/public/MasterDetailsPage'));
export const PlansPage = lazy(() => import('@/pages/public/PlansPage'));
export const PaymentOptionsPage = lazy(() => import('@/pages/checkout/PaymentOptionsPage'));
export const PaymentSuccessPage = lazy(() => import('@/pages/checkout/PaymentSuccessPage'));
export const FAQPage = lazy(() => import('@/pages/public/FAQPage'));
export const HowItWorksPage = lazy(() => import('@/pages/public/HowItWorksPage'));
export const ContactsPage = lazy(() => import('@/pages/public/ContactsPage'));
export const PrivacyPolicyPage = lazy(() => import('@/pages/public/PrivacyPolicyPage'));
export const TermsOfUsePage = lazy(() => import('@/pages/public/TermsOfUsePage'));
export const NotFoundPage = lazy(() => import('@/pages/public/NotFoundPage'));

export const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
export const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
export const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
export const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));

export const DashboardPage = lazy(() => import('@/pages/master/DashboardPage'));
export const ProfilePage = lazy(() => import('@/pages/master/ProfilePage'));
export const LeadsPage = lazy(() => import('@/pages/master/LeadsPage'));
export const LeadDetailsPage = lazy(() => import('@/pages/master/LeadDetailsPage'));
export const ReviewsPage = lazy(() => import('@/pages/master/ReviewsPage'));
export const PaymentsPage = lazy(() => import('@/pages/master/PaymentsPage'));
export const AnalyticsPage = lazy(() => import('@/pages/master/AnalyticsPage'));
export const FilesPage = lazy(() => import('@/pages/master/FilesPage'));
export const PortfolioPage = lazy(() => import('@/pages/master/PortfolioPage'));
export const MasterSecuritySettingsPage = lazy(() => import('@/pages/master/SecuritySettingsPage'));
export const NotificationsSettingsPage = lazy(() => import('@/pages/master/NotificationsSettingsPage'));
export const VerificationPage = lazy(() => import('@/pages/master/VerificationPage'));
export const PromotionsPage = lazy(() => import('@/pages/master/PromotionsPage'));
export const ServicesPage = lazy(() => import('@/pages/master/ServicesPage'));
export const BookingsPage = lazy(() => import('@/pages/master/BookingsPage'));
export const MasterChatPage = lazy(() => import('@/pages/master/ChatPage'));
export const SubscriptionPage = lazy(() => import('@/pages/master/SubscriptionPage'));

export const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
export const UsersPage = lazy(() => import('@/pages/admin/UsersPage'));
export const MastersAdminPage = lazy(() => import('@/pages/admin/MastersAdminPage'));
export const LeadsAdminPage = lazy(() => import('@/pages/admin/LeadsAdminPage'));
export const ReviewsAdminPage = lazy(() => import('@/pages/admin/ReviewsAdminPage'));
export const PaymentsAdminPage = lazy(() => import('@/pages/admin/PaymentsAdminPage'));
export const CategoriesAdminPage = lazy(() => import('@/pages/admin/CategoriesAdminPage'));
export const CitiesAdminPage = lazy(() => import('@/pages/admin/CitiesAdminPage'));
export const TariffAdminPage = lazy(() => import('@/pages/admin/TariffAdminPage'));
export const AnalyticsAdminPage = lazy(() => import('@/pages/admin/AnalyticsAdminPage'));
export const SystemPage = lazy(() => import('@/pages/admin/SystemPage'));
export const AuditPage = lazy(() => import('@/pages/admin/AuditPage'));
export const SecurityPage = lazy(() => import('@/pages/admin/SecurityPage'));
export const VerificationRequestsPage = lazy(() => import('@/pages/admin/VerificationRequestsPage'));
export const DigestAdminPage = lazy(() => import('@/pages/admin/DigestAdminPage'));
export const ReportsAdminPage = lazy(() => import('@/pages/admin/ReportsAdminPage'));

export const ClientDashboardPage = lazy(() => import('@/pages/client/ClientDashboardPage'));
export const ClientBookingsPage = lazy(() => import('@/pages/client/ClientBookingsPage'));
export const ClientLeadBookPage = lazy(() => import('@/pages/client/ClientLeadBookPage'));
export const ClientLeadsPage = lazy(() => import('@/pages/client/ClientLeadsPage'));
export const ClientFavoritesPage = lazy(() => import('@/pages/client/ClientFavoritesPage'));
export const ClientReportsPage = lazy(() => import('@/pages/client/ClientReportsPage'));
export const ClientProfilePage = lazy(() => import('@/pages/client/ClientProfilePage'));
export const SecuritySettingsPage = lazy(() => import('@/pages/client/SecuritySettingsPage'));
export const ClientChatPage = lazy(() => import('@/pages/client/ChatPage'));
export const LeadSuccessPage = lazy(() => import('@/pages/client/LeadSuccessPage'));
export const DirectBookingPage = lazy(() => import('@/pages/client/DirectBookingPage'));

export const ReferralPage = lazy(() => import('@/pages/referrals/ReferralPage'));
