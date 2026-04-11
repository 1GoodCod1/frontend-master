import { useTranslation } from 'react-i18next';
import { SEOHead } from '@/components/seo/SEOHead';
import { Mail, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  SUPPORT_EMAIL,
  SUPPORT_MAILTO,
  TELEGRAM_HANDLE,
  TELEGRAM_URL,
} from '@/config/support';

export default function ContactsPage() {
  const { t } = useTranslation();

  const contacts = [
    {
      icon: Mail,
      title: t('contact.email'),
      value: SUPPORT_EMAIL,
      link: SUPPORT_MAILTO,
      description: t('contact.emailDescription'),
    },
    {
      icon: Send,
      title: t('contact.telegram'),
      value: TELEGRAM_HANDLE,
      link: TELEGRAM_URL,
      description: t('contact.telegramDescription'),
    },
  ];

  return (
    <>
      <SEOHead
        title={t('contact.title')}
        description={t('contact.subtitle')}
        keywords={t('contact.seoKeywords')}
      />
      <div className="faber-page-enter min-h-screen bg-background py-8 md:py-12">
        <div className="container max-w-2xl mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-3">
            {t('contact.title')}
          </h1>
          <p className="text-muted-foreground font-normal max-w-[600px] mx-auto leading-relaxed">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="space-y-4">
          {contacts.map((contact, index) => {
            const Icon = contact.icon;
            return (
              <div
                key={index}
                className="faber-page-enter"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <Card className="border-border overflow-hidden transition duration-250 hover:shadow-lg hover:-translate-y-0.5">
                  <CardContent className="p-6">
                    <div className="flex flex-row gap-4 items-start">
                      <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-primary text-primary-foreground shrink-0">
                        <Icon className="h-7 w-7" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-foreground mb-1">
                          {contact.title}
                        </h3>
                        <p className="text-muted-foreground mb-3">{contact.description}</p>
                        <Button variant="outline" asChild className="border-primary text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                          <a
                            href={contact.link}
                            target={contact.link.startsWith('http') ? '_blank' : undefined}
                            rel={contact.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                          >
                            {contact.value}
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        <div className="faber-page-enter mt-10 text-center" style={{ animationDelay: '240ms' }}>
          <Card className="border-border">
            <CardContent className="p-6">
              <p className="text-primary font-semibold text-lg mb-2 leading-relaxed">
                {t('contact.workingHours')}
              </p>
              <p className="text-muted-foreground text-sm">
                {t('contact.responseTime')}
              </p>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </>
  );
}
