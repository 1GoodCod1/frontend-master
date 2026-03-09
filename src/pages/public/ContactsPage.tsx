import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Mail, Phone, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ContactsPage() {
  const { t } = useTranslation();

  const contacts = [
    {
      icon: Mail,
      title: t('contact.email'),
      value: 'support@master-hub.md',
      link: 'mailto:support@master-hub.md',
      description: t('contact.emailDescription'),
    },
    {
      icon: Phone,
      title: t('contact.phone'),
      value: '+373 22 123 456',
      link: 'tel:+37322123456',
      description: t('contact.phoneDescription'),
    },
    {
      icon: Send,
      title: t('contact.telegram'),
      value: '@master_hub_support',
      link: 'https://t.me/master_hub_support',
      description: t('contact.telegramDescription'),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-background py-8 md:py-12"
    >
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
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.35 }}
              >
                <Card className="border-border overflow-hidden transition-all duration-250 hover:shadow-lg hover:-translate-y-0.5">
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
                        <Button variant="outline" asChild className="border-primary text-primary hover:bg-primary/10">
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
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.35 }}
          className="mt-10 text-center"
        >
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
        </motion.div>
      </div>
    </motion.div>
  );
}
