/**
 * Единый источник сегментов и абсолютных путей приложения.
 * Сегменты — для `path` в React Router (без ведущего `/`).
 * `paths` — для `<Link to>`, `navigate()`, `location.pathname` сравнений.
 */

function j(...parts: string[]): string {
  const s = parts.filter(Boolean).join('/');
  return s ? `/${s}` : '/';
}

/** Сегменты URL (как в `path` у роутов, без начального слэша) */
export const routeSeg = {
  masters: 'masters',
  companii: 'companii',
  plans: 'plans',
  checkout: 'checkout',
  success: 'success',
  faq: 'faq',
  howItWorks: 'how-it-works',
  contact: 'contact',
  privacy: 'privacy',
  terms: 'terms',
  login: 'login',
  register: 'register',
  forgotPassword: 'forgot-password',
  resetPassword: 'reset-password',
  oauthCallback: 'oauth-callback',
  completeProfile: 'complete-profile',
  dashboard: 'dashboard',
  profile: 'profile',
  services: 'services',
  leads: 'leads',
  reviews: 'reviews',
  payments: 'payments',
  subscription: 'subscription',
  analytics: 'analytics',
  promotions: 'promotions',
  bookings: 'bookings',
  files: 'files',
  portfolio: 'portfolio',
  security: 'security',
  notifications: 'notifications',
  verification: 'verification',
  referrals: 'referrals',
  chat: 'chat',
  clients: 'clients',
  clientDashboard: 'client-dashboard',
  book: 'book',
  leadSuccess: 'lead-success',
  bookingSuccess: 'booking-success',
  favorites: 'favorites',
  reports: 'reports',
  admin: 'admin',
  users: 'users',
  categories: 'categories',
  cities: 'cities',
  tariffs: 'tariffs',
  system: 'system',
  audit: 'audit',
  verificationRequests: 'verification-requests',
  digest: 'digest',
  compliance: 'compliance',
  jobs: 'jobs',
  jobCreate: 'create',
  applications: 'applications',
} as const;

export const paths = {
  home: '/',

  masters: j(routeSeg.masters),
  masterProfile: (slug: string) => j(routeSeg.masters, slug),

  companii: j(routeSeg.companii),

  plans: j(routeSeg.plans),
  plansCheckout: j(routeSeg.plans, routeSeg.checkout),
  plansCheckoutSuccess: j(routeSeg.plans, routeSeg.checkout, routeSeg.success),

  faq: j(routeSeg.faq),
  categories: j(routeSeg.categories),
  howItWorks: j(routeSeg.howItWorks),
  contact: j(routeSeg.contact),
  privacy: j(routeSeg.privacy),
  terms: j(routeSeg.terms),

  login: j(routeSeg.login),
  register: j(routeSeg.register),
  forgotPassword: j(routeSeg.forgotPassword),
  resetPassword: j(routeSeg.resetPassword),
  oauthCallback: j('auth', routeSeg.oauthCallback),
  completeProfile: j('auth', routeSeg.completeProfile),

  dashboard: {
    root: j(routeSeg.dashboard),
    profile: j(routeSeg.dashboard, routeSeg.profile),
    services: j(routeSeg.dashboard, routeSeg.services),
    leads: j(routeSeg.dashboard, routeSeg.leads),
    lead: (id: string) => j(routeSeg.dashboard, routeSeg.leads, id),
    reviews: j(routeSeg.dashboard, routeSeg.reviews),
    payments: j(routeSeg.dashboard, routeSeg.payments),
    subscription: j(routeSeg.dashboard, routeSeg.subscription),
    analytics: j(routeSeg.dashboard, routeSeg.analytics),
    promotions: j(routeSeg.dashboard, routeSeg.promotions),
    bookings: j(routeSeg.dashboard, routeSeg.bookings),
    files: j(routeSeg.dashboard, routeSeg.files),
    portfolio: j(routeSeg.dashboard, routeSeg.portfolio),
    security: j(routeSeg.dashboard, routeSeg.security),
    notifications: j(routeSeg.dashboard, routeSeg.notifications),
    verification: j(routeSeg.dashboard, routeSeg.verification),
    referrals: j(routeSeg.dashboard, routeSeg.referrals),
    chat: j(routeSeg.dashboard, routeSeg.chat),
    chatConversation: (conversationId: string) =>
      j(routeSeg.dashboard, routeSeg.chat, conversationId),
    clients: j(routeSeg.dashboard, routeSeg.clients),
  },

  clientDashboard: {
    root: j(routeSeg.clientDashboard),
    bookings: j(routeSeg.clientDashboard, routeSeg.bookings),
    leadBook: (leadId: string) =>
      j(routeSeg.clientDashboard, routeSeg.leads, leadId, routeSeg.book),
    leadSuccess: (leadId: string) =>
      j(routeSeg.clientDashboard, routeSeg.leadSuccess, leadId),
    bookingSuccess: (leadId: string) =>
      j(routeSeg.clientDashboard, routeSeg.bookingSuccess, leadId),
    leads: j(routeSeg.clientDashboard, routeSeg.leads),
    favorites: j(routeSeg.clientDashboard, routeSeg.favorites),
    reports: j(routeSeg.clientDashboard, routeSeg.reports),
    profile: j(routeSeg.clientDashboard, routeSeg.profile),
    security: j(routeSeg.clientDashboard, routeSeg.security),
    chat: j(routeSeg.clientDashboard, routeSeg.chat),
    chatConversation: (conversationId: string) =>
      j(routeSeg.clientDashboard, routeSeg.chat, conversationId),
    referrals: j(routeSeg.clientDashboard, routeSeg.referrals),
    jobs: j(routeSeg.clientDashboard, routeSeg.jobs),
    jobsCreate: j(routeSeg.clientDashboard, routeSeg.jobs, routeSeg.jobCreate),
  },

  jobs: {
    list: j(routeSeg.jobs),
    detail: (id: string) => j(routeSeg.jobs, id),
  },
  
  admin: {
    root: j(routeSeg.admin),
    users: j(routeSeg.admin, routeSeg.users),
    masters: j(routeSeg.admin, routeSeg.masters),
    leads: j(routeSeg.admin, routeSeg.leads),
    reviews: j(routeSeg.admin, routeSeg.reviews),
    reports: j(routeSeg.admin, routeSeg.reports),
    payments: j(routeSeg.admin, routeSeg.payments),
    categories: j(routeSeg.admin, routeSeg.categories),
    cities: j(routeSeg.admin, routeSeg.cities),
    tariffs: j(routeSeg.admin, routeSeg.tariffs),
    analytics: j(routeSeg.admin, routeSeg.analytics),
    system: j(routeSeg.admin, routeSeg.system),
    audit: j(routeSeg.admin, routeSeg.audit),
    security: j(routeSeg.admin, routeSeg.security),
    verificationRequests: j(routeSeg.admin, routeSeg.verificationRequests),
    digest: j(routeSeg.admin, routeSeg.digest),
    compliance: j(routeSeg.admin, routeSeg.compliance),
  },
} as const;

/** Набор «прочих» публичных страниц (как в AppShellMain) */
export const OTHER_PUBLIC_PATHS = [
  paths.companii,
  paths.categories,
  paths.faq,
  paths.howItWorks,
  paths.contact,
  paths.privacy,
  paths.terms,
  paths.jobs.list,
] as const;
