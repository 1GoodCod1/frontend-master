import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Bookmark, Briefcase } from 'lucide-react';
import { useJobsListQuery, useMasterMyApplicationsQuery } from '@/features/jobs/jobsApi';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthed, selectRole } from '@/features/auth/selectors';
import { cn } from '@/lib/utils';
import { USER_ROLE } from '@/constants/roles';
import type { JobDto } from '@/types';
import { useSavedJobs, usePublicJobsState } from '@/hooks/jobs';
import { JobListItem } from '@/features/jobs/components/JobListItem';
import { JobDetailPanel } from '@/features/jobs/components/JobDetailPanel';
import { JobsSidebar } from '@/features/jobs/components/JobsSidebar';
import { PublicJobsSearch } from '@/features/jobs/components/PublicJobsSearch';
import { PublicJobsTabs } from '@/features/jobs/components/PublicJobsTabs';

const PAGE_LIMIT = 20;

export default function PublicJobsPage() {
  const { t } = useTranslation();
  const { saved, toggle: toggleSave } = useSavedJobs();
  const {
    tab, setTab,
    search, setSearch,
    debouncedSearch,
    page, setPage,
    selectedId, setSelectedId,
    apiSort,
  } = usePublicJobsState();

  const isAuthed = useAppSelector(selectIsAuthed);
  const role = useAppSelector(selectRole);
  const isMaster = role === USER_ROLE.MASTER;

  const { data, isLoading, isFetching } = useJobsListQuery({
    limit: PAGE_LIMIT,
    page,
    search: debouncedSearch || undefined,
    sort: apiSort,
  } as Parameters<typeof useJobsListQuery>[0], { pollingInterval: 60_000 });

  const [allItems, setAllItems] = useState<JobDto[]>([]);
  const [trackedData, setTrackedData] = useState(data);
  const [queryKey, setQueryKey] = useState(`${debouncedSearch}|${apiSort ?? ''}`);

  const currentQueryKey = `${debouncedSearch}|${apiSort ?? ''}`;
  if (currentQueryKey !== queryKey) {
    setQueryKey(currentQueryKey);
    setTrackedData(undefined);
    setAllItems([]);
    setPage(1);
  } else if (data !== trackedData) {
    setTrackedData(data);
    if (data?.items) {
      setAllItems((prev) => [
        ...prev.slice(0, (page - 1) * PAGE_LIMIT),
        ...data.items,
      ]);
    }
  }

  const total = data?.total ?? 0;
  const hasMore = allItems.length < total;

  const { data: myAppsData } = useMasterMyApplicationsQuery(undefined, { skip: !isMaster || !isAuthed });
  const appliedIds = useMemo(
    () => new Set((myAppsData?.items ?? []).map((a) => a.jobId)),
    [myAppsData],
  );

  const displayItems = tab === 'saved' ? allItems.filter((j) => saved.has(j.id)) : allItems;
  const savedCount = allItems.filter((j) => saved.has(j.id)).length;

  return (
    <div className="relative flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden lg:block w-[280px] shrink-0 overflow-y-auto px-5 py-4 border-r border-gray-200/60 dark:border-white/[0.06]">
        <JobsSidebar isAuthed={isAuthed} isMaster={isMaster} />
      </aside>

      {/* List panel */}
      <div className="flex flex-1 min-w-0 flex-col">
        <PublicJobsSearch value={search} onChange={setSearch} />
        <PublicJobsTabs
          activeTab={tab}
          onTabChange={setTab}
          savedCount={savedCount}
          total={total}
          isLoading={isLoading}
        />

        <div className="w-full max-w-4xl flex-1 overflow-y-auto py-2">
          {isLoading && page === 1 ? (
            <div className="flex justify-center pt-24">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/30" />
            </div>
          ) : displayItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center px-6">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60">
                {tab === 'saved'
                  ? <Bookmark className="h-6 w-6 text-muted-foreground/40" />
                  : <Briefcase className="h-6 w-6 text-muted-foreground/40" />}
              </div>
              <p className="text-sm font-semibold text-foreground">
                {tab === 'saved' ? t('jobs.noSavedJobs') : t('jobs.noJobsFound')}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {tab === 'saved' ? t('jobs.noSavedJobsHint') : t('jobs.tryAdjustSearch')}
              </p>
            </div>
          ) : (
            <>
              {displayItems.map((job) => (
                <JobListItem
                  key={job.id}
                  job={job}
                  selected={selectedId === job.id}
                  onClick={() => setSelectedId(job.id)}
                  saved={saved.has(job.id)}
                  onSave={(e) => { e.stopPropagation(); toggleSave(job.id); }}
                  applied={appliedIds.has(job.id)}
                />
              ))}
              {hasMore && tab !== 'saved' && (
                <div className="flex justify-center py-6">
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={isFetching}
                    className="flex items-center gap-2 rounded-xl bg-muted px-6 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors disabled:opacity-50"
                  >
                    {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {t('jobs.loadMore')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Detail overlay */}
      {selectedId && (
        <div className="absolute inset-0 z-20 bg-black/30" onClick={() => setSelectedId(null)} />
      )}
      <div
        className={cn(
          'absolute right-0 top-0 z-30 h-full w-full max-w-2xl flex flex-col overflow-hidden shadow-2xl',
          'transition-transform duration-300 ease-in-out',
          selectedId ? 'translate-x-0' : 'translate-x-full',
        )}
        style={{ backgroundColor: 'hsl(var(--card))' }}
      >
        {selectedId && (
          <JobDetailPanel
            jobId={selectedId}
            onClose={() => setSelectedId(null)}
            savedIds={saved}
            onSave={toggleSave}
            appliedIds={appliedIds}
          />
        )}
      </div>
    </div>
  );
}
