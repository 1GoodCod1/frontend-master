import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Users, Wrench, HelpCircle, Search, X, Sparkles, ArrowRight } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/seo/SEOHead';
import { cn } from '@/lib/utils';
import { surfaceCardCls } from '@/lib/surfaceCard';

type FAQItem = {
  questionKey: string;
  answerKey: string;
  linkSuffixKey?: string;
};

type FAQSection = {
  id: string;
  categoryKey: string;
  icon: React.ElementType;
  accent: string; // text color for the icon
  bgAccent: string; // bg color for the icon chip
  items: FAQItem[];
};

const FAQ_SECTIONS: FAQSection[] = [
  {
    id: 'clients',
    categoryKey: 'faq.categories.forClients',
    icon: Users,
    accent: 'text-sky-600 dark:text-sky-400',
    bgAccent: 'bg-sky-500/10 dark:bg-sky-400/10',
    items: [
      { questionKey: 'faq.q1.question', answerKey: 'faq.q1.answer' },
      { questionKey: 'faq.q15.question', answerKey: 'faq.q15.answer' },
      { questionKey: 'faq.q16.question', answerKey: 'faq.q16.answer' },
      { questionKey: 'faq.q2.question', answerKey: 'faq.q2.answer' },
      { questionKey: 'faq.q3.question', answerKey: 'faq.q3.answer' },
      { questionKey: 'faq.q4.question', answerKey: 'faq.q4.answer' },
      { questionKey: 'faq.q13.question', answerKey: 'faq.q13.answer' },
      { questionKey: 'faq.q5.question', answerKey: 'faq.q5.answer' },
      { questionKey: 'faq.q6.question', answerKey: 'faq.q6.answer' },
    ],
  },
  {
    id: 'masters',
    categoryKey: 'faq.categories.forMasters',
    icon: Wrench,
    accent: 'text-primary dark:text-[#E97525]',
    bgAccent: 'bg-primary/10 dark:bg-[#E97525]/10',
    items: [
      { questionKey: 'faq.q7.question', answerKey: 'faq.q7.answer' },
      { questionKey: 'faq.q8.question', answerKey: 'faq.q8.answer' },
      { questionKey: 'faq.q17.question', answerKey: 'faq.q17.answer' },
      { questionKey: 'faq.q18.question', answerKey: 'faq.q18.answer' },
      { questionKey: 'faq.q9.question', answerKey: 'faq.q9.answer' },
      { questionKey: 'faq.q10.question', answerKey: 'faq.q10.answer' },
      { questionKey: 'faq.q14.question', answerKey: 'faq.q14.answer' },
    ],
  },
  {
    id: 'general',
    categoryKey: 'faq.categories.general',
    icon: HelpCircle,
    accent: 'text-emerald-600 dark:text-emerald-400',
    bgAccent: 'bg-emerald-500/10 dark:bg-emerald-400/10',
    items: [
      { questionKey: 'faq.q11.question', answerKey: 'faq.q11.answer' },
      { questionKey: 'faq.q12.question', answerKey: 'faq.q12.answer', linkSuffixKey: 'faq.q12.linkSuffix' },
    ],
  },
];

// Unified card style — matches homepage / masters / jobs pages
const cardCls = cn('rounded-2xl', surfaceCardCls);

