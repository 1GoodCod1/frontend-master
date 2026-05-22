import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, MessageCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { SectionHead } from '@/components/home/SectionHead';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { HOME_FAQS } from '@/constants';
import { paths } from '@/constants/routes';
import { cn } from '@/lib/utils';
import { surfaceCardCls } from '@/lib/surfaceCard';

const FAQ_ACCENT = '#6366F1';

export const FAQSection = () => {
  const { t } = useTranslation();

  const supportCard = (
    <div
      className={cn(
        'border border-[#E9ECEF] p-4 dark:border-white/10',
        surfaceCardCls,
      )}
    >
      <p className="text-sm font-semibold text-[#212529] dark:text-white">
        {t('faq.stillQuestionsTitle')}
      </p>
      <p className="mt-1.5 text-xs leading-relaxed text-[#6C757D] dark:text-white/50">
        {t('faq.stillQuestionsDesc')}
      </p>
      <Button
        asChild
        variant="outline"
        className="mt-3 h-9 w-full rounded-none border-[#E9ECEF] text-[13px] font-medium shadow-none hover:border-[#6366F1]/35 hover:bg-[#6366F1]/10 hover:text-[#4f46e5] dark:border-white/12"
      >
        <RouterLink to={paths.contact}>
          <MessageCircle className="size-3.5" strokeWidth={2} />
          {t('faq.contactCta')}
        </RouterLink>
      </Button>
    </div>
  );

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <SectionHead
            kicker={t('faq.kicker')}
            title={t('faq.title')}
            accent={FAQ_ACCENT}
            link={{ label: t('faq.viewAll'), href: paths.faq }}
            className="mb-4 lg:mb-5"
          />
          <p className="max-w-sm text-[13px] leading-relaxed text-[#6C757D] dark:text-white/50">
            {t('faq.subtitle')}
          </p>
          <div className="mt-6 hidden lg:block">{supportCard}</div>
        </div>

        <div className="min-w-0 lg:col-span-8">
          <ScrollReveal delay={0.04} duration={0.42}>
            <div
              className={cn(
                'w-full overflow-hidden rounded-none border shadow-none divide-y divide-[#E9ECEF] dark:divide-white/10',
                surfaceCardCls,
              )}
            >
              <Accordion type="single" collapsible className="w-full">
                {HOME_FAQS.map((f, idx) => (
                  <AccordionItem
                    key={idx}
                    value={`item-${idx}`}
                    className="border-0 px-0"
                  >
                    <AccordionTrigger
                      className={cn(
                        'gap-4 px-4 py-3.5 text-left text-sm font-semibold hover:no-underline sm:px-5 sm:py-4',
                        'text-[#212529] dark:text-white',
                        'hover:bg-[#FAFBFC] dark:hover:bg-white/[0.03]',
                        'data-[state=open]:bg-[#6366F1]/[0.04] data-[state=open]:text-[#4338ca] dark:data-[state=open]:text-[#a5b4fc]',
                      )}
                    >
                      {t(f.q)}
                    </AccordionTrigger>
                    <AccordionContent className="overflow-hidden px-4 pb-4 pt-0 text-xs leading-relaxed text-[#6C757D] dark:text-white/50 sm:px-5">
                      {t(f.a)}
                      {f.linkSuffix ? (
                        <>
                          {' '}
                          <RouterLink
                            to={paths.contact}
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
          </ScrollReveal>

          <Button
            variant="ghost"
            asChild
            className="mt-4 h-auto gap-1.5 p-0 text-[13px] font-medium text-[#E97525] hover:bg-transparent hover:text-[#d86920] lg:hidden"
          >
            <RouterLink to={paths.faq}>
              {t('faq.viewAll')}
              <ArrowRight className="size-3.5" strokeWidth={2} />
            </RouterLink>
          </Button>

          <div className="mt-5 lg:hidden">{supportCard}</div>
        </div>
      </div>
    </div>
  );
};
