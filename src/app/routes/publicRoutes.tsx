import { Suspense } from 'react';
import { routeSeg } from '@/constants/routes';
import { LazyPage } from './LazyPage';
import * as P from './lazyPages';

const plansCheckout = `${routeSeg.plans}/${routeSeg.checkout}`;
const plansCheckoutSuccess = `${plansCheckout}/${routeSeg.success}`;

export const publicRoutes = [
  { index: true, element: <LazyPage><P.HomePage /></LazyPage> },
  { path: routeSeg.masters, element: <LazyPage><P.MastersPage /></LazyPage> },
  {
    path: `${routeSeg.masters}/:slug`,
    element: <Suspense fallback={null}><P.MasterDetailsPage /></Suspense>,
  },
  { path: routeSeg.plans, element: <LazyPage><P.PlansPage /></LazyPage> },
  { path: plansCheckout, element: <LazyPage><P.PaymentOptionsPage /></LazyPage> },
  { path: plansCheckoutSuccess, element: <LazyPage><P.PaymentSuccessPage /></LazyPage> },
  { path: routeSeg.faq, element: <LazyPage><P.FAQPage /></LazyPage> },
  { path: routeSeg.howItWorks, element: <LazyPage><P.HowItWorksPage /></LazyPage> },
  { path: routeSeg.contact, element: <LazyPage><P.ContactsPage /></LazyPage> },
  { path: routeSeg.privacy, element: <LazyPage><P.PrivacyPolicyPage /></LazyPage> },
  { path: routeSeg.terms, element: <LazyPage><P.TermsOfUsePage /></LazyPage> },
  { path: routeSeg.jobs, element: <LazyPage><P.PublicJobsPage /></LazyPage> },
  { path: `${routeSeg.jobs}/:id`, element: <LazyPage><P.PublicJobDetailPage /></LazyPage> },
];
