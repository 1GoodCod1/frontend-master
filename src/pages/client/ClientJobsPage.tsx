import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Plus, Briefcase, ChevronRight } from 'lucide-react';
import { CardsSkeleton } from '@/components/common/Skeletons';
import { ErrorState } from '@/components/common/States';
import { useJobsListQuery } from '@/features/jobs/jobsApi';
import JobCard from '@/features/jobs/components/JobCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { JobStatus } from '@/types';

const STATUS_TABS: { labelKey: string; label: string; value: JobStatus | undefined }[] = [
  { labelKey: 'jobs.tabAll',    label: 'All',    value: undefined },
  { labelKey: 'jobs.tabOpen',   label: 'Open',   value: 'OPEN'   },
  { labelKey: 'jobs.tabFound',  label: 'Found',  value: 'FOUND'  },
  { labelKey: 'jobs.tabClosed', label: 'Closed', value: 'CLOSED' },
];

export default function ClientJobsPage() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<JobStatus | undefined>(undefined);

  const { data, isLoading, isError, error, refetch } = useJobsListQuery(
    status ? { status } : undefined,
    { refetchOnMountOrArgChange: true, pollingInterval: 60_000 },
  );

  if (isLoading) return <CardsSkeleton count={4} />;
  if (isError) return <ErrorState error={error as Error} onRetry={refetch} />;

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">

      {/* Page header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t('jobs.myJobs', 'My Job Postings')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('jobs.myJobsSubtitle', 'Manage your job postings and review applications')}
          </p>
        </div>
        <Link
          to="/client-dashboard/jobs/create"
          className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          {t('jobs.postJob', 'Post a Job')}
        </Link>
      </div>

      {/* Tab bar */}
      <div className="mb-6 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => {
          const isActive = status === tab.value;
          return (
            <Button
              key={tab.label}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatus(tab.value)}
              className={cn(
                'rounded-xl font-medium transition',
                isActive
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/20'
                  : 'border-black/5 dark:border-white/5 hover:border-amber-500/30 hover:text-amber-600 hover:bg-amber-500/5 shadow-sm',
              )}
            >
              {t(tab.labelKey, tab.label)}
              {isActive && total > 0 && (
                <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold">
                  {total}
                </span>
              )}
            </Button>
          );
        })}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Briefcase className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="mb-1.5 text-base font-semibold text-foreground">
            {status
              ? t('jobs.noJobsForStatus', 'No jobs in this category')
              : t('jobs.noJobs', 'No job postings yet')}
          </h3>
          <p className="mb-6 text-sm text-muted-foreground">
            {status
              ? t('jobs.tryAnotherTab', 'Try switching to another tab')
              : t('jobs.noJobsHint', 'Post your first job and find the perfect master')}
          </p>
          {!status && (
            <Link
              to="/client-dashboard/jobs/create"
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {t('jobs.postJob', 'Post a Job')}
            </Link>
          )}
          {status && (
            <button
              onClick={() => setStatus(undefined)}
              className="flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              {t('jobs.viewAll', 'View all jobs')}
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((job) => (
            <JobCard key={job.id} job={job} linkTo={`/client-dashboard/jobs/${job.id}`} showApplicationCount />
          ))}
        </div>
      )}
    </div>
  );
}
