import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { PageHeader } from '@/components/ui/PageHeader';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { cn } from '@/lib/utils';

export default function FAQPage() {
  const { t } = useTranslation();

  const faqs = [
    { question: t('faq.q1.question'), answer: t('faq.q1.answer'), hasLink: false },
    { question: t('faq.q2.question'), answer: t('faq.q2.answer'), hasLink: false },
    { question: t('faq.q3.question'), answer: t('faq.q3.answer'), hasLink: false },
    { question: t('faq.q4.question'), answer: t('faq.q4.answer'), hasLink: false },
    { question: t('faq.q5.question'), answer: t('faq.q5.answer'), hasLink: false },
    { question: t('faq.q6.question'), answer: t('faq.q6.answer'), hasLink: false },
    { question: t('faq.q7.question'), answer: t('faq.q7.answer'), hasLink: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="container max-w-3xl mx-auto py-6 md:py-8 px-4"
    >
      <PageHeader title={t('faq.title')} subtitle={t('faq.subtitle')} />

      <ScrollReveal>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-border px-4">
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-5 hover:bg-accent/50">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-5 pt-0">
                  <p className="text-muted-foreground whitespace-pre-line">
                    {faq.answer}
                    {faq.hasLink && (
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
                        {t('faq.q7.linkSuffix')}
                      </>
                    )}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </ScrollReveal>
    </motion.div>
  );
}
