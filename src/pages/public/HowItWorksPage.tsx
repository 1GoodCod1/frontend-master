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
import { Card, CardContent } from '@/components/ui/card';
import { paths } from '@/constants/routes';
import { cn } from '@/lib/utils';

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
  { icon: Coins, titleKey: 'jointsFact1', accent: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10 dark:bg-amber-400/10' },
  { icon: RefreshCw, titleKey: 'jointsFact2', accent: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10 dark:bg-blue-400/10' },
  { icon: Lock, titleKey: 'jointsFact3', accent: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 dark:bg-emerald-400/10' },
];

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
      className="faber-page-enter"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <Card className="h-full text-center border-border transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/30">
        <CardContent className="p-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 text-primary mb-4">
            <Icon className="h-10 w-10" />
          </div>
          <h3 className="text-lg font-bold mb-2 tracking-tight text-foreground">
            {t(`${ns}.${titleKey}.title`)}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t(`${ns}.${descKey}.description`)}
          </p>
        </CardContent>
      </Card>
    </div>
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
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            {t('howItWorks.title')}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            {t('howItWorks.subtitle')}
          </p>
        </div>

        {/* CLASSIC FLOW */}
        <section className="relative mt-8">
          <h2 className="text-xl font-bold text-foreground mb-6 tracking-tight">
            {t('howItWorks.forClients')}
          </h2>
          <div className="hidden md:block absolute top-24 left-[12.5%] right-[12.5%] h-0.5 rounded-full bg-primary/15" />
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

        <section className="relative mt-12">
          <h2 className="text-xl font-bold text-foreground mb-6 tracking-tight">
            {t('howItWorks.forMasters')}
          </h2>
          <div className="hidden md:block absolute top-24 left-[12.5%] right-[12.5%] h-0.5 rounded-full bg-primary/15" />
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

        {/* JOBS MARKETPLACE — NEW */}
        <section className="mt-16">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 dark:bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/20 dark:ring-amber-400/20 mb-3">
              <Sparkles className="h-3 w-3" />
              {t('howItWorks.jobs.badge')}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              {t('howItWorks.jobs.title')}
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              {t('howItWorks.jobs.subtitle')}
            </p>
          </div>

          {/* Client flow */}
          <h3 className="text-base font-bold text-foreground mb-4 tracking-tight flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold ring-1 ring-amber-500/20">
              C
            </span>
            {t('howItWorks.jobs.forClients')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {jobsClientSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.titleKey}
                  className={cn(
                    'relative rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md',
                  )}
                >
                  <div className="absolute -top-2 -left-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[11px] font-bold ring-2 ring-amber-500/20">
                    {i + 1}
                  </div>
                  <Icon className="h-5 w-5 text-amber-600 dark:text-amber-400 mb-2" />
                  <h4 className="text-sm font-semibold text-foreground mb-1">
                    {t(`howItWorks.jobs.${step.titleKey}.title`)}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t(`howItWorks.jobs.${step.titleKey}.description`)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Master flow */}
          <h3 className="text-base font-bold text-foreground mb-4 tracking-tight flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold ring-1 ring-orange-500/20">
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
                  className={cn(
                    'relative rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md',
                  )}
                >
                  <div className="absolute -top-2 -left-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/15 text-orange-700 dark:text-orange-300 text-[11px] font-bold ring-2 ring-orange-500/20">
                    {i + 1}
                  </div>
                  <Icon className="h-5 w-5 text-orange-600 dark:text-orange-400 mb-2" />
                  <h4 className="text-sm font-semibold text-foreground mb-1">
                    {t(`howItWorks.jobs.${step.titleKey}.title`)}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t(`howItWorks.jobs.${step.titleKey}.description`)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* JOINTS — currency explainer */}
        <section className="mt-16">
          <div className="rounded-2xl border border-border bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 dark:from-amber-500/[0.06] dark:via-orange-500/[0.04] dark:to-amber-500/[0.06] p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 dark:bg-amber-400/15">
                <Zap className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                  {t('howItWorks.joints.title')}
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  {t('howItWorks.joints.subtitle')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              {jointsFacts.map((fact) => {
                const Icon = fact.icon;
                return (
                  <div
                    key={fact.titleKey}
                    className="rounded-xl bg-white/70 dark:bg-white/[0.03] border border-border/60 p-4"
                  >
                    <div className={cn('inline-flex h-9 w-9 items-center justify-center rounded-lg mb-2', fact.bg)}>
                      <Icon className={cn('h-4 w-4', fact.accent)} />
                    </div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">
                      {t(`howItWorks.joints.${fact.titleKey}.title`)}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t(`howItWorks.joints.${fact.titleKey}.description`)}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button asChild className="gap-2 font-semibold">
                <RouterLink to={paths.jobs.list}>
                  {t('howItWorks.joints.ctaBrowse')}
                  <ArrowRight className="h-4 w-4" />
                </RouterLink>
              </Button>
              <Button asChild variant="outline" className="gap-2 font-semibold">
                <RouterLink to={paths.plans}>
                  {t('howItWorks.joints.ctaPlans')}
                </RouterLink>
              </Button>
            </div>
          </div>
        </section>

        <div className="faber-page-enter mt-12 rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-primary/5 p-8 text-center">
          <h3 className="text-xl font-bold mb-3 tracking-tight text-foreground">
            {t('howItWorks.ready.title')}
          </h3>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6 leading-relaxed">
            {t('howItWorks.ready.description')}
          </p>
          <Button asChild size="lg" className="gap-2 font-semibold">
            <RouterLink to="/masters">
              {t('nav.masters')}
              <ArrowRight className="h-4 w-4" />
            </RouterLink>
          </Button>
        </div>
      </div>
    </>
  );
}
