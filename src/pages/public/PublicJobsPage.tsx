import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Bookmark, Briefcase } from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';
import { useJobsListQuery, useMasterMyApplicationsQuery } from '@/features/jobs/jobsApi';
import { useMastersMyProfileQuery } from '@/features/masters/mastersApi';
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
import { PublicJobsFilters } from '@/features/jobs/components/PublicJobsFilters';
import { getTranslatedCategoryName, getTranslatedCityName } from '@/utils/translateCityCategory';

const PAGE_LIMIT = 20;

export default function PublicJobsPage() {
  const { t, i18n } = useTranslation();
  const { saved, toggle: toggleSave } = useSavedJobs();
  const {
    tab,
    setTab,
    search,
    setSearch,
    debouncedSearch,
    cityId,
    setCityId,
    categoryId,
    setCategoryId,
    page,
    setPage,
    selectedId,
    setSelectedId,
    apiSort,
    apiCityId,
    apiCategoryId,
    resetFilters,
  } = usePublicJobsState();

  const isAuthed = useAppSelector(selectIsAuthed);
  const role = useAppSelector(selectRole);
  const isMaster = role === USER_ROLE.MASTER;

  const { data: masterProfile } = useMastersMyProfileQuery(undefined, {
    skip: !isMaster || !isAuthed,
  });
  const profileData =
    (masterProfile as { data?: { category?: { slug: string; name: string }; city?: { slug: string; name: string } } })?.data ??
    (masterProfile as { category?: { slug: string; name: string }; city?: { slug: string; name: string } });

  const profileCategoryLabel = profileData?.category
    ? getTranslatedCategoryName(t, profileData.category, i18n.language)
    : null;
  const profileCityLabel = profileData?.city
    ? getTranslatedCityName(t, profileData.city, i18n.language)
    : null;

  useEffect(() => {
    if (isMaster && isAuthed && !new URLSearchParams(window.location.search).get('sort')) {
      setTab('best');
    }
  }, [isAuthed, isMaster, setTab]);

  const listQuery = {
    limit: PAGE_LIMIT,
    page,
    search: debouncedSearch || undefined,
    sort: tab === 'saved' ? undefined : apiSort,
    cityId: apiCityId,
    categoryId: apiCategoryId,
  } as Parameters<typeof useJobsListQuery>[0];

  const skipList = tab === 'saved';

  const { data, isLoading, isFetching } = useJobsListQuery(listQuery, {
    skip: skipList,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    pollingInterval: 60_000,
  });

  const listKey = `${debouncedSearch}|${apiSort ?? ''}|${apiCityId ?? ''}|${apiCategoryId ?? ''}`;

  const [pagesCache, setPagesCache] = useState<{ listKey: string; pages: Map<number, JobDto[]> }>({
    listKey: '',
    pages: new Map(),
  });

  if (pagesCache.listKey !== listKey) {
    setPagesCache({ listKey, pages: new Map() });
  } else if (data?.items && !skipList && pagesCache.pages.get(page) !== data.items) {
    const pages = new Map(pagesCache.pages);
    pages.set(page, data.items);
    setPagesCache({ listKey, pages });
  }

  const allItems = useMemo(() => {
    const items: JobDto[] = [];
    for (let p = 1; p <= page; p++) {
      const pageItems = pagesCache.pages.get(p);
      if (pageItems) {
        items.push(...pageItems);
      }
    }
    return items;
  }, [pagesCache, page]);

  const handleTabChange = (next: typeof tab) => {
    setTab(next);
    setPage(1);
  };

  const handleCityChange = (value: string) => {
    setCityId(value);
    setPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryId(value);
    setPage(1);
  };

  const handleResetFilters = () => {
    resetFilters();
  };

  const total = data?.total ?? 0;
  const hasMore = !skipList && allItems.length < total;

  const { data: myAppsData } = useMasterMyApplicationsQuery(undefined, {
    skip: !isMaster || !isAuthed,
  });
  const appliedIds = useMemo(
    () => new Set((myAppsData?.items ?? []).map((a) => a.jobId)),
    [myAppsData],
  );

  const displayItems = tab === 'saved' ? allItems.filter((j) => saved.has(j.id)) : allItems;
  const savedCount = allItems.filter((j) => saved.has(j.id)).length;

  const filterProps = {
    cityId,
    categoryId,
    onCityChange: handleCityChange,
    onCategoryChange: handleCategoryChange,
    onReset: handleResetFilters,
    showBestHint: isMaster && isAuthed && tab === 'best',
    profileCategory: profileCategoryLabel,
    profileCity: profileCityLabel,
  };

  return (
    <div className="relative flex h-[calc(100vh-64px)] overflow-hidden bg-[hsl(var(--background))]">
      <SEOHead
        title={t('jobs.publicTitle')}
        description={t('jobs.publicSubtitle')}
      />
      <aside className="hidden lg:block w-[280px] shrink-0 overflow-y-auto px-5 py-4 border-r border-[#E9ECEF] dark:border-white/[0.08]">
        <JobsSidebar isAuthed={isAuthed} isMaster={isMaster} filters={filterProps} />
      </aside>

      <div className="flex flex-1 min-w-0 flex-col">
        <PublicJobsSearch value={search} onChange={setSearch} />

        <div className="lg:hidden px-4 pb-2">
          <PublicJobsFilters {...filterProps} />
        </div>

        <PublicJobsTabs
          activeTab={tab}
          onTabChange={handleTabChange}
          savedCount={savedCount}
          total={tab === 'saved' ? savedCount : total}
          isLoading={isLoading && !skipList}
          isMaster={isMaster && isAuthed}
        />

        <div className="w-full max-w-4xl flex-1 overflow-y-auto divide-y divide-[#e8e8e8] dark:divide-[#2d2d2d]">
          {isLoading && page === 1 && !skipList ? (
            <div className="flex justify-center pt-24">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/30" />
            </div>
          ) : displayItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center px-6">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F1F3F5] dark:bg-white/[0.06]">
                {tab === 'saved' ? (
                  <Bookmark className="h-6 w-6 text-muted-foreground/40" />
                ) : (
                  <Briefcase className="h-6 w-6 text-muted-foreground/40" />
                )}
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
                  onSave={(e) => {
                    e.stopPropagation();
                    toggleSave(job.id);
                  }}
                  applied={appliedIds.has(job.id)}
                />
              ))}
              {hasMore && (
                <div className="flex justify-center py-6">
                  <button
                    type="button"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={isFetching}
                    className={cn(
                      'flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-medium transition-colors duration-200',
                      'bg-[#F1F3F5] text-[#495057] hover:bg-[#E9ECEF] dark:bg-white/[0.06] dark:text-white/70 dark:hover:bg-white/[0.1]',
                      'disabled:opacity-50',
                    )}
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

      {selectedId && (
        <div
          className="absolute inset-0 z-20 bg-black/30"
          onClick={() => setSelectedId(null)}
          aria-hidden
        />
      )}
      <div
        className={cn(
          'absolute right-0 top-0 z-30 h-full w-full max-w-2xl flex flex-col overflow-hidden shadow-2xl',
          'transition-transform duration-300 ease-in-out bg-[hsl(var(--card))]',
          selectedId ? 'translate-x-0' : 'translate-x-full',
        )}
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
