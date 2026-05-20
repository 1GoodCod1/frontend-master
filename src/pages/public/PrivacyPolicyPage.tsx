import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { surfaceCardCls } from '@/lib/surfaceCard';
import {
  SUPPORT_EMAIL,
  SUPPORT_MAILTO,
  TELEGRAM_HANDLE,
  TELEGRAM_URL,
  COMPANY_NAME,
  COMPANY_IDNO,
  COMPANY_ADDRESS,
} from '@/config/support';

const LAST_UPDATED = '2026-03-28';

export default function PrivacyPolicyPage() {
  const { t } = useTranslation();

  const sections = [
    { title: t('privacy.section1Title'), p: [t('privacy.section1P1'), t('privacy.section1P2'), t('privacy.section1P3')] },
    { title: t('privacy.section2Title'), p: [t('privacy.section2P1'), t('privacy.section2P2')] },
    { title: t('privacy.section3Title'), p: [t('privacy.section3P1')] },
    { title: t('privacy.section3aTitle'), p: [t('privacy.section3aP1')] },
    { title: t('privacy.section4Title'), p: [t('privacy.section4P1')] },
    { title: t('privacy.section5Title'), p: [t('privacy.section5P1')] },
    { title: t('privacy.section6Title'), p: [t('privacy.section6P1')] },
    { title: t('privacy.section7Title'), p: [t('privacy.section7P1')] },
    { title: t('privacy.section8Title'), p: [t('privacy.section8P1')] },
    { title: t('privacy.section9Title'), p: [t('privacy.section9P1')] },
  ];

  return (
    <>
      <SEOHead
        title={t('privacy.title')}
        description={t('privacy.subtitle')}
        noindex
      />
      <div className="mx-auto max-w-3xl px-4 py-6 md:py-8">
      <PageHeader
        title={t('privacy.title')}
        subtitle={t('privacy.subtitle')}
        crumbs={[
          { label: t('nav.home'), to: '/' },
          { label: t('footer.privacy') },
        ]}
      />

      <Card
        className={cn(
          'overflow-hidden rounded-2xl',
          surfaceCardCls,
        )}
      >
        <CardContent className="space-y-6 p-6 sm:p-8">
          <p className="text-xs font-mono uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
            {t('privacy.lastUpdated')}: {LAST_UPDATED}
          </p>

          <p className="leading-7 text-slate-700 dark:text-slate-300">
            {t('privacy.intro', { COMPANY_NAME, IDNO: COMPANY_IDNO, LEGAL_ADDRESS: COMPANY_ADDRESS })}
          </p>

          {sections.map((section, index) => (
            <div key={index} className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">
                {section.title}
              </h2>
              {section.p.map((paragraph, pIndex) => (
                <p key={pIndex} className="leading-7 text-slate-600 dark:text-slate-400">
                  {paragraph}
                </p>
              ))}
            </div>
          ))}

          <Separator className="my-6 bg-gray-200/60 dark:bg-white/[0.06]" />

          <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">
            {t('privacy.contactTitle')}
          </h2>
          <p className="leading-7 text-slate-600 dark:text-slate-400">
            {t('privacy.contactP1')}
          </p>
          <ul className="list-inside list-disc space-y-1 pl-2 text-slate-600 dark:text-slate-400">
            <li>
              {t('privacy.contactEmail')}:{' '}
              <a
                href={SUPPORT_MAILTO}
                className="font-semibold text-primary dark:text-[#E97525] hover:underline"
              >
                {SUPPORT_EMAIL}
              </a>
            </li>
            <li>
              {t('contact.telegram')}:{' '}
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary dark:text-[#E97525] hover:underline"
              >
                {TELEGRAM_HANDLE}
              </a>
            </li>
            <li>
              {t('privacy.contactAddress')}:{' '}
              <RouterLink
                to="/contact"
                className="font-semibold text-primary dark:text-[#E97525] hover:underline"
              >
                /contact
              </RouterLink>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
