import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthed, selectRole } from '@/features/auth/selectors';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { ErrorState } from '@/components/common/States';
import { SectionHead } from '@/components/home/SectionHead';
import { HomeJobCard } from '@/components/home/HomeJobCard';
import { useJobsListQuery } from '@/features/jobs/jobsApi';
import { paths } from '@/constants/routes';
import {
  HOME_ACTIVE_JOBS_LIMIT,
  HOME_ACTIVE_JOBS_POLL_MS,
  JOBS_SECTION_ACCENT,
} from '@/constants/home';
import {
  homeJobsGridClassName,
  homeJobCardSkeletonClassName,
} from '@/utils/categoryIconStyle';
import { cn } from '@/lib/utils';
import { getPostJobNavigationPath } from '@/utils/postJobNavigation';

function JobCardSkeleton() {
  return (
    <div className={homeJobCardSkeletonClassName}>
      <div className="flex justify-between gap-2 mb-2">
        <Skeleton className="h-4 w-20 rounded-full" />
        <Skeleton className="h-3 w-12" />
      </div>
      <Skeleton className="h-[33px] w-full" />
      <Skeleton className="h-3 w-2/3 mt-1.5" />
      <div className="mt-auto pt-2.5 border-t border-[#E9ECEF] dark:border-white/[0.08] flex justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

function LiveTrailing() {
  const { t } = useTranslation();
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold',
        'bg-[#E97525]/10 text-[#E97525]',
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#E97525] animate-pulse" />
      {t('home.activeJobs.live')}
    </span>
  );
}

type ActiveJobsSectionProps = {
  className?: string;
};

export const ActiveJobsSection = ({ className }: ActiveJobsSectionProps) => {
  const { t } = useTranslation();
  const isAuthed = useAppSelector(selectIsAuthed);
  const role = useAppSelector(selectRole);
  const postJobPath = getPostJobNavigationPath(isAuthed, role);
  const { data, isLoading, isError, error, refetch, isFetching } = useJobsListQuery(
    { limit: HOME_ACTIVE_JOBS_LIMIT, page: 1, sort: 'recent' },
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      pollingInterval: HOME_ACTIVE_JOBS_POLL_MS,
    },
  );

  const jobs = data?.items ?? [];

  const sectionHead = (
    <SectionHead
      kicker={t('home.kickerJobs', { defaultValue: 'Live' })}
      title={t('home.activeJobs.title')}
      accent={JOBS_SECTION_ACCENT}
      trailing={<LiveTrailing />}
      link={{ label: t('home.activeJobs.viewAll'), href: paths.jobs.list }}
    />
  );

  if (isLoading) {
    return (
      <div className={className}>
        {sectionHead}
        <div className={homeJobsGridClassName}>
          {Array.from({ length: HOME_ACTIVE_JOBS_LIMIT }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={className}>
        {sectionHead}
        <ErrorState error={error} onRetry={refetch} />
      </div>
    );
  }

  if (!jobs.length) {
    return (
      <div className={className}>
        {sectionHead}
        <div
          className={cn(
            'rounded-xl px-5 py-8 sm:px-7 sm:py-10 text-center border',
            'border-[#e8e8e8] dark:border-[#2d2d2d]',
            'bg-[hsl(var(--secondary)/0.35)] dark:bg-white/[0.03]',
          )}
        >
          <p className="font-semibold text-foreground">{t('home.activeJobs.emptyTitle')}</p>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            {t('home.activeJobs.emptyDesc')}
          </p>
          <Button
            asChild
            className="mt-5 h-10 rounded-[14px] px-5 text-sm font-semibold bg-[#E97525] text-white hover:bg-[#d86920] shadow-none"
          >
            <RouterLink to={postJobPath}>
              {t('home.heroPostJob')}
            </RouterLink>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {sectionHead}
      <div
        className={cn(
          homeJobsGridClassName,
          isFetching && !isLoading && 'opacity-90 transition-opacity',
        )}
      >
        {jobs.map((job, index) => (
          <ScrollReveal key={job.id} delay={index * 0.04} duration={0.35} className="h-full">
            <HomeJobCard job={job} className="h-full" />
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
};
