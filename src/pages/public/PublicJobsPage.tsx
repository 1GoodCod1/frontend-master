import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search, Bookmark, BookmarkCheck, Clock, DollarSign, Zap, Users,
  MapPin, X, CheckCircle2, Loader2, UserPlus, LogIn, ChevronLeft,
  Briefcase,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useJobsListQuery, useJobByIdQuery, useMasterMyApplicationsQuery } from '@/features/jobs/jobsApi';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthed, selectRole } from '@/features/auth/selectors';
import { Button } from '@/components/ui/button';
import { mediaUrl } from '@/utils/media';
import { cn } from '@/lib/utils';
import { paths } from '@/constants/routes';
import { USER_ROLE } from '@/constants/roles';
import type { JobDto } from '@/types';

/* ── Relative time ──────────────────────────────────────────── */
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

/* ── Saved jobs ─────────────────────────────────────────────── */
const SAVED_KEY = 'faber_saved_jobs';
function useSavedJobs() {
  const [saved, setSaved] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(SAVED_KEY) ?? '[]')); }
    catch { return new Set(); }
  });
  const toggle = useCallback((id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      localStorage.setItem(SAVED_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);
  return { saved, toggle };
}

function proposalRange(n: number, noProposalsLabel: string): string {
  if (n === 0) return noProposalsLabel;
  if (n < 5) return '< 5';
  if (n < 10) return '5–10';
  if (n < 20) return '10–20';
  if (n < 50) return '20–50';
  return '50+';
}

type SortTab = 'best' | 'recent' | 'saved';

/* ── Job list item ──────────────────────────────────────────── */
function JobListItem({ job, selected, onClick, saved, onSave, applied }: {
  job: JobDto;
  selected: boolean;
  onClick: () => void;
  saved: boolean;
  onSave: (e: React.MouseEvent) => void;
  applied: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="px-3 py-1.5">
      <Card
        onClick={onClick}
        className={cn(
          'group cursor-pointer transition-all hover:shadow-md',
          selected && 'bg-primary/5',
        )}
      >
        <CardContent className="p-4">
          {/* Row 1: title + bookmark */}
          <div className="mb-1.5 flex items-start justify-between gap-3">
            <h3 className={cn(
              'flex-1 min-w-0 text-sm font-semibold leading-snug line-clamp-1 transition-colors',
              selected ? 'text-primary' : 'text-foreground group-hover:text-primary',
            )}>
              {job.title}
            </h3>
            <button
              onClick={onSave}
              className={cn(
                'shrink-0 -mt-0.5 rounded-lg p-1.5 transition-colors',
                saved ? 'text-primary' : 'text-muted-foreground/30 group-hover:text-muted-foreground hover:!text-primary',
              )}
            >
              {saved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
            </button>
          </div>

          {/* Row 2: type · budget · time */}
          <div className="mb-2 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
            <span>{job.type === 'FIXED_PRICE' ? t('jobs.fixedPrice') : t('jobs.hourly')}</span>
            {(job.budget != null || job.hourlyRate != null) && (
              <>
                <span>·</span>
                <span className="font-medium text-foreground">
                  {job.budget != null ? `${job.budget} MDL` : `${job.hourlyRate} MDL/h`}
                </span>
              </>
            )}
            <span>·</span>
            <span>{timeAgo(job.createdAt)}</span>
          </div>

          {/* Row 3: description */}
          <p className="mb-3 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
            {job.description}
          </p>

          {/* Row 4: tags */}
          <div className="flex flex-wrap items-center gap-2">
            {job.city && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />{job.city.name}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />{proposalRange(job._count.applications, t('jobs.noProposals', 'No proposals'))}
            </span>
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
              <Zap className="h-2.5 w-2.5" />{job.minJoints} joints
            </span>
            {applied && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-2.5 w-2.5" />{t('jobs.applied', 'Applied')}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Job detail panel ───────────────────────────────────────── */
function JobDetailPanel({ jobId, onClose, savedIds, onSave, appliedIds }: {
  jobId: string; onClose: () => void;
  savedIds: Set<string>; onSave: (id: string) => void; appliedIds: Set<string>;
}) {
  const navigate = useNavigate();
  const isAuthed = useAppSelector(selectIsAuthed);
  const role = useAppSelector(selectRole);
  const isMaster = role === USER_ROLE.MASTER;
  const { t } = useTranslation();
  const { data: job, isLoading } = useJobByIdQuery({ id: jobId });
  const alreadyApplied = appliedIds.has(jobId);
  const isSaved = savedIds.has(jobId);


  if (isLoading || !job) return (
    <div className="flex flex-1 items-center justify-center py-24">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/30" />
    </div>
  );

  const isOpen = job.status === 'OPEN';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-6 py-3.5">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline text-sm">{t('jobs.back')}</span>
        </button>
        <div className="flex items-center gap-2">
          <span className={cn(
            'rounded-full px-2.5 py-0.5 text-xs font-semibold',
            isOpen
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
              : 'bg-muted text-muted-foreground',
          )}>
            {isOpen ? t('jobs.open') : job.status === 'FOUND' ? t('jobs.filled') : t('jobs.closed')}
          </span>
          <button
            onClick={() => onSave(jobId)}
            className={cn(
              'flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors',
              isSaved
                ? 'bg-primary/10 text-primary'
                : 'bg-muted/60 hover:bg-muted text-muted-foreground',
            )}
          >
            {isSaved
              ? <><BookmarkCheck className="h-3.5 w-3.5" />{t('jobs.saved')}</>
              : <><Bookmark className="h-3.5 w-3.5" />{t('jobs.save')}</>}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-7 py-6 space-y-6">

          {/* Title + meta */}
          <div>
            <h1 className="mb-2.5 text-2xl font-bold tracking-tight text-foreground leading-tight">{job.title}</h1>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{t('jobs.postedAgo', { time: timeAgo(job.createdAt) })}</span>
              {job.city && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.city.name}</span>}
              {!job.cityId && <span className="flex items-center gap-1">🌍 {t('jobs.worldwide')}</span>}
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              { label: t('jobs.typeLabel'), value: job.type === 'FIXED_PRICE' ? t('jobs.fixedPrice') : t('jobs.hourly'), icon: <Clock className="h-4 w-4" /> },
              {
                label: t('jobs.budget'), icon: <DollarSign className="h-4 w-4" />,
                value: job.budget != null ? `${job.budget} MDL` : job.hourlyRate != null ? `${job.hourlyRate}/h` : '—',
              },
              { label: t('jobs.minJointsLabel'), value: `${job.minJoints}`, icon: <Zap className="h-4 w-4" />, accent: true },
              { label: t('jobs.proposalsLabel'), value: `${job._count.applications}`, icon: <Users className="h-4 w-4" /> },
            ].map((s) => (
              <div
                key={s.label}
                className={cn(
                  'rounded-2xl px-4 py-3 text-center',
                  s.accent
                    ? 'bg-primary/10'
                    : 'bg-muted/50',
                )}
              >
                <p className={cn('mb-1 text-[11px] font-medium uppercase tracking-wide', s.accent ? 'text-primary/60' : 'text-muted-foreground')}>
                  {s.label}
                </p>
                <p className={cn('flex items-center justify-center gap-1 text-sm font-bold', s.accent ? 'text-primary' : 'text-foreground')}>
                  {s.icon}{s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Photos */}
          {job.photos?.length > 0 && (
            <div>
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">{t('jobs.photos')}</p>
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {job.photos.map((p) => (
                  <img key={p.id} src={mediaUrl(p.file.path)} alt=""
                    className="h-28 w-28 shrink-0 rounded-2xl object-cover" />
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">{t('jobs.description')}</p>
            <p className="whitespace-pre-wrap text-sm text-foreground/80 leading-relaxed">{job.description}</p>
          </div>

          {/* Apply section */}
          {!isOpen ? (
            <div className="rounded-2xl bg-muted/50 px-5 py-4 text-sm text-muted-foreground text-center">
              {t('jobs.notAccepting')}
            </div>
          ) : isMaster ? (
            alreadyApplied ? (
              <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 px-5 py-4">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">{t('jobs.alreadyApplied')}</p>
                  <p className="text-xs text-emerald-700/60 dark:text-emerald-400/60">{t('jobs.proposalSubmitted')}</p>
                </div>
              </div>
            ) : null
          ) : !isAuthed ? (
            <div className="rounded-2xl bg-muted/40 p-6 text-center">
              <Briefcase className="mx-auto mb-3 h-9 w-9 text-muted-foreground/25" />
              <p className="mb-1 text-sm font-semibold text-foreground">{t('jobs.registerToApply')}</p>
              <p className="mb-4 text-xs text-muted-foreground">{t('jobs.registerFreeAccount')}</p>
              <div className="flex gap-2 justify-center">
                <Button size="sm" className="gap-1.5" onClick={() => navigate(paths.register)}>
                  <UserPlus className="h-3.5 w-3.5" />{t('jobs.register')}
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => navigate(paths.login)}>
                  <LogIn className="h-3.5 w-3.5" />{t('jobs.logIn')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-muted/40 px-5 py-4 text-sm text-muted-foreground text-center">
              {t('jobs.mastersOnly')}
            </div>
          )}
        </div>
      </div>

      {/* Sticky apply footer */}
      {isOpen && isMaster && !alreadyApplied && (
        <div className="shrink-0 px-6 py-4">
          <Button className="w-full gap-2 h-11 font-semibold" onClick={() => navigate(`/dashboard/jobs/${jobId}/apply`)}>
            <Zap className="h-4 w-4" />{t('jobs.applyNow')}
          </Button>
        </div>
      )}
    </div>
  );
}

const PAGE_LIMIT = 20;

/* ── Main page ──────────────────────────────────────────────── */
export default function PublicJobsPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<SortTab>((searchParams.get('sort') as SortTab) ?? 'recent');
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('q') ?? '');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get('apply'));
  const { saved, toggle: toggleSave } = useSavedJobs();

  // Ref-based page cache — avoids setState inside effects for infinite scroll
  const pageCacheRef = useRef<Map<string, JobDto[]>>(new Map());

  const isAuthed = useAppSelector(selectIsAuthed);
  const role = useAppSelector(selectRole);
  const isMaster = role === USER_ROLE.MASTER;

  // Debounce search — resets pagination and cache when query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
      pageCacheRef.current = new Map();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Sync state → URL params
  useEffect(() => {
    const params: Record<string, string> = {};
    if (tab !== 'recent') params.sort = tab;
    if (search) params.q = search;
    if (selectedId) params.apply = selectedId;
    setSearchParams(params, { replace: true });
  }, [tab, search, selectedId, setSearchParams]);

  const apiSort: 'recent' | 'best' | undefined = tab === 'best' ? 'best' : tab === 'recent' ? 'recent' : undefined;

  const { data, isLoading, isFetching, requestId } = useJobsListQuery({
    limit: PAGE_LIMIT,
    page,
    search: debouncedSearch || undefined,
    sort: apiSort,
  } as Parameters<typeof useJobsListQuery>[0], { pollingInterval: 60_000 });

  // When RTK Query starts a new request (invalidation-triggered refetch), clear stale page cache
  const lastRequestIdRef = useRef<string | undefined>(undefined);
  if (requestId && requestId !== lastRequestIdRef.current) {
    lastRequestIdRef.current = requestId;
    pageCacheRef.current = new Map();
  }

  // Reset page to 1 when a new network request starts (e.g. after cache invalidation)
  useEffect(() => {
    if (requestId) setPage(1);
  }, [requestId]);

  // Populate page cache on new data (ref mutation — no setState needed)
  const cacheKey = `${debouncedSearch}:${tab}:${page}`;
  if (data?.items) {
    pageCacheRef.current.set(cacheKey, data.items);
  }

  const total = data?.total ?? 0;

  // Derive accumulated items from cache — data in deps so useMemo re-runs when API response arrives
  const allItems = useMemo(() => {
    const result: JobDto[] = [];
    for (let p = 1; p <= page; p++) {
      const chunk = pageCacheRef.current.get(`${debouncedSearch}:${tab}:${p}`);
      if (chunk) result.push(...chunk);
    }
    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, page, debouncedSearch, tab, data]);

  const hasMore = allItems.length < total;

  const { data: myAppsData } = useMasterMyApplicationsQuery(undefined, { skip: !isMaster || !isAuthed });
  const appliedIds = useMemo(
    () => new Set((myAppsData?.items ?? []).map((a) => a.jobId)),
    [myAppsData],
  );

  // Saved tab filters client-side from all loaded items
  const displayItems = tab === 'saved' ? allItems.filter((j) => saved.has(j.id)) : allItems;
  const savedCount = allItems.filter((j) => saved.has(j.id)).length;

  return (
    <div className="relative flex h-[calc(100vh-64px)] overflow-hidden">

      {/* ══ List panel — always full width ══ */}
      <div className="flex w-full flex-col">

        {/* Search */}
        <div className="max-w-3xl mx-auto w-full px-4 py-4">
          <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-2.5 focus-within:border-primary/50 transition-colors">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground/60" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('jobs.searchPlaceholder', 'Search jobs…')}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/45"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-3xl mx-auto w-full flex items-end px-4">
          {([
            { key: 'best' as SortTab, label: t('jobs.tabBestMatches', 'Best Matches') },
            { key: 'recent' as SortTab, label: t('jobs.tabMostRecent', 'Most Recent') },
            { key: 'saved' as SortTab, label: savedCount > 0 ? `${t('jobs.tabSaved', 'Saved')} (${savedCount})` : t('jobs.tabSaved', 'Saved') },
          ]).map((item) => (
            <button
              key={item.key}
              onClick={() => { setTab(item.key); setPage(1); pageCacheRef.current = new Map(); }}
              className={cn(
                'px-4 py-2.5 text-sm font-medium relative transition-all after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:rounded-full after:transition-all',
                tab === item.key
                  ? 'text-foreground after:bg-primary'
                  : 'text-muted-foreground hover:text-foreground after:bg-transparent',
              )}
            >
              {item.label}
            </button>
          ))}
          <span className="ml-auto self-center pb-2.5 pr-1 text-xs text-muted-foreground/50">
            {!isLoading && total > 0 && `${total} ${t('jobs.jobsCount', 'jobs')}`}
          </span>
        </div>

        {/* List */}
        <div className="max-w-3xl mx-auto w-full flex-1 overflow-y-auto py-2">
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

      {/* ══ Detail overlay drawer ══ */}
      {/* Backdrop */}
      {selectedId && (
        <div
          className="absolute inset-0 z-20 bg-black/30"
          onClick={() => setSelectedId(null)}
        />
      )}
      {/* Drawer */}
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
