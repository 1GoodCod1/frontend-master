import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const LAST_UPDATED = Date.now();

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
    <div className="mx-auto max-w-3xl px-4 py-6 md:py-8">
      <PageHeader
        title={t('terms.title')}
        subtitle={t('terms.subtitle')}
        crumbs={[
          { label: t('nav.home'), to: '/' },
          { label: t('footer.terms') },
        ]}
      />

      <Card className="overflow-hidden border-border shadow-sm">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <p className="text-sm font-medium text-muted-foreground">
            {t('terms.lastUpdated')}: {LAST_UPDATED}
          </p>

          <p className="leading-7">{t('terms.intro')}</p>

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

          <h2 className="text-lg font-bold">{t('terms.contactTitle')}</h2>
          <p className="leading-7 text-muted-foreground">{t('terms.contactP1')}</p>
          <ul className="list-inside list-disc space-y-1 pl-2 text-muted-foreground">
            <li>
              {t('terms.contactEmail')}:{' '}
              <a href="mailto:support@master-hub.md" className="font-medium text-primary hover:underline">
                support@master-hub.md
              </a>
            </li>
            <li>
              {t('terms.contactAddress')}:{' '}
              <RouterLink to="/contact" className="font-medium text-primary hover:underline">
                /contact
              </RouterLink>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
