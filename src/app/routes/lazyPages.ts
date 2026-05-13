import { lazyWithRetry } from '@/utils/lazyWithRetry';

export const HomePage = lazyWithRetry(() => import('@/pages/public/HomePage'));
export const MastersPage = lazyWithRetry(() => import('@/pages/public/MastersPage'));
export const MasterDetailsPage = lazyWithRetry(() => import('@/pages/public/MasterDetailsPage'));
export const PlansPage = lazyWithRetry(() => import('@/pages/public/PlansPage'));
export const PaymentOptionsPage = lazyWithRetry(() => import('@/pages/checkout/PaymentOptionsPage'));
export const PaymentSuccessPage = lazyWithRetry(() => import('@/pages/checkout/PaymentSuccessPage'));
export const FAQPage = lazyWithRetry(() => import('@/pages/public/FAQPage'));
export const HowItWorksPage = lazyWithRetry(() => import('@/pages/public/HowItWorksPage'));
export const ContactsPage = lazyWithRetry(() => import('@/pages/public/ContactsPage'));
export const PrivacyPolicyPage = lazyWithRetry(() => import('@/pages/public/PrivacyPolicyPage'));
export const TermsOfUsePage = lazyWithRetry(() => import('@/pages/public/TermsOfUsePage'));
export const NotFoundPage = lazyWithRetry(() => import('@/pages/public/NotFoundPage'));

export const LoginPage = lazyWithRetry(() => import('@/pages/auth/LoginPage'));
export const RegisterPage = lazyWithRetry(() => import('@/pages/auth/RegisterPage'));
export const ForgotPasswordPage = lazyWithRetry(() => import('@/pages/auth/ForgotPasswordPage'));
export const ResetPasswordPage = lazyWithRetry(() => import('@/pages/auth/ResetPasswordPage'));
export const OAuthCallbackPage = lazyWithRetry(() => import('@/pages/auth/OAuthCallbackPage'));
export const OAuthCompletePage = lazyWithRetry(() => import('@/pages/auth/OAuthCompletePage'));

export const DashboardPage = lazyWithRetry(() => import('@/pages/master/DashboardPage'));
export const ProfilePage = lazyWithRetry(() => import('@/pages/master/ProfilePage'));
export const RequestsPage = lazyWithRetry(() => import('@/pages/master/RequestsPage'));
export const RequestDetailsPage = lazyWithRetry(() => import('@/pages/master/RequestDetailsPage'));
export const ReviewsPage = lazyWithRetry(() => import('@/pages/master/ReviewsPage'));
export const PaymentsPage = lazyWithRetry(() => import('@/pages/master/PaymentsPage'));
export const AnalyticsPage = lazyWithRetry(() => import('@/pages/master/AnalyticsPage'));
export const FilesPage = lazyWithRetry(() => import('@/pages/master/FilesPage'));
export const PortfolioPage = lazyWithRetry(() => import('@/pages/master/PortfolioPage'));
export const MasterSecuritySettingsPage = lazyWithRetry(() => import('@/pages/master/SecuritySettingsPage'));
export const NotificationsSettingsPage = lazyWithRetry(() => import('@/pages/master/NotificationsSettingsPage'));
export const VerificationPage = lazyWithRetry(() => import('@/pages/master/VerificationPage'));
export const PromotionsPage = lazyWithRetry(() => import('@/pages/master/PromotionsPage'));
export const ServicesPage = lazyWithRetry(() => import('@/pages/master/ServicesPage'));
export const BookingsPage = lazyWithRetry(() => import('@/pages/master/BookingsPage'));
export const MasterChatPage = lazyWithRetry(() => import('@/pages/master/ChatPage'));
export const ClientsPage = lazyWithRetry(() => import('@/pages/master/ClientsPage'));
export const SubscriptionPage = lazyWithRetry(() => import('@/pages/master/SubscriptionPage'));

