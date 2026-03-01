import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const FAQSection = () => {
  const { t } = useTranslation();

  const faqs = [
    { q: 'faq.q1.question', a: 'faq.q1.answer' },
    { q: 'faq.q2.question', a: 'faq.q2.answer' },
    { q: 'faq.q3.question', a: 'faq.q3.answer' },
    { q: 'faq.q4.question', a: 'faq.q4.answer' },
    { q: 'faq.q5.question', a: 'faq.q5.answer' },
    { q: 'faq.q6.question', a: 'faq.q6.answer' },
  ];

  return (
    <section className="mt-12 flex flex-col items-center md:mt-16">
      <div className="mb-10 max-w-[600px] text-center">
        <div className="mb-2 flex items-center justify-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary dark:bg-orange-500/15 dark:text-orange-400">
            <HelpCircle className="h-6 w-6" />
          </span>
          <h2 className="text-2xl font-semibold text-foreground md:text-[1.75rem]">
            {t('faq.title')}
          </h2>
        </div>
        <p className="text-muted-foreground">{t('faq.subtitle')}</p>
      </div>

      <div className="w-full max-w-[720px] overflow-hidden rounded-xl border border-border bg-card shadow-sm dark:shadow-black/20">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`} className="border-border">
              <AccordionTrigger className="px-4 py-3 sm:py-4 text-left text-sm sm:text-base font-semibold hover:no-underline md:px-6 min-h-[48px] sm:min-h-0 hover:bg-muted/50">
                {t(f.q)}
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-0.5 text-muted-foreground leading-relaxed md:px-6">
                {t(f.a)}
              </AccordionContent>
            </AccordionItem>
          ))}
          <AccordionItem value="item-7" className="border-0 border-border border-b">
            <AccordionTrigger className="px-4 py-3 sm:py-4 text-left text-sm sm:text-base font-semibold hover:no-underline md:px-6 min-h-[48px] sm:min-h-0 hover:bg-muted/50">
              {t('faq.q7.question')}
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-0.5 text-muted-foreground leading-relaxed md:px-6">
              {t('faq.q7.answer')}{' '}
              <RouterLink
                to="/contact"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {t('footer.contact')}
              </RouterLink>{' '}
              {t('faq.q7.linkSuffix')}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
};
