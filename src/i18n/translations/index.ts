import { mergeTranslationSlices } from '../utils';
import { app } from './app';
import { nav } from './nav';
import { common } from './common';
import { notifications } from './notifications';
import { theme } from './theme';
import { cookieConsent } from './cookieConsent';
import { verificationBanner } from './verificationBanner';
import { home } from './home';
import { faq } from './faq';
import { contact } from './contact';
import { howItWorks } from './howItWorks';
import { auth } from './auth';
import { masters } from './masters';
import { masterDetails } from './masterDetails';
import { dashboard } from './dashboard';
import { profile } from './profile';
import { leads } from './leads';
import { reviews } from './reviews';
import { payments } from './payments';
import { analyticsPage } from './analyticsPage';
import { files } from './files';
import { plans } from './plans';
import { admin } from './admin';
import { bookings } from './bookings';
import { clientDashboard } from './clientDashboard';
import { clientProfile } from './clientProfile';
import { reports } from './reports';
import { favorites } from './favorites';
import { export_ } from './export';
import { loading } from './loading';
import { footer } from './footer';
import { privacy } from './privacy';
import { terms } from './terms';
import { verification } from './verification';
import { security } from './security';
import { unsaved } from './unsaved';
import { master } from './master';
import { notificationSettings } from './notificationSettings';
import { paymentOptions } from './paymentOptions';
import { subscription } from './subscription';
import { citiesCategories } from './citiesCategories';
import { promotionsPage } from './promotionsPage';
import { servicesPage } from './servicesPage';
import { portfolio } from './portfolio';
import { leadSuccess } from './leadSuccess';
import { referrals } from './referrals';
import { digest } from './digest';
import { dataGrid } from './dataGrid';
import { compliance } from './compliance';

const modules = [
  app,
  nav,
  common,
  notifications,
  theme,
  cookieConsent,
  verificationBanner,
  home,
  faq,
  contact,
  howItWorks,
  auth,
  masters,
  masterDetails,
  dashboard,
  profile,
  leads,
  reviews,
  payments,
  analyticsPage,
  files,
  plans,
  admin,
  bookings,
  clientDashboard,
  clientProfile,
  reports,
  favorites,
  export_,
  loading,
  footer,
  privacy,
  terms,
  verification,
  security,
  unsaved,
  master,
  notificationSettings,
  paymentOptions,
  subscription,
  citiesCategories,
  promotionsPage,
  servicesPage,
  portfolio,
  leadSuccess,
  referrals,
  digest,
  dataGrid,
  compliance,
];

export const resources = {
  en: {
    translation: mergeTranslationSlices(
      ...modules.map((m) => m.en as Record<string, unknown>)
    ),
  },
  ru: {
    translation: mergeTranslationSlices(
      ...modules.map((m) => m.ru as Record<string, unknown>)
    ),
  },
  ro: {
    translation: mergeTranslationSlices(
      ...modules.map((m) => m.ro as Record<string, unknown>)
    ),
  },
};
