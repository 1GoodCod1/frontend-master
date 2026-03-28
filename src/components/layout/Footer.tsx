import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthed, selectRole } from '@/features/auth/selectors';
import { useCallback, useState } from 'react';
import { DigestSubscriptionCard } from '@/features/digest/DigestSubscriptionCard';
import { CookiePreferencesModal } from '@/features/cookie-consent/CookiePreferencesModal';
import { paths } from '@/constants/routes';

export function Footer() {
  const { t } = useTranslation();
  const isAuthed = useAppSelector(selectIsAuthed);
  const role = useAppSelector(selectRole);
  const [prefsModalOpen, setPrefsModalOpen] = useState(false);
  const [prefsOpenKey, setPrefsOpenKey] = useState(0);
  const linkClass =
    'text-xs sm:text-sm text-muted-foreground transition-colors hover:text-cta dark:text-muted-foreground dark:hover:text-cta underline-offset-2 hover:underline py-1 sm:py-0.5 min-h-[36px] sm:min-h-0 flex items-center';

  const showDigest = isAuthed && role !== 'ADMIN';

  const handleManageCookies = useCallback(() => {
    setPrefsOpenKey((k) => k + 1);
    setPrefsModalOpen(true);
  }, []);

  return (
    <footer className="mt-auto w-full bg-[hsl(var(--background))] dark:bg-[#171510]">
      <div className="divider-line" aria-hidden />
      {/* Digest — auth only, persisted in DB, no email input */}
      {showDigest && <DigestSubscriptionCard />}

      {/* Main footer */}
      <div className="px-4 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] sm:px-5 sm:pt-6 md:px-6 md:pt-8 md:pb-[max(2rem,env(safe-area-inset-bottom,0px))] lg:px-8 lg:pt-10 lg:pb-[max(2.5rem,env(safe-area-inset-bottom,0px))]">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-12 gap-5 sm:gap-6 md:gap-x-8 md:gap-y-6 lg:gap-8 justify-between gap-y-5 sm:gap-y-6 lg:gap-y-8">
            <div className="col-span-12 lg:col-span-4 md:text-center lg:text-left">
              <div className="mb-1.5 sm:mb-2 flex items-center gap-2 justify-center md:justify-center lg:justify-start">
                <img
                  src="/brand/favicon.svg"
                  alt=""
                  className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8"
                  width={32}
                  height={32}
                />
                <h3 className="text-base sm:text-lg font-bold sm:font-extrabold tracking-tight">
                  {t('appName')}
                </h3>
              </div>
              <p className="text-xs sm:text-sm leading-snug sm:leading-relaxed text-muted-foreground max-w-md md:mx-auto lg:mx-0">
                {t('footer.aboutDescription')}
              </p>
            </div>

            <div className="col-span-6 md:col-span-6 lg:col-span-2 md:flex md:flex-col md:items-center lg:items-start">
              <h4 className="mb-1.5 sm:mb-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('footer.quickLinks')}
              </h4>
              <nav className="flex flex-col gap-0.5 sm:gap-1">
                <RouterLink to={paths.masters} className={linkClass}>
                  {t('footer.masters')}
                </RouterLink>
                <RouterLink to={paths.plans} className={linkClass}>
                  {t('footer.plans')}
                </RouterLink>
                <RouterLink to={paths.howItWorks} className={linkClass}>
                  {t('footer.howItWorks')}
                </RouterLink>
                <RouterLink to={paths.faq} className={linkClass}>
                  {t('footer.faq')}
                </RouterLink>
                {!isAuthed && (
                  <RouterLink to={paths.login} className={linkClass}>
                    {t('nav.login')}
                  </RouterLink>
                )}
              </nav>
            </div>

            <div className="col-span-6 md:col-span-6 lg:col-span-2 md:flex md:flex-col md:items-center lg:items-start">
              <h4 className="mb-1.5 sm:mb-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('footer.support')}
              </h4>
              <nav className="flex flex-col gap-0.5 sm:gap-1">
                <RouterLink to={paths.contact} className={linkClass}>
                  {t('footer.contact')}
                </RouterLink>
                <RouterLink to={paths.privacy} className={linkClass}>
                  {t('footer.privacy')}
                </RouterLink>
                <RouterLink to={paths.terms} className={linkClass}>
                  {t('footer.terms')}
                </RouterLink>
                <button
                  type="button"
                  onClick={handleManageCookies}
                  className={linkClass}
                >
                  {t('cookieConsent.manageCookies')}
                </button>
              </nav>
            </div>
          </div>

          <CookiePreferencesModal
            key={prefsOpenKey}
            open={prefsModalOpen}
            onOpenChange={setPrefsModalOpen}
          />

          <div className="mt-6 sm:mt-8 md:mt-10">
            <div className="divider-line" aria-hidden />
            <p className="pt-4 sm:pt-5 md:pt-6 text-xs sm:text-sm text-muted-foreground text-center lg:text-left">
              © {new Date().getFullYear()} {t('appName')}. {t('footer.copyright')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