export default function FAQPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const normalizedQuery = query.trim().toLowerCase();
  const filteredSections = useMemo(() => {
    if (!normalizedQuery) return FAQ_SECTIONS;
    return FAQ_SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        const q = t(item.questionKey).toLowerCase();
        const a = t(item.answerKey).toLowerCase();
        return q.includes(normalizedQuery) || a.includes(normalizedQuery);
      }),
    })).filter((s) => s.items.length > 0);
  }, [normalizedQuery, t]);

  const totalCount = FAQ_SECTIONS.reduce((sum, s) => sum + s.items.length, 0);
  const visibleCount = filteredSections.reduce((sum, s) => sum + s.items.length, 0);

  return (
    <>
      <SEOHead
        title={t('faq.title')}
        description={t('faq.subtitle')}
        keywords={t('faq.seoKeywords')}
      />
      <div className="faber-page-enter container max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Hero */}
        <div className="text-center mb-8 md:mb-10">
          <h1 className={cn(
            'text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight',
            'text-slate-800 dark:text-slate-100',
          )}>
            {t('faq.title')}
          </h1>
          <p className={cn(
            'mt-3 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed',
            'text-slate-500 dark:text-slate-400',
          )}>
            {t('faq.subtitle')}
          </p>

          {/* Search */}
          <div className="mt-6 max-w-2xl mx-auto">
            <div className={cn(
              'flex items-center gap-2.5 rounded-full px-4 py-2.5 transition-colors',
              surfaceCardCls,
              'focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15',
            )}>
              <Search className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('faq.searchPlaceholder', 'Search the questions…')}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-slate-100"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {normalizedQuery && (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {visibleCount} / {totalCount}
              </p>
            )}
          </div>
        </div>

        {/* Body — sticky nav (lg+) + content */}
        <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-6 lg:gap-10 items-start">
          {/* Sticky category nav — hidden on mobile */}
          <aside className="hidden lg:block sticky top-20 self-start">
            <p className={cn(
              'text-[10px] font-mono uppercase tracking-[0.2em] mb-3 px-1',
              'text-slate-400 dark:text-slate-500',
            )}>
              {t('faq.viewAll', 'All questions')}
            </p>
            <nav className="space-y-0.5">
              {FAQ_SECTIONS.map((section) => {
                const Icon = section.icon;
                return (
                  <a
                    key={section.id}
                    href={`#faq-${section.id}`}
                    className="group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-accent transition-colors"
                  >
                    <span className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-lg shrink-0',
                      section.bgAccent,
                    )}>
                      <Icon className={cn('h-3.5 w-3.5', section.accent)} />
                    </span>
                    <span className="flex-1 truncate font-medium">
                      {t(section.categoryKey)}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                      {section.items.length}
                    </span>
                  </a>
                );
              })}
            </nav>
          </aside>

          {/* Main content */}
          <div className="min-w-0 space-y-8 md:space-y-10">
            {filteredSections.length === 0 ? (
              <div className={cn(cardCls, 'rounded-2xl p-10 text-center')}>
                <HelpCircle className="mx-auto h-9 w-9 text-slate-400 dark:text-slate-500 mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t('faq.noResults', 'No questions match your search.')}
                </p>
              </div>
            ) : (
              filteredSections.map((section, sectionIndex) => {
                const Icon = section.icon;
                return (
                  <section
                    key={section.id}
                    id={`faq-${section.id}`}
                    className="scroll-mt-24"
                  >
                    <header className="flex items-center gap-3 mb-4">
                      <span className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-xl',
                        section.bgAccent,
                      )}>
                        <Icon className={cn('h-5 w-5', section.accent)} />
                      </span>
                      <h2 className={cn(
                        'text-lg sm:text-xl font-bold tracking-tight',
                        'text-slate-800 dark:text-slate-100',
                      )}>
                        {t(section.categoryKey)}
                      </h2>
                    </header>

                    <div className={cn(cardCls, 'rounded-2xl overflow-hidden')}>
                      <Accordion type="single" collapsible className="w-full">
                        {section.items.map((item, itemIndex) => (
                          <AccordionItem
                            key={item.questionKey}
                            value={`s${sectionIndex}-i${itemIndex}`}
                            className="px-5 sm:px-6 border-b border-gray-200/60 dark:border-white/[0.05] last:border-0"
                          >
                            <AccordionTrigger
                              className={cn(
                                'text-left text-sm sm:text-base font-semibold py-4 sm:py-5 hover:no-underline',
                                'text-slate-800 dark:text-slate-100',
                              )}
                            >
                              {t(item.questionKey)}
                            </AccordionTrigger>
                            <AccordionContent className="pb-5 pt-0">
                              <p className={cn(
                                'text-sm whitespace-pre-line leading-relaxed',
                                'text-slate-600 dark:text-slate-300',
                              )}>
                                {t(item.answerKey)}
                                {item.linkSuffixKey && (
                                  <>
                                    {' '}
                                    <RouterLink
                                      to="/contact"
                                      className="text-primary dark:text-[#E97525] font-medium no-underline hover:underline"
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
                  </section>
                );
              })
            )}

            {/* Final CTA */}
            <div className={cn(
              cardCls,
              'rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden',
            )}>
              {/* soft glow */}
              <div
                className="absolute inset-0 pointer-events-none"
                aria-hidden
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 50% 0%, hsl(var(--primary)/0.08), transparent 70%)',
                }}
              />
              <div className="relative">
                <Sparkles className="mx-auto mb-3 h-6 w-6 text-primary dark:text-[#E97525]" />
                <h3 className={cn(
                  'text-lg sm:text-xl font-bold tracking-tight mb-2',
                  'text-slate-800 dark:text-slate-100',
                )}>
                  {t('faq.stillQuestionsTitle', 'Still have questions?')}
                </h3>
                <p className={cn(
                  'mb-4 text-sm leading-relaxed max-w-md mx-auto',
                  'text-slate-500 dark:text-slate-400',
                )}>
                  {t('faq.stillQuestionsDesc', 'Our team usually replies within an hour.')}
                </p>
                <Button asChild className="rounded-full font-semibold gap-2">
                  <RouterLink to="/contact">
                    {t('faq.contactCta', 'Contact support')}
                    <ArrowRight className="h-4 w-4" />
                  </RouterLink>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
