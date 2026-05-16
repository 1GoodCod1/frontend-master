import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
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

export default function TermsOfUsePage() {
  const { t } = useTranslation();

  const sections = [
    { title: t('terms.section1Title'), p: [t('terms.section1P1')] },
    { title: t('terms.section2Title'), p: [t('terms.section2P1')] },
    { title: t('terms.section3Title'), p: [t('terms.section3P1')] },
    { title: t('terms.section4Title'), p: [t('terms.section4P1')] },
    { title: t('terms.section5Title'), p: [t('terms.section5P1')] },
    { title: t('terms.section6Title'), p: [t('terms.section6P1')] },
    { title: t('terms.section7Title'), p: [t('terms.section7P1')] },
    { title: t('terms.section8Title'), p: [t('terms.section8P1')] },
    { title: t('terms.section9Title'), p: [t('terms.section9P1')] },
    { title: t('terms.section10Title'), p: [t('terms.section10P1')] },
    { title: t('terms.section11Title'), p: [t('terms.section11P1')] },
  ];

  return (
    <>
      <SEOHead
        title={t('terms.title')}
        description={t('terms.subtitle')}
        noindex
      />
      <div className="mx-auto max-w-3xl px-4 py-6 md:py-8">
      <PageHeader
        title={t('terms.title')}
        subtitle={t('terms.subtitle')}
        crumbs={[
          { label: t('nav.home'), to: '/' },
          { label: t('footer.terms') },
        ]}
      />

      <Card
        className={cn(
          'overflow-hidden rounded-2xl',
          'bg-[#F9FAFB] dark:bg-[hsl(43,16%,12%)]',
          'border border-gray-200/80 dark:border-white/[0.08]',
          'shadow-sm dark:shadow-lg dark:shadow-black/20',
        )}
      >
        <CardContent className="space-y-6 p-6 sm:p-8">
          <p className="text-xs font-mono uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
            {t('terms.lastUpdated')}: {LAST_UPDATED}
          </p>

          <p className="leading-7 text-slate-700 dark:text-slate-300">
            {t('terms.intro', { COMPANY_NAME, IDNO: COMPANY_IDNO, LEGAL_ADDRESS: COMPANY_ADDRESS })}
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
            {t('terms.contactTitle')}
          </h2>
          <p className="leading-7 text-slate-600 dark:text-slate-400">
            {t('terms.contactP1')}
          </p>
          <ul className="list-inside list-disc space-y-1 pl-2 text-slate-600 dark:text-slate-400">
            <li>
              {t('terms.contactEmail')}:{' '}
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
              {t('terms.contactAddress')}:{' '}
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
