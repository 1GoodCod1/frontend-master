import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Users, Wrench, HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { SEOHead } from '@/components/seo/SEOHead';
import { PageHeader } from '@/components/ui/PageHeader';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { cn } from '@/lib/utils';

type FAQItem = {
  questionKey: string;
  answerKey: string;
  linkSuffixKey?: string;
};

const FAQ_SECTIONS: { categoryKey: string; icon: React.ElementType; items: FAQItem[] }[] = [
  {
    categoryKey: 'faq.categories.forClients',
    icon: Users,
    items: [
      { questionKey: 'faq.q1.question', answerKey: 'faq.q1.answer' },
      { questionKey: 'faq.q2.question', answerKey: 'faq.q2.answer' },
      { questionKey: 'faq.q3.question', answerKey: 'faq.q3.answer' },
      { questionKey: 'faq.q4.question', answerKey: 'faq.q4.answer' },
      { questionKey: 'faq.q5.question', answerKey: 'faq.q5.answer' },
      { questionKey: 'faq.q6.question', answerKey: 'faq.q6.answer' },
    ],
  },
  {
    categoryKey: 'faq.categories.forMasters',
    icon: Wrench,
    items: [
      { questionKey: 'faq.q7.question', answerKey: 'faq.q7.answer' },
      { questionKey: 'faq.q8.question', answerKey: 'faq.q8.answer' },
      { questionKey: 'faq.q9.question', answerKey: 'faq.q9.answer' },
      { questionKey: 'faq.q10.question', answerKey: 'faq.q10.answer' },
    ],
  },
  {
    categoryKey: 'faq.categories.general',
    icon: HelpCircle,
    items: [
      { questionKey: 'faq.q11.question', answerKey: 'faq.q11.answer' },
      { questionKey: 'faq.q12.question', answerKey: 'faq.q12.answer', linkSuffixKey: 'faq.q12.linkSuffix' },
    ],
  },
];

export default function FAQPage() {
  const { t } = useTranslation();

  return (
    <>
      <SEOHead
        title={t('faq.title')}
        description={t('faq.subtitle')}
        keywords="FAQ Master-Hub, вопросы, Moldova мастера"
      />
      <div className="mh-page-enter container max-w-3xl mx-auto py-6 md:py-8 px-4">
      <PageHeader title={t('faq.title')} subtitle={t('faq.subtitle')} />

      <div className="space-y-10">
        {FAQ_SECTIONS.map((section, sectionIndex) => {
          const Icon = section.icon;
          return (
            <ScrollReveal key={section.categoryKey}>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary dark:bg-primary/20 dark:text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h2 className="text-lg font-semibold text-foreground">
                    {t(section.categoryKey)}
                  </h2>
                </div>
                <div className="rounded-xl bg-muted/30 dark:bg-muted/20 overflow-hidden">
                  <Accordion type="single" collapsible className="w-full">
                    {section.items.map((item, itemIndex) => (
                      <AccordionItem
                        key={item.questionKey}
                        value={`section-${sectionIndex}-item-${itemIndex}`}
                        className="px-4"
                      >
                        <AccordionTrigger className="text-left font-semibold hover:no-underline py-5 hover:bg-muted/50 dark:hover:bg-muted/30 transition-colors duration-200">
                          {t(item.questionKey)}
                        </AccordionTrigger>
                        <AccordionContent className="pb-5 pt-0 overflow-hidden">
                          <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                            {t(item.answerKey)}
                            {item.linkSuffixKey && (
                              <>
                                {' '}
                                <RouterLink
                                  to="/contact"
                                  className={cn(
                                    'text-primary font-medium no-underline hover:underline'
                                  )}
                                >
                                  {t('footer.contact')}
                                </RouterLink>{' '}
                                {t(item.linkSuffixKey)}
                              </>
                            )}
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </div>
    </>
  );
}
