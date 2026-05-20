import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Eye, History, ChevronRight, AlertTriangle, FileText } from 'lucide-react';
import { JointsBadge, JointsMark } from '@/components/joints';
import { CardsSkeleton } from '@/components/common/Skeletons';
import { ErrorState } from '@/components/common/States';
import { useMasterMyApplicationsQuery } from '@/features/jobs/jobsApi';
import { useJointsBalanceQuery, useJointsTransactionsQuery } from '@/features/joints/jointsApi';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/ui/PageHeader';
import { CabinetEmptyState } from '@/components/cabinet/CabinetEmptyState';
import {
  masterCardStaticCls,
  masterFilterPillCls,
  masterPageMediumClassName,
} from '@/lib/masterCabinetStyles';
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
    <div className={masterPageMediumClassName}>

      <PageHeader
        title={t('jobs.jobsAndJoints', 'Jobs & Joints')}
        subtitle={t('jobs.jobsAndJointsSubtitle', 'Your proposals and joints history')}
        actions={
        <JointsBadge value={balanceData?.balance ?? 0} size="lg" showLabel />
        }
      />

      <div className={cn(masterCardStaticCls, 'mb-5 flex gap-1 p-1')}>
        {(['applications', 'history'] as const).map((t_) => (
          <button
            key={t_}
            type="button"
            onClick={() => setTab(t_)}
            className={cn(
              masterFilterPillCls(tab === t_),
              'flex flex-1 items-center justify-center gap-1.5 py-2',
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

      {tab === 'applications' && (
        items.length === 0 ? (
          <CabinetEmptyState
            icon={FileText}
            title={t('jobs.noApplicationsYet', 'No proposals yet')}
            description={t('jobs.browseAndApply', 'Apply to jobs from the public job board to see your proposals here')}
          />
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
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[#E97525]" />
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
                        <JointsBadge value={app.jointsSpent} size="xs" />
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
                  <JointsMark className="h-4 w-4 text-[#D97706] dark:text-[#FBBF24]" />
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
