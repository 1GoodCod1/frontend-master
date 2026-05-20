import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Plus, Briefcase, ChevronRight } from 'lucide-react';
import { CardsSkeleton } from '@/components/common/Skeletons';
import { ErrorState } from '@/components/common/States';
import { PageHeader } from '@/components/ui/PageHeader';
import { ClientFilterPill } from '@/components/client/ClientFilterPill';
import { ClientEmptyState } from '@/components/client/ClientEmptyState';
import { useJobsListQuery } from '@/features/jobs/jobsApi';
import JobCard from '@/features/jobs/components/JobCard';
import {
  clientLinkCls,
  clientPageClassName,
  clientPrimaryBtnCls,
} from '@/lib/clientCabinetStyles';
import type { JobStatus } from '@/types';

const STATUS_TABS: { labelKey: string; label: string; value: JobStatus | undefined }[] = [
  { labelKey: 'jobs.tabAll', label: 'All', value: undefined },
  { labelKey: 'jobs.tabOpen', label: 'Open', value: 'OPEN' },
  { labelKey: 'jobs.tabFound', label: 'Found', value: 'FOUND' },
  { labelKey: 'jobs.tabClosed', label: 'Closed', value: 'CLOSED' },
];

export default function ClientJobsPage() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<JobStatus | undefined>(undefined);

  const { data, isLoading, isError, error, refetch } = useJobsListQuery(
    { mine: true, ...(status ? { status } : {}) },
    { refetchOnMountOrArgChange: true, pollingInterval: 60_000 },
  );

  if (isLoading) return <CardsSkeleton count={4} />;
  if (isError) return <ErrorState error={error as Error} onRetry={refetch} />;

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className={clientPageClassName}>
      <PageHeader
        title={t('jobs.myJobs', 'My Job Postings')}
        subtitle={t('jobs.myJobsSubtitle', 'Manage your job postings and review applications')}
        actions={
          <Link to="/client-dashboard/jobs/create" className={clientPrimaryBtnCls}>
            <Plus className="h-4 w-4" />
            {t('jobs.postJob', 'Post a Job')}
          </Link>
        }
      />

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => {
          const isActive = status === tab.value;
          return (
            <ClientFilterPill key={tab.label} active={isActive} onClick={() => setStatus(tab.value)}>
              {t(tab.labelKey, tab.label)}
              {isActive && total > 0 && (
                <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold">
                  {total}
                </span>
              )}
            </ClientFilterPill>
          );
        })}
      </div>

      {items.length === 0 ? (
        <ClientEmptyState
          icon={Briefcase}
          title={
            status
              ? t('jobs.noJobsForStatus', 'No jobs in this category')
              : t('jobs.noJobs', 'No job postings yet')
          }
          description={
            status
              ? t('jobs.tryAnotherTab', 'Try switching to another tab')
              : t('jobs.noJobsHint', 'Post your first job and find the perfect master')
          }
          action={
            !status ? (
              <Link to="/client-dashboard/jobs/create" className={clientPrimaryBtnCls}>
                <Plus className="h-4 w-4" />
                {t('jobs.postJob', 'Post a Job')}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setStatus(undefined)}
                className={`inline-flex items-center gap-1.5 text-[13px] ${clientLinkCls}`}
              >
                {t('jobs.viewAll', 'View all jobs')}
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )
          }
        />
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
