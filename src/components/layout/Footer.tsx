import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthed, selectRole } from '@/features/auth/selectors';
import { USER_ROLE } from '@/constants/roles';
import { useCallback, useState } from 'react';
import { DigestSubscriptionCard } from '@/features/digest/DigestSubscriptionCard';
import { CookiePreferencesModal } from '@/features/cookie-consent/CookiePreferencesModal';
import { paths } from '@/constants/routes';
import { cn } from '@/lib/utils';

type FooterLink = {
  to: string;
  label: string;
};

type FooterColumnProps = {
  title: string;
  links: FooterLink[];
  linkClass: string;
};

function FooterColumn({ title, links, linkClass }: FooterColumnProps) {
  return (
    <div>
      <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#868E96] dark:text-white/45">
        {title}
      </h4>
      <nav className="flex flex-col gap-1">
        {links.map((item) => (
          <RouterLink key={item.to + item.label} to={item.to} className={linkClass}>
            {item.label}
          </RouterLink>
        ))}
      </nav>
    </div>
  );
}

export function Footer() {
  const { t } = useTranslation();
  const isAuthed = useAppSelector(selectIsAuthed);
  const role = useAppSelector(selectRole);
  const colorMode = useAppSelector((s) => s.ui.colorMode);
  const [prefsModalOpen, setPrefsModalOpen] = useState(false);
  const [prefsOpenKey, setPrefsOpenKey] = useState(0);

  const linkClass = cn(
    'text-[13px] text-[#495057] dark:text-white/70',
    'transition-colors duration-200',
    'hover:text-[#E97525] dark:hover:text-[#E97525]',
    'py-0.5 w-fit',
  );

  const showDigest = isAuthed && role !== USER_ROLE.ADMIN;

  const handleManageCookies = useCallback(() => {
    setPrefsOpenKey((k) => k + 1);
    setPrefsModalOpen(true);
  }, []);

  const platformLinks: FooterLink[] = [
    { to: paths.masters, label: t('footer.specialists') },
    { to: paths.categories, label: t('footer.categories') },
    { to: paths.jobs.list, label: t('footer.jobs') },
    { to: paths.companii, label: t('footer.companii') },
  ];

  const resourceLinks: FooterLink[] = [
    { to: paths.home, label: t('footer.home') },
    { to: paths.plans, label: t('footer.plans') },
    { to: paths.howItWorks, label: t('footer.howItWorks') },
    { to: paths.faq, label: t('footer.faq') },
    { to: paths.contact, label: t('footer.contact') },
  ];

  const accountLinks: FooterLink[] = isAuthed
    ? []
    : [
        { to: paths.login, label: t('footer.login') },
        { to: paths.register, label: t('footer.register') },
      ];

  const legalLinks: FooterLink[] = [
    { to: paths.privacy, label: t('footer.privacy') },
    { to: paths.terms, label: t('footer.terms') },
  ];

  return (
    <footer className="mt-auto w-full border-t border-[#E9ECEF] dark:border-white/[0.08] bg-[#FAFAF8] dark:bg-[#141210]">
      {showDigest && <DigestSubscriptionCard />}

      <div className="px-4 py-10 sm:px-6 lg:px-8 pb-[max(2.5rem,env(safe-area-inset-bottom,0px))]">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
            <div className="sm:col-span-2 lg:col-span-5">
              <RouterLink
                to={paths.home}
                className="inline-flex items-center gap-2.5 group mb-4"
              >
                <img
                  src={colorMode === 'dark' ? '/brand/logo-dark.svg' : '/brand/logo-light.svg'}
                  alt={t('appName')}
                  className="h-9 w-auto transition-transform hover:scale-[1.02]"
                />
              </RouterLink>
              <p className="text-[13px] leading-relaxed text-[#6C757D] dark:text-white/55 max-w-sm">
                {t('footer.aboutDescription')}
              </p>
              <span
                className={cn(
                  'inline-flex mt-4 items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold',
                  'bg-[#E97525]/10 text-[#c45f1a] dark:bg-[#E97525]/15 dark:text-[#E97525]',
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#E97525]" aria-hidden />
                {t('footer.moldovaBadge')}
              </span>
            </div>

            <div className="lg:col-span-2 lg:col-start-7">
              <FooterColumn title={t('footer.platform')} links={platformLinks} linkClass={linkClass} />
            </div>

            <div className="lg:col-span-2">
              <FooterColumn
                title={t('footer.resources')}
                links={resourceLinks}
                linkClass={linkClass}
              />
            </div>

            <div className="lg:col-span-3">
              <FooterColumn title={t('footer.legal')} links={legalLinks} linkClass={linkClass} />
              {!isAuthed && accountLinks.length > 0 ? (
                <div className="mt-6">
                  <FooterColumn
                    title={t('footer.account')}
                    links={accountLinks}
                    linkClass={linkClass}
                  />
                </div>
              ) : null}
              <button
                type="button"
                onClick={handleManageCookies}
                className={cn(linkClass, 'mt-3 text-left')}
              >
                {t('cookieConsent.manageCookies')}
              </button>
            </div>
          </div>

          <CookiePreferencesModal
            key={prefsOpenKey}
            open={prefsModalOpen}
            onOpenChange={setPrefsModalOpen}
          />

          <div className="mt-10 pt-6 border-t border-[#E9ECEF] dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-[12px] text-[#868E96] dark:text-white/40">
              © {new Date().getFullYear()} {t('appName')}. {t('footer.copyright')}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <RouterLink to={paths.privacy} className="text-[12px] text-[#868E96] hover:text-[#E97525] transition-colors">
                {t('footer.privacy')}
              </RouterLink>
              <RouterLink to={paths.terms} className="text-[12px] text-[#868E96] hover:text-[#E97525] transition-colors">
                {t('footer.terms')}
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
