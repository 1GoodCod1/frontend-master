import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HelpCircle, ArrowRight } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { HOME_FAQS } from '@/constants';

export const FAQSection = () => {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col items-center md:mt-0">
      <div className="mb-10 max-w-[600px] text-center">
        <div className="mb-2 flex items-center justify-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary dark:bg-primary/25 dark:text-primary">
            <HelpCircle className="h-6 w-6" />
          </span>
          <h2 className="text-2xl font-semibold text-foreground md:text-[1.75rem]">
            {t('faq.title')}
          </h2>
        </div>
        <p className="text-muted-foreground">{t('faq.subtitle')}</p>
      </div>

      <div className="w-full max-w-[720px] overflow-hidden rounded-xl bg-muted/30 dark:bg-muted/20 shadow-sm">
        <Accordion type="single" collapsible className="w-full">
          {HOME_FAQS.map((f, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`} className="px-4 md:px-6">
              <AccordionTrigger className="py-3 sm:py-4 text-left text-sm sm:text-base font-semibold hover:no-underline min-h-[48px] sm:min-h-0 hover:bg-muted/50 dark:hover:bg-muted/30 transition-colors duration-200">
                {t(f.q)}
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-0.5 text-muted-foreground leading-relaxed overflow-hidden">
                {t(f.a)}
                {f.linkSuffix && (
                  <>
                    {' '}
                    <RouterLink
                      to="/contact"
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {t('footer.contact')}
                    </RouterLink>{' '}
                    {t(f.linkSuffix)}
                  </>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <Button variant="ghost" asChild className="mt-6 gap-2 text-primary hover:text-primary/90 hover:bg-primary/5">
        <RouterLink to="/faq">
          {t('faq.viewAll')}
          <ArrowRight className="h-4 w-4 text-primary/80" />
        </RouterLink>
      </Button>
    </section>
  );
};