export const AdminDashboardPage = lazyWithRetry(() => import('@/pages/admin/AdminDashboardPage'));
export const UsersPage = lazyWithRetry(() => import('@/pages/admin/UsersPage'));
export const MastersAdminPage = lazyWithRetry(() => import('@/pages/admin/MastersAdminPage'));
export const RequestsAdminPage = lazyWithRetry(() => import('@/pages/admin/RequestsAdminPage'));
export const ReviewsAdminPage = lazyWithRetry(() => import('@/pages/admin/ReviewsAdminPage'));
export const PaymentsAdminPage = lazyWithRetry(() => import('@/pages/admin/PaymentsAdminPage'));
export const CategoriesAdminPage = lazyWithRetry(() => import('@/pages/admin/CategoriesAdminPage'));
export const CitiesAdminPage = lazyWithRetry(() => import('@/pages/admin/CitiesAdminPage'));
export const TariffAdminPage = lazyWithRetry(() => import('@/pages/admin/TariffAdminPage'));
export const AnalyticsAdminPage = lazyWithRetry(() => import('@/pages/admin/AnalyticsAdminPage'));
export const SystemPage = lazyWithRetry(() => import('@/pages/admin/SystemPage'));
export const AuditPage = lazyWithRetry(() => import('@/pages/admin/AuditPage'));
export const SecurityPage = lazyWithRetry(() => import('@/pages/admin/SecurityPage'));
export const VerificationRequestsPage = lazyWithRetry(() => import('@/pages/admin/VerificationRequestsPage'));
export const DigestAdminPage = lazyWithRetry(() => import('@/pages/admin/DigestAdminPage'));
export const ReportsAdminPage = lazyWithRetry(() => import('@/pages/admin/ReportsAdminPage'));
export const CompliancePage = lazyWithRetry(() => import('@/pages/admin/CompliancePage'));

export const ClientDashboardPage = lazyWithRetry(() => import('@/pages/client/ClientDashboardPage'));
export const ClientBookingsPage = lazyWithRetry(() => import('@/pages/client/ClientBookingsPage'));
export const ClientRequestBookingPage = lazyWithRetry(() => import('@/pages/client/ClientRequestBookingPage'));
export const ClientRequestsPage = lazyWithRetry(() => import('@/pages/client/ClientRequestsPage'));
export const ClientFavoritesPage = lazyWithRetry(() => import('@/pages/client/ClientFavoritesPage'));
export const ClientReportsPage = lazyWithRetry(() => import('@/pages/client/ClientReportsPage'));
export const ClientProfilePage = lazyWithRetry(() => import('@/pages/client/ClientProfilePage'));
export const SecuritySettingsPage = lazyWithRetry(() => import('@/pages/client/SecuritySettingsPage'));
export const ClientChatPage = lazyWithRetry(() => import('@/pages/client/ChatPage'));
export const RequestSuccessPage = lazyWithRetry(() => import('@/pages/client/RequestSuccessPage'));
export const BookingSuccessPage = lazyWithRetry(() => import('@/pages/client/BookingSuccessPage'));

export const ReferralPage = lazyWithRetry(() => import('@/pages/referrals/ReferralPage'));

// Jobs
export const PublicJobsPage = lazyWithRetry(() => import('@/pages/public/PublicJobsPage'));
export const PublicJobDetailPage = lazyWithRetry(() => import('@/pages/public/PublicJobDetailPage'));
export const ClientJobsPage = lazyWithRetry(() => import('@/pages/client/ClientJobsPage'));
export const ClientCreateJobPage = lazyWithRetry(() => import('@/pages/client/ClientCreateJobPage'));
export const ClientJobDetailsPage = lazyWithRetry(() => import('@/pages/client/ClientJobDetailsPage'));
export const MasterApplicationsPage = lazyWithRetry(() => import('@/pages/master/MasterApplicationsPage'));
export const MasterJobApplyPage = lazyWithRetry(() => import('@/pages/master/MasterJobApplyPage'));
