import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import {
  Search,
  UserPlus,
  Handshake,
  Star,
  Badge,
  ShieldCheck,
  MessageCircle,
  TrendingUp,
  ArrowRight,
  FileText,
  Zap,
  Eye,
  Trophy,
  Sparkles,
  Coins,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { paths } from '@/constants/routes';
import { cn } from '@/lib/utils';
import { surfaceCardCls } from '@/lib/surfaceCard';

const clientSteps = [
  { icon: Search, titleKey: 'step1', descKey: 'step1' },
  { icon: UserPlus, titleKey: 'step2', descKey: 'step2' },
  { icon: Handshake, titleKey: 'step3', descKey: 'step3' },
  { icon: Star, titleKey: 'step4', descKey: 'step4' },
];

const masterSteps = [
  { icon: Badge, titleKey: 'masterStep1', descKey: 'masterStep1' },
  { icon: ShieldCheck, titleKey: 'masterStep2', descKey: 'masterStep2' },
  { icon: MessageCircle, titleKey: 'masterStep3', descKey: 'masterStep3' },
  { icon: TrendingUp, titleKey: 'masterStep4', descKey: 'masterStep4' },
];

const jobsClientSteps = [
  { icon: FileText, titleKey: 'jobsClient1' },
  { icon: Sparkles, titleKey: 'jobsClient2' },
  { icon: Eye, titleKey: 'jobsClient3' },
  { icon: Trophy, titleKey: 'jobsClient4' },
];

const jobsMasterSteps = [
  { icon: Search, titleKey: 'jobsMaster1' },
  { icon: Zap, titleKey: 'jobsMaster2' },
  { icon: TrendingUp, titleKey: 'jobsMaster3' },
  { icon: Handshake, titleKey: 'jobsMaster4' },
];

const jointsFacts = [
  { icon: Coins, titleKey: 'jointsFact1', accent: 'text-amber-600 dark:text-amber-400' },
  { icon: RefreshCw, titleKey: 'jointsFact2', accent: 'text-blue-600 dark:text-blue-400' },
  { icon: Lock, titleKey: 'jointsFact3', accent: 'text-emerald-600 dark:text-emerald-400' },
];

// Unified card style — matches homepage sections (Categories, JobsFlow, HowItWorks, Roadmap)
const cardCls = cn(
  'group relative h-full flex flex-col rounded-xl sm:rounded-2xl p-5 sm:p-6',
  surfaceCardCls,
  'hover:-translate-y-1 hover:shadow-md hover:shadow-black/10',
  'transition duration-300',
);

function StepCard({
  Icon,
  titleKey,
  descKey,
  t,
  index,
  ns = 'howItWorks',
}: {
  Icon: React.ComponentType<{ className?: string }>;
  titleKey: string;
  descKey: string;
  t: (k: string) => string;
  index: number;
  ns?: string;
}) {
  return (
    <div
      className="faber-page-enter h-full"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className={cn(cardCls, 'text-center items-center')}>
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
          <Icon className="h-7 w-7" />
        </div>
        <h3
          className={cn(
            'text-base sm:text-lg font-bold mb-2 tracking-tight',
            'text-slate-800 dark:text-slate-100',
          )}
        >
          {t(`${ns}.${titleKey}.title`)}
        </h3>
        <p
          className={cn(
            'text-sm leading-relaxed',
            'text-slate-500 dark:text-slate-400',
          )}
        >
          {t(`${ns}.${descKey}.description`)}
        </p>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className={cn(
        'text-xl sm:text-2xl font-bold mb-6 tracking-tight',
        'text-slate-800 dark:text-slate-100',
      )}
    >
      {children}
    </h2>
  );
}

export default function HowItWorksPage() {
  const { t } = useTranslation();

  return (
    <>
      <SEOHead
        title={t('howItWorks.title')}
        description={t('howItWorks.subtitle')}
        keywords={t('howItWorks.seoKeywords')}
      />
      <div className="faber-page-enter container max-w-5xl mx-auto py-8 md:py-12 px-4">
        {/* HERO */}
        <div className="text-center mb-12">
          <h1
            className={cn(
              'text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight',
              'text-slate-800 dark:text-slate-100',
            )}
          >
            {t('howItWorks.title')}
          </h1>
          <p
            className={cn(
              'mt-3 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed',
              'text-slate-500 dark:text-slate-400',
            )}
          >
            {t('howItWorks.subtitle')}
          </p>
        </div>

        {/* CLIENTS FLOW */}
        <section className="relative mt-8">
          <SectionTitle>{t('howItWorks.forClients')}</SectionTitle>
          <div
            className="hidden md:block absolute top-[7.5rem] left-[12.5%] right-[12.5%] h-px"
            style={{
              background:
                'linear-gradient(to right, transparent, hsl(var(--primary)/0.25), transparent)',
            }}
            aria-hidden
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {clientSteps.map((step, i) => (
              <StepCard
                key={step.titleKey}
                Icon={step.icon}
                titleKey={step.titleKey}
                descKey={step.descKey}
                t={t}
                index={i}
              />
            ))}
          </div>
        </section>

        {/* MASTERS FLOW */}
        <section className="relative mt-14">
          <SectionTitle>{t('howItWorks.forMasters')}</SectionTitle>
          <div
            className="hidden md:block absolute top-[7.5rem] left-[12.5%] right-[12.5%] h-px"
            style={{
              background:
                'linear-gradient(to right, transparent, hsl(var(--primary)/0.25), transparent)',
            }}
            aria-hidden
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {masterSteps.map((step, i) => (
              <StepCard
                key={step.titleKey}
                Icon={step.icon}
                titleKey={step.titleKey}
                descKey={step.descKey}
                t={t}
                index={i + 4}
              />
            ))}
          </div>
        </section>

        {/* JOBS MARKETPLACE */}
        <section className="mt-20">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 dark:bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/20 dark:ring-amber-400/20 mb-3 animate-pulse">
              <Sparkles className="h-3 w-3" />
              {t('howItWorks.jobs.badge')}
            </div>
            <h2
              className={cn(
                'text-2xl md:text-3xl font-bold tracking-tight',
                'text-slate-800 dark:text-slate-100',
              )}
            >
              {t('howItWorks.jobs.title')}
            </h2>
            <p
              className={cn(
                'mt-2 max-w-2xl text-sm sm:text-base leading-relaxed',
                'text-slate-500 dark:text-slate-400',
              )}
            >
              {t('howItWorks.jobs.subtitle')}
            </p>
          </div>

          {/* Client flow */}
          <h3
            className={cn(
              'text-base font-bold mb-4 tracking-tight flex items-center gap-2',
              'text-slate-800 dark:text-slate-100',
            )}
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-bold ring-1 ring-amber-500/30">
              C
            </span>
            {t('howItWorks.jobs.forClients')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-10">
            {jobsClientSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.titleKey}
                  className={cn(cardCls, 'p-4 faber-page-enter')}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="absolute -top-2.5 -left-2.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-bold ring-2 ring-amber-500/30 dark:ring-amber-400/20">
                    {i + 1}
                  </div>
                  <Icon className="h-5 w-5 text-amber-600 dark:text-amber-400 mb-2 group-hover:scale-110 transition-transform duration-300" />
                  <h4
                    className={cn(
                      'text-sm font-semibold mb-1',
                      'text-slate-800 dark:text-slate-100',
                    )}
                  >
                    {t(`howItWorks.jobs.${step.titleKey}.title`)}
                  </h4>
                  <p
                    className={cn(
                      'text-xs leading-relaxed',
                      'text-slate-500 dark:text-slate-400',
                    )}
                  >
                    {t(`howItWorks.jobs.${step.titleKey}.description`)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Master flow */}
          <h3
            className={cn(
              'text-base font-bold mb-4 tracking-tight flex items-center gap-2',
              'text-slate-800 dark:text-slate-100',
            )}
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-orange-500/15 text-orange-700 dark:text-orange-300 text-xs font-bold ring-1 ring-orange-500/30">
              M
            </span>
            {t('howItWorks.jobs.forMasters')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {jobsMasterSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.titleKey}
                  className={cn(cardCls, 'p-4 faber-page-enter')}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="absolute -top-2.5 -left-2.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-orange-500/15 text-orange-700 dark:text-orange-300 text-xs font-bold ring-2 ring-orange-500/30 dark:ring-orange-400/20">
                    {i + 1}
                  </div>
                  <Icon className="h-5 w-5 text-orange-600 dark:text-orange-400 mb-2 group-hover:scale-110 transition-transform duration-300" />
                  <h4
                    className={cn(
                      'text-sm font-semibold mb-1',
                      'text-slate-800 dark:text-slate-100',
                    )}
                  >
                    {t(`howItWorks.jobs.${step.titleKey}.title`)}
                  </h4>
                  <p
                    className={cn(
                      'text-xs leading-relaxed',
                      'text-slate-500 dark:text-slate-400',
                    )}
                  >
                    {t(`howItWorks.jobs.${step.titleKey}.description`)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* JOINTS section */}
        <section className="mt-20">
          <div
            className={cn(
              'rounded-2xl p-6 md:p-8 transition duration-500',
              'bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 border border-amber-200/60',
              'dark:bg-gradient-to-br dark:from-amber-500/[0.08] dark:via-orange-500/[0.05] dark:to-amber-500/[0.08] dark:border-amber-400/15',
            )}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 dark:bg-amber-400/15">
                <Zap className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h2
                  className={cn(
                    'text-xl md:text-2xl font-bold tracking-tight',
                    'text-slate-800 dark:text-slate-100',
                  )}
                >
                  {t('howItWorks.joints.title')}
                </h2>
                <p
                  className={cn(
                    'text-sm mt-1 leading-relaxed',
                    'text-slate-500 dark:text-slate-400',
                  )}
                >
                  {t('howItWorks.joints.subtitle')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              {jointsFacts.map((fact, i) => {
                const Icon = fact.icon;
                return (
                  <div
                    key={fact.titleKey}
                    className={cn(cardCls, 'p-4 faber-page-enter')}
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/60 dark:bg-white/[0.04] mb-2 group-hover:scale-110 transition-transform duration-300">
                      <Icon className={cn('h-4 w-4', fact.accent)} />
                    </div>
                    <h4
                      className={cn(
                        'text-sm font-semibold mb-1',
                        'text-slate-800 dark:text-slate-100',
                      )}
                    >
                      {t(`howItWorks.joints.${fact.titleKey}.title`)}
                    </h4>
                    <p
                      className={cn(
                        'text-xs leading-relaxed',
                        'text-slate-500 dark:text-slate-400',
                      )}
                    >
                      {t(`howItWorks.joints.${fact.titleKey}.description`)}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button asChild className="gap-2 font-semibold rounded-full">
                <RouterLink to={paths.jobs.list}>
                  {t('howItWorks.joints.ctaBrowse')}
                  <ArrowRight className="h-4 w-4" />
                </RouterLink>
              </Button>
              <Button asChild variant="outline" className="gap-2 font-semibold rounded-full">
                <RouterLink to={paths.plans}>
                  {t('howItWorks.joints.ctaPlans')}
                </RouterLink>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
