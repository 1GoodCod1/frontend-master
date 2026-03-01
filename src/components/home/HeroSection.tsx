import { useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Flame, ClipboardList, Users } from 'lucide-react';
import { useMastersLandingStatsQuery } from '@/features/masters/mastersApi';
import { useIsDark } from '@/hooks/useIsDark';
import { Button } from '@/components/ui/button';
import OptimizedImage from '@/components/common/OptimizedImage';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  isAuthed: boolean;
}

export const HeroSection = ({ isAuthed }: HeroSectionProps) => {
  const { t } = useTranslation();
  const isDark = useIsDark();
  const { data: landingStats } = useMastersLandingStatsQuery();

  const stats = useMemo(() => {
    if (!landingStats) {
      return {
        verified: '0+',
        projects: '0+',
        rating: '4.9',
        support: '24/7',
        statusText: t('home.heroStatus'),
      };
    }
    const {
      verifiedMastersCount,
      verifiedOnlineMastersCount,
      completedProjectsCount,
      averageRating,
    } = landingStats;
    const projectsStr =
      completedProjectsCount != null && completedProjectsCount >= 1000
        ? `${(completedProjectsCount / 1000).toFixed(completedProjectsCount >= 10000 ? 0 : 1)}K+`
        : `${completedProjectsCount ?? 0}+`;
    const ratingStr =
      averageRating != null &&
      typeof averageRating === 'number' &&
      !Number.isNaN(averageRating)
        ? averageRating.toFixed(1)
        : '4.9';
    return {
      verified: `${verifiedMastersCount ?? 0}+`,
      projects: projectsStr,
      rating: ratingStr,
      support: '24/7',
      statusText: t('home.heroStatusWithCount', {
        count: verifiedOnlineMastersCount ?? 0,
      }),
    };
  }, [landingStats, t]);

  return (
    <div className="relative overflow-hidden py-8 sm:py-12 md:py-16 px-4 sm:px-6 text-center">
      {/* Status pill */}
      <span
        className={cn(
          'inline-flex items-center justify-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 mb-4 sm:mb-6 rounded-full',
          'border-0 bg-primary/10 dark:bg-white/[0.06] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.35)]',
          'text-sm font-semibold relative z-10',
          'text-slate-700 dark:text-slate-300'
        )}
      >
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
        <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" strokeWidth={2} />
        {stats.statusText}
      </span>

      {/* Headline */}
      <h1
        className={cn(
          'relative z-10 font-bold mb-1 text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-tight tracking-tight',
          'text-slate-800 dark:text-slate-100'
        )}
      >
        {t('home.heroTitleLine1')}
      </h1>
      <p
        className={cn(
          'relative z-10 block font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight tracking-tight mb-3 sm:mb-4'
        )}
      >
        <span className="text-primary dark:text-amber-400">{t('home.heroTitleLine2Masters')} </span>
        <span className="text-slate-800 dark:text-slate-200">{t('home.heroTitleLine2From')}</span>
      </p>

      <p
        className={cn(
          'relative z-10 font-normal mb-6 sm:mb-8 max-w-[560px] mx-auto leading-relaxed text-sm sm:text-[0.9375rem] md:text-[1.0625rem]',
          'text-slate-600 dark:text-slate-400'
        )}
      >
        {t('home.subtitle')}
      </p>

      {/* Hero illustration */}
      <div className="relative z-10 mx-auto mb-6 sm:mb-8 max-w-2xl px-0 sm:px-2">
        <OptimizedImage
          basePath={isDark ? '/images/hero-masters-dark' : '/images/hero-masters'}
          alt=""
          className="w-full h-auto rounded-2xl"
          loading="eager"
          draggable={false}
        />
      </div>

      {/* CTA buttons */}
      <div className="relative z-10 flex flex-col sm:flex-row gap-3 justify-center mb-8 sm:mb-10">
        <Button
          asChild
          size="lg"
          className={cn(
            'w-full sm:w-auto min-h-[48px] px-6 py-5 sm:py-6 text-base font-semibold tracking-wide gap-2 transition-all duration-200 hover:-translate-y-0.5',
            'border-0 border-transparent',
            'bg-orange-500 text-white hover:bg-orange-600',
            'shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40',
            'dark:bg-amber-400 dark:text-amber-950 dark:hover:bg-amber-300',
            'dark:shadow-[0_0_24px_-4px_rgba(245,158,11,0.45)] dark:hover:shadow-[0_0_32px_-4px_rgba(245,158,11,0.55)]'
          )}
        >
          <RouterLink to="/masters">
            <Users className="h-5 w-5 shrink-0" strokeWidth={2} />
            {t('home.findMasters')}
          </RouterLink>
        </Button>
        {!isAuthed && (
          <Button
            asChild
            variant="outline"
            size="lg"
            className={cn(
              'w-full sm:w-auto min-h-[48px] px-6 py-5 sm:py-6 text-base font-semibold tracking-wide gap-2 transition-all hover:-translate-y-0.5',
              'border-0 border-transparent bg-cta/5 text-cta hover:bg-cta/10',
              'dark:bg-white/[0.06] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] dark:text-foreground',
              'dark:hover:bg-cta/15 dark:hover:shadow-[0_6px_24px_-4px_rgba(245,158,11,0.2)] dark:hover:text-cta'
            )}
          >
            <RouterLink to="/plans">
              <ClipboardList className="h-5 w-5 shrink-0" strokeWidth={2} />
              {t('home.viewPlans')}
            </RouterLink>
          </Button>
        )}
      </div>

      {/* Stats cards */}
      <div className="relative z-10 grid grid-cols-2 sm:flex sm:flex-row sm:flex-wrap justify-center gap-2 sm:gap-3">
        {[
          {
            value: stats.verified,
            labelKey: 'statVerified',
            valueClass: 'text-primary dark:text-teal-400',
            labelClass: 'text-primary/80 dark:text-teal-400/90',
          },
          {
            value: stats.projects,
            labelKey: 'statProjects',
            valueClass: 'text-blue-700 dark:text-blue-400',
            labelClass: 'text-blue-600/90 dark:text-blue-400/80',
          },
          {
            value: stats.rating,
            labelKey: 'statRating',
            valueClass: 'text-amber-700 dark:text-amber-400',
            labelClass: 'text-amber-600/90 dark:text-amber-400/80',
          },
          {
            value: stats.support,
            labelKey: 'statSupport',
            valueClass: 'text-emerald-700 dark:text-emerald-400',
            labelClass: 'text-emerald-600/90 dark:text-emerald-400/80',
          },
        ].map(({ value, labelKey, valueClass, labelClass }) => (
          <div
            key={labelKey}
            className={cn(
              'px-4 py-3 sm:px-6 sm:py-4 min-w-0 sm:min-w-[130px] sm:max-w-[180px] rounded-xl border-0',
              'bg-card shadow-md shadow-black/5',
              'dark:bg-white/[0.06] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.35)]',
              'transition-all duration-250 hover:shadow-lg',
              'dark:hover:shadow-[0_8px_28px_-4px_rgba(0,0,0,0.45)]',
              'hover:-translate-y-0.5'
            )}
          >
            <p className={cn('font-extrabold text-xl sm:text-2xl tracking-tight', valueClass)}>
              {value}
            </p>
            <p className={cn('text-sm font-medium mt-0.5', labelClass)}>
              {t(`home.${labelKey}`)}
            </p>
          </div>
        ))}
      </div>

      {!isAuthed && (
        <div className="relative z-10 flex flex-row flex-wrap gap-4 sm:gap-6 justify-center mt-6 sm:mt-8">
          <RouterLink
            to="/login"
            className={cn(
              'text-sm font-semibold underline underline-offset-4 transition-colors',
              'text-cta decoration-cta/60 hover:decoration-cta',
              'dark:text-amber-400 dark:decoration-amber-400/60 dark:hover:decoration-amber-400'
            )}
          >
            {t('home.masterLogin')}
          </RouterLink>
          <RouterLink
            to="/register"
            className={cn(
              'text-sm font-semibold underline underline-offset-4 transition-colors',
              'text-cta decoration-cta/60 hover:decoration-cta',
              'dark:text-amber-400 dark:decoration-amber-400/60 dark:hover:decoration-amber-400'
            )}
          >
            {t('nav.register')}
          </RouterLink>
        </div>
      )}
    </div>
  );
};
