import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  SUPPORT_EMAIL,
  SUPPORT_MAILTO,
  TELEGRAM_HANDLE,
  TELEGRAM_URL,
} from '@/config/support';

const LAST_UPDATED = '2026-03-09';

export default function PrivacyPolicyPage() {
  const { t } = useTranslation();

  const sections = [
    { title: t('privacy.section1Title'), p: [t('privacy.section1P1'), t('privacy.section1P2'), t('privacy.section1P3')] },
    { title: t('privacy.section2Title'), p: [t('privacy.section2P1')] },
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

      <Card className="overflow-hidden border-border shadow-sm">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <p className="text-sm font-medium text-muted-foreground">
            {t('privacy.lastUpdated')}: {LAST_UPDATED}
          </p>

          <p className="leading-7">{t('privacy.intro')}</p>

          {sections.map((section, index) => (
            <div key={index} className="space-y-2">
              <h2 className="text-lg font-bold text-primary">{section.title}</h2>
              {section.p.map((paragraph, pIndex) => (
                <p key={pIndex} className="leading-7 text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </div>
          ))}

          <Separator className="my-6" />

          <h2 className="text-lg font-bold">{t('privacy.contactTitle')}</h2>
          <p className="leading-7 text-muted-foreground">{t('privacy.contactP1')}</p>
          <ul className="list-inside list-disc space-y-1 pl-2 text-muted-foreground">
            <li>
              {t('privacy.contactEmail')}:{' '}
              <a
                href={SUPPORT_MAILTO}
                className="font-medium text-primary hover:underline"
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
                className="font-medium text-primary hover:underline"
              >
                {TELEGRAM_HANDLE}
              </a>
            </li>
            <li>
              {t('privacy.contactAddress')}:{' '}
              <RouterLink to="/contact" className="font-medium text-primary hover:underline">
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
