import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Zap, Eye, History, ChevronRight, AlertTriangle } from 'lucide-react';
import { CardsSkeleton } from '@/components/common/Skeletons';
import { ErrorState } from '@/components/common/States';
import { useMasterMyApplicationsQuery } from '@/features/jobs/jobsApi';
import { useJointsBalanceQuery, useJointsTransactionsQuery } from '@/features/joints/jointsApi';
import { cn } from '@/lib/utils';
import { formatDateTimeString } from '@/utils/date';
import type { JobApplicationDto } from '@/types';
import { ProposalDetail } from '@/features/jobs/components/ProposalDetail';
import { APP_STATUS_CFG, JOB_STATUS_BADGE_CFG, TX_LABEL } from '@/constants/jobs';

/* ── Main page ──────────────────────────────────────────────── */

/* ── Main page ──────────────────────────────────────────────── */
export default function MasterApplicationsPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<'applications' | 'history'>('applications');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const setSelected = (app: JobApplicationDto | null) => setSelectedId(app?.id ?? null);

  const { data, isLoading, isError, error, refetch } = useMasterMyApplicationsQuery(
    undefined, { pollingInterval: 30_000 }
  );
  const { data: balanceData } = useJointsBalanceQuery(undefined, { pollingInterval: 30_000 });
  const { data: txData, isLoading: txLoading } = useJointsTransactionsQuery();

  const selectApplication = (app: JobApplicationDto | null) => {
    setSelected(app);
    if (app) {
      setSearchParams({ id: app.id }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  if (isLoading) return <CardsSkeleton count={4} />;
  if (isError) return <ErrorState error={error as Error} onRetry={refetch} />;

  const items = data?.items ?? [];
  const transactions = txData?.items ?? [];
  const urlId = searchParams.get('id');
  const activeId = selectedId ?? urlId;
  const resolvedSelected = activeId ? (items.find((a) => a.id === activeId) ?? null) : null;

  if (resolvedSelected) {
    return (
      <ProposalDetail
        application={resolvedSelected}
        onBack={() => selectApplication(null)}
        onWithdrawn={() => selectApplication(null)}
        onUpdated={(updated) => { setSelectedId(updated.id); setSearchParams({ id: updated.id }, { replace: true }); }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:py-8">

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t('jobs.jobsAndJoints', 'Jobs & Joints')}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t('jobs.jobsAndJointsSubtitle', 'Your proposals and joints history')}
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-2xl bg-primary/8 px-4 py-2.5 text-sm font-bold text-primary">
          <Zap className="h-4 w-4" />
          {balanceData?.balance ?? 0}
          <span className="text-xs font-normal text-primary/70">joints</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-xl bg-muted p-1">
        {(['applications', 'history'] as const).map((t_) => (
          <button
            key={t_}
            onClick={() => setTab(t_)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors',
              tab === t_
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t_ === 'applications' ? (
              <>
                {t('jobs.myApplications', 'My Applications')}
                {items.length > 0 && (
                  <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                    {items.length}
                  </span>
                )}
              </>
            ) : (
              <>
                <History className="h-3.5 w-3.5" />
                {t('joints.history', 'Joints History')}
              </>
            )}
          </button>
        ))}
      </div>

      {/* Applications */}
      {tab === 'applications' && (
        items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
            <Zap className="mb-4 h-12 w-12 text-muted-foreground/30" />
            <h3 className="mb-2 text-base font-semibold text-foreground">
              {t('jobs.noApplicationsYet', 'No proposals yet')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('jobs.browseAndApply', 'Apply to jobs from the public job board to see your proposals here')}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Group header */}
            <p className="mb-3 text-sm font-semibold text-foreground">
              {t('jobs.submittedProposals', 'Submitted proposals')}
              <span className="ml-2 text-sm font-normal text-muted-foreground">({items.length})</span>
            </p>
            {items.map((app) => {
              const job = app.job as { id: string; title: string; status: string } | undefined;
              const cfg = APP_STATUS_CFG[app.status] ?? APP_STATUS_CFG.PENDING;
              const StatusIcon = cfg.icon;
              const jobInactive = job?.status === 'CLOSED' || job?.status === 'FOUND';
              const jobCfg = job ? JOB_STATUS_BADGE_CFG[job.status] : undefined;
              const JobIcon = jobCfg?.icon;

              return (
                <button
                  key={app.id}
                  onClick={() => selectApplication(app)}
                  className="group w-full rounded-xl px-4 py-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {job?.title ?? '—'}
                        </p>
                        {jobInactive && app.status === 'PENDING' && (
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatDateTimeString(app.createdAt)}</span>
                        {app.viewedAt && (
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {t('jobs.viewed', 'Viewed')}
                          </span>
                        )}
                        <span className="flex items-center gap-1 font-semibold text-primary">
                          <Zap className="h-3 w-3" />{app.jointsSpent}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {jobCfg && JobIcon && app.status === 'SELECTED' && (
                        <span className={cn('flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium', jobCfg.cls)}>
                          <JobIcon className="h-3 w-3" />
                          {t(jobCfg.labelKey, jobCfg.fallback)}
                        </span>
                      )}
                      <span className={cn('flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium', cfg.cls)}>
                        <StatusIcon className="h-3 w-3" />
                        {cfg.label}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )
      )}

      {/* History */}
      {tab === 'history' && (
        txLoading ? (
          <CardsSkeleton count={5} />
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-14 text-center">
            <History className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{t('joints.noHistory', 'No transactions yet')}</p>
          </div>
        ) : (
          <div className="space-y-1">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                <div className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                  tx.amount > 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15' : 'bg-red-50 text-red-500 dark:bg-red-500/15',
                )}>
                  <Zap className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{TX_LABEL[tx.type] ?? tx.type}</p>
                  {tx.description && (
                    <p className="truncate text-xs text-muted-foreground">{tx.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className={cn('text-sm font-bold', tx.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400')}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDateTimeString(tx.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
