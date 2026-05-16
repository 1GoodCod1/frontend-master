import { Clock, CheckCircle2, XCircle, ArchiveX, Lock } from 'lucide-react';

export const APP_STATUS_CFG: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  PENDING:  { label: 'Pending',      cls: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',   icon: Clock },
  SELECTED: { label: 'Selected',     cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', icon: CheckCircle2 },
  REJECTED: { label: 'Not selected', cls: 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400',           icon: XCircle },
};

export const JOB_STATUS_BADGE_CFG: Record<string, { labelKey: string; fallback: string; cls: string; icon: React.ElementType }> = {
  PENDING_CLOSE: { labelKey: 'jobs.pendingCloseStatus', fallback: 'Pending close', cls: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400', icon: ArchiveX },
  CLOSED:        { labelKey: 'jobs.closed',             fallback: 'Closed',        cls: 'bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300', icon: Lock },
};

export const TX_LABEL: Record<string, string> = {
  SUBSCRIPTION_CREDIT: 'Subscription credit',
  PURCHASE: 'Purchase',
  APPLICATION_SPEND: 'Spent on application',
  REFUND: 'Refund',
};
