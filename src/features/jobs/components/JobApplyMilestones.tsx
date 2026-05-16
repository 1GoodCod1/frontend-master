import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MilestoneDto } from '@/types';

interface JobApplyMilestonesProps {
  milestones: MilestoneDto[];
  updateMilestone: (i: number, patch: Partial<MilestoneDto>) => void;
  addMilestone: () => void;
  removeMilestone: (i: number) => void;
  jobBudget?: number | null;
}

export function JobApplyMilestones({
  milestones,
  updateMilestone,
  addMilestone,
  removeMilestone,
  jobBudget,
}: JobApplyMilestonesProps) {
  const { t } = useTranslation();

  const total = milestones.reduce((s, m) => s + (m.price || 0), 0);
  const remaining = jobBudget != null ? jobBudget - total : null;
  const over = remaining != null && remaining < 0;

  return (
    <div className="mt-4 space-y-3">
      <p className="text-xs font-semibold text-foreground">{t('jobs.milestones', 'Milestones')}</p>
      {milestones.map((m, i) => (
        <div key={i} className="flex items-center gap-2 rounded-xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] px-3 py-2.5">
          <span className="shrink-0 w-4 text-center text-[11px] font-semibold text-muted-foreground">{i + 1}</span>
          <input
            type="text"
            value={m.title}
            onChange={(e) => updateMilestone(i, { title: e.target.value })}
            placeholder={t('jobs.milestoneTitle', 'Task title')}
            maxLength={200}
            className="flex-1 min-w-0 rounded-lg border border-black/5 dark:border-white/5 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
          <input
            type="number"
            min={1}
            value={m.price || ''}
            onChange={(e) => updateMilestone(i, { price: Number(e.target.value) })}
            placeholder="MDL"
            className="w-24 shrink-0 rounded-lg border border-black/5 dark:border-white/5 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
          <input
            type="date"
            value={m.dueDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => updateMilestone(i, { dueDate: e.target.value })}
            className="w-36 shrink-0 rounded-lg border border-black/5 dark:border-white/5 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
          {milestones.length > 1 && (
            <button type="button" onClick={() => removeMilestone(i)} className="shrink-0 text-red-400 hover:text-red-600">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addMilestone}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/10 dark:border-white/10 py-3 text-xs text-muted-foreground hover:border-amber-500/40 hover:text-amber-600 transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        {t('jobs.addMilestone', 'Add milestone')}
      </button>

      {jobBudget != null && remaining != null && (
        <div className={cn(
          'flex items-center justify-between rounded-xl px-4 py-2.5 text-xs',
          over
            ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
            : 'bg-zinc-100 dark:bg-zinc-800 text-muted-foreground',
        )}>
          <span>
            {t('jobs.milestonesTotal', 'Total')}: <span className="font-semibold text-foreground">{total} MDL</span>
          </span>
          <span>
            {t('jobs.budget', 'Budget')}: <span className="font-semibold text-foreground">{jobBudget} MDL</span>
            {' · '}
            {over
              ? <span className="font-semibold text-red-600 dark:text-red-400">−{Math.abs(remaining)} MDL {t('jobs.overBudget', 'over budget')}</span>
              : <span className="font-semibold text-emerald-600 dark:text-emerald-400">+{remaining} MDL {t('jobs.remaining', 'remaining')}</span>
            }
          </span>
        </div>
      )}
    </div>
  );
}
