import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { FileText, Zap, Trophy, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { paths } from '@/constants/routes';

const STEPS = [
  {
    icon: FileText,
    titleKey: 'home.jobsFlow.step1Title',
    descKey: 'home.jobsFlow.step1Desc',
    accent: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10 dark:bg-amber-400/10',
    ring: 'ring-amber-500/20 dark:ring-amber-400/20',
  },
  {
    icon: Zap,
    titleKey: 'home.jobsFlow.step2Title',
    descKey: 'home.jobsFlow.step2Desc',
    accent: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-500/10 dark:bg-orange-400/10',
    ring: 'ring-orange-500/20 dark:ring-orange-400/20',
  },
  {
    icon: Trophy,
    titleKey: 'home.jobsFlow.step3Title',
    descKey: 'home.jobsFlow.step3Desc',
    accent: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10 dark:bg-emerald-400/10',
    ring: 'ring-emerald-500/20 dark:ring-emerald-400/20',
  },
];

export const JobsFlowSection = () => {
  const { t } = useTranslation();

  return (
    <div className="py-2">
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 dark:bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/20 dark:ring-amber-400/20 mb-3">
          <Sparkles className="h-3 w-3" />
          {t('home.jobsFlow.badge')}
        </div>
        <h2
          className={cn(
            'text-2xl sm:text-3xl font-bold tracking-tight',
            'text-slate-800 dark:text-slate-100',
          )}
        >
          {t('home.jobsFlow.title')}
        </h2>
        <p
          className={cn(
            'mt-2 text-sm sm:text-base max-w-xl mx-auto',
            'text-slate-500 dark:text-slate-400',
          )}
        >
          {t('home.jobsFlow.subtitle')}
        </p>
      </div>

      <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 max-w-4xl mx-auto">
        {/* connector */}
        <div className="hidden sm:block pointer-events-none absolute top-12 left-[16%] right-[16%] h-0.5 rounded-full bg-gradient-to-r from-amber-500/30 via-orange-500/30 to-emerald-500/30" />

        {STEPS.map(({ icon: Icon, titleKey, descKey, accent, bg, ring }, i) => (
          <div
            key={titleKey}
            className={cn(
              'relative flex flex-col items-center text-center px-4 py-5 sm:px-5 sm:py-6 rounded-xl min-w-0',
              'bg-card shadow-md shadow-black/5',
              'dark:bg-white/[0.04] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5)]',
              'transition duration-250 hover:-translate-y-0.5 hover:shadow-lg',
              'dark:hover:shadow-[0_8px_28px_-4px_rgba(0,0,0,0.6)]',
            )}
          >
            <span
              className={cn(
                'absolute -top-2.5 -left-1.5 sm:-top-3 sm:-left-2 text-xs font-bold px-2 py-0.5 sm:px-2.5 rounded-full ring-2',
                bg,
                accent,
                ring,
              )}
            >
              {i + 1}
            </span>
            <div className={cn('p-2.5 sm:p-3 rounded-xl mb-3', bg)}>
              <Icon className={cn('w-5 h-5 sm:w-6 sm:h-6', accent)} strokeWidth={2} />
            </div>
            <h3 className="font-semibold text-sm sm:text-base text-slate-800 dark:text-slate-100 mb-1">
              {t(titleKey)}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {t(descKey)}
            </p>
          </div>
        ))}
      </div>

      {/* Joints feature card */}
      <div className="mt-6 sm:mt-8 max-w-4xl mx-auto rounded-2xl border border-amber-500/15 dark:border-amber-400/10 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/[0.08] dark:to-orange-500/[0.05] p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="shrink-0 inline-flex items-center justify-center h-11 w-11 rounded-xl bg-amber-500/15 dark:bg-amber-400/15">
            <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm sm:text-base text-slate-800 dark:text-slate-100">
              {t('home.jobsFlow.jointsTitle')}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('home.jobsFlow.jointsDesc')}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button asChild size="lg" className="gap-2 font-semibold w-full sm:w-auto">
          <RouterLink to={paths.jobs.list}>
            {t('home.jobsFlow.ctaBrowse')}
            <ArrowRight className="h-4 w-4" />
          </RouterLink>
        </Button>
        <Button asChild variant="outline" size="lg" className="gap-2 font-semibold w-full sm:w-auto">
          <RouterLink to={paths.howItWorks}>
            {t('home.jobsFlow.ctaLearn')}
          </RouterLink>
        </Button>
      </div>
    </div>
  );
};
