import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { SectionHead } from '@/components/home/SectionHead';
import { HOME_FAQS } from '@/constants';
import { cn } from '@/lib/utils';
import { surfaceCardCls } from '@/lib/surfaceCard';

export const FAQSection = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full">
      <SectionHead kicker={t('faq.kicker')} title={t('faq.title')} accent="#6366F1" />

      <div className={cn('w-full max-w-[720px] overflow-hidden rounded-[18px]', surfaceCardCls)}>
        <Accordion type="single" collapsible className="w-full">
          {HOME_FAQS.map((f, idx) => (
            <AccordionItem
              key={idx}
              value={`item-${idx}`}
              className="border-[#E9ECEF] px-4 dark:border-white/10 md:px-6"
            >
              <AccordionTrigger className="min-h-[48px] py-3 text-left text-sm font-semibold text-[#212529] hover:bg-[#F8F9FA] hover:no-underline dark:text-white dark:hover:bg-white/[0.04] sm:min-h-0 sm:py-4">
                {t(f.q)}
              </AccordionTrigger>
              <AccordionContent className="overflow-hidden pb-4 pt-0.5 text-xs leading-relaxed text-[#6C757D] dark:text-white/50">
                {t(f.a)}
                {f.linkSuffix ? (
                  <>
                    {' '}
                    <RouterLink
                      to="/contact"
                      className="font-medium text-[#E97525] underline-offset-4 hover:underline"
                    >
                      {t('footer.contact')}
                    </RouterLink>{' '}
                    {t(f.linkSuffix)}
                  </>
                ) : null}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <Button
        variant="ghost"
        asChild
        className="mt-5 h-auto gap-1.5 p-0 text-[13px] font-medium text-[#E97525] hover:bg-transparent hover:text-[#d86920]"
      >
        <RouterLink to="/faq">
          {t('faq.viewAll')}
          <ArrowRight className="size-3.5" strokeWidth={2} />
        </RouterLink>
      </Button>
    </div>
  );
};
