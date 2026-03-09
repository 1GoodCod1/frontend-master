import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthed, selectRole } from '@/features/auth/selectors';
import { useCallback, useState } from 'react';
import { DigestSubscriptionCard } from '@/features/digest/DigestSubscriptionCard';
import { CookiePreferencesModal } from '@/features/cookie-consent/CookiePreferencesModal';

export function Footer() {
  const { t } = useTranslation();
  const isAuthed = useAppSelector(selectIsAuthed);
  const role = useAppSelector(selectRole);
  const [prefsModalOpen, setPrefsModalOpen] = useState(false);
  const [prefsOpenKey, setPrefsOpenKey] = useState(0);
  const linkClass =
    'text-sm text-muted-foreground transition-colors hover:text-cta dark:text-muted-foreground dark:hover:text-cta underline-offset-2 hover:underline py-1.5 sm:py-0 min-h-[44px] sm:min-h-0 flex items-center';

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
      <div className="px-4 pt-8 pb-[max(2rem,env(safe-area-inset-bottom,0px))] md:px-6 md:pt-10 md:pb-[max(2.5rem,env(safe-area-inset-bottom,0px))] lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-12 gap-8 justify-between gap-y-8">
            <div className="col-span-12 md:col-span-4">
              <div className="mb-2 flex items-center gap-2">
                <img
                  src="/brand/favicon.svg"
                  alt=""
                  className="h-8 w-8"
                  width={32}
                  height={32}
                />
                <h3 className="text-lg font-extrabold tracking-tight">
                  {t('appName')}
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t('footer.aboutDescription')}
              </p>
            </div>

            <div className="col-span-6 sm:col-span-4 md:col-span-2">
              <h4 className="mb-2 text-sm font-bold tracking-wide">
                {t('footer.quickLinks')}
              </h4>
              <nav className="flex flex-col gap-1 sm:gap-2">
                <RouterLink to="/masters" className={linkClass}>
                  {t('footer.masters')}
                </RouterLink>
                <RouterLink to="/plans" className={linkClass}>
                  {t('footer.plans')}
                </RouterLink>
                <RouterLink to="/how-it-works" className={linkClass}>
                  {t('footer.howItWorks')}
                </RouterLink>
                <RouterLink to="/faq" className={linkClass}>
                  {t('footer.faq')}
                </RouterLink>
                {!isAuthed && (
                  <RouterLink to="/login" className={linkClass}>
                    {t('nav.login')}
                  </RouterLink>
                )}
              </nav>
            </div>

            <div className="col-span-6 sm:col-span-4 md:col-span-2">
              <h4 className="mb-2 text-sm font-bold tracking-wide">
                {t('footer.support')}
              </h4>
              <nav className="flex flex-col gap-1 sm:gap-2">
                <RouterLink to="/contact" className={linkClass}>
                  {t('footer.contact')}
                </RouterLink>
                <RouterLink to="/privacy" className={linkClass}>
                  {t('footer.privacy')}
                </RouterLink>
                <RouterLink to="/terms" className={linkClass}>
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

          <div className="mt-10">
            <div className="divider-line" aria-hidden />
            <p className="pt-6 text-sm text-muted-foreground text-center md:text-left">
              © {new Date().getFullYear()} {t('appName')}. {t('footer.copyright')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
