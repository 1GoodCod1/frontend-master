import { Suspense } from 'react';
import { LazyPage } from './LazyPage';
import * as P from './lazyPages';

export const publicRoutes = [
  { index: true, element: <LazyPage><P.HomePage /></LazyPage> },
  { path: 'masters', element: <LazyPage><P.MastersPage /></LazyPage> },
  { path: 'masters/:slug', element: <Suspense fallback={null}><P.MasterDetailsPage /></Suspense> },
  { path: 'plans', element: <LazyPage><P.PlansPage /></LazyPage> },
  { path: 'plans/checkout', element: <LazyPage><P.PaymentOptionsPage /></LazyPage> },
  { path: 'plans/checkout/success', element: <LazyPage><P.PaymentSuccessPage /></LazyPage> },
  { path: 'faq', element: <LazyPage><P.FAQPage /></LazyPage> },
  { path: 'how-it-works', element: <LazyPage><P.HowItWorksPage /></LazyPage> },
  { path: 'contact', element: <LazyPage><P.ContactsPage /></LazyPage> },
  { path: 'privacy', element: <LazyPage><P.PrivacyPolicyPage /></LazyPage> },
  { path: 'terms', element: <LazyPage><P.TermsOfUsePage /></LazyPage> },
];
