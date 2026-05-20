import { useTranslation } from 'react-i18next';
import { X, Plus, Save } from 'lucide-react';
import { JointsBadge, JointsMark } from '@/components/joints';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { MilestoneDto, JobApplicationDto } from '@/types';

type LeaderboardEntry = {
  rank: number;
  jointsSpent: number;
};

type LeaderboardData = {
  leaderboard: LeaderboardEntry[];
};

interface ProposalEditFormProps {
  application: JobApplicationDto;
  editDeadline: string;
  setEditDeadline: (val: string) => void;
  editMilestones: MilestoneDto[];
  updateMilestone: (i: number, patch: Partial<MilestoneDto>) => void;
  addMilestone: () => void;
  removeMilestone: (i: number) => void;
  boostJoints: string;
  setBoostJoints: (val: string | ((v: string) => string)) => void;
  leaderboard: LeaderboardData | undefined;
  handleSave: () => void;
  setEditing: (val: boolean) => void;
  isSaving: boolean;
}

export function ProposalEditForm({
  application,
  editDeadline,
  setEditDeadline,
  editMilestones,
  updateMilestone,
  addMilestone,
  removeMilestone,
  boostJoints,
  setBoostJoints,
  leaderboard,
  handleSave,
  setEditing,
  isSaving,
}: ProposalEditFormProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900 p-5 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {application.paymentType === 'FULL'
          ? t('jobs.deadlineDays', 'Completion time (days)')
          : t('jobs.milestones', 'Milestones')}
      </p>

      {application.paymentType === 'FULL' && (
        <input
          type="number"
          min={1}
          max={365}
          value={editDeadline}
          onChange={(e) => setEditDeadline(e.target.value)}
          className="w-32 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      )}

      {application.paymentType === 'PARTIAL' && (
        <>
          {editMilestones.map((m, i) => (
            <div key={i} className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2">
              <span className="shrink-0 w-4 text-center text-[11px] font-semibold text-muted-foreground">{i + 1}</span>
              <input
                type="text"
                value={m.title}
                onChange={(e) => updateMilestone(i, { title: e.target.value })}
                placeholder={t('jobs.milestoneTitle', 'Task title')}
                className="flex-1 min-w-0 bg-transparent text-sm focus:outline-none"
              />
              <input
                type="number"
                min={1}
                value={m.price || ''}
                onChange={(e) => updateMilestone(i, { price: Number(e.target.value) })}
                placeholder="MDL"
                className="w-20 shrink-0 bg-transparent text-sm text-right focus:outline-none"
              />
              <input
                type="date"
                value={m.dueDate}
                onChange={(e) => updateMilestone(i, { dueDate: e.target.value })}
                className="w-32 shrink-0 bg-transparent text-sm focus:outline-none"
              />
              {editMilestones.length > 1 && (
                <button type="button" onClick={() => removeMilestone(i)} className="shrink-0 text-red-400 hover:text-red-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addMilestone}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 py-2.5 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            {t('jobs.addMilestone', 'Add milestone')}
          </button>
        </>
      )}

      {/* Boost section */}
      <div className="rounded-xl border border-amber-300/40 bg-amber-500/5 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <JointsMark className="h-4 w-4 text-[#D97706] dark:text-[#FBBF24]" />
          <p className="text-sm font-semibold text-foreground">{t('jobs.boostProposal', 'Boost proposal')}</p>
        </div>

        {/* Leaderboard */}
        {leaderboard && leaderboard.leaderboard.length > 0 && (
          <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-zinc-100 dark:bg-zinc-800">
                  <th className="px-3 py-2 text-left font-semibold text-muted-foreground">#</th>
                  <th className="px-3 py-2 text-left font-semibold text-muted-foreground">{t('jobs.applicant', 'Applicant')}</th>
                  <th className="px-3 py-2 text-right font-semibold text-muted-foreground">{t('jobs.joints', 'Joints')}</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.leaderboard.map((entry: LeaderboardEntry, i: number) => {
                  const isMe = entry.jointsSpent === application.jointsSpent && entry.rank === application.rank;
                  return (
                    <tr
                      key={i}
                      className={cn(
                        'border-t border-zinc-200 dark:border-zinc-700',
                        isMe ? 'bg-amber-50 dark:bg-amber-500/10 font-semibold' : 'bg-white dark:bg-zinc-900',
                      )}
                    >
                      <td className="px-3 py-2 text-muted-foreground">#{entry.rank}</td>
                      <td className="px-3 py-2 text-foreground">
                        {isMe ? `${t('jobs.you', 'You')} ★` : t('jobs.anonymous', 'Anonymous master')}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <JointsBadge value={entry.jointsSpent} size="xs" className="ml-auto" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Boost input */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setBoostJoints((v) => String(Math.max(application.jointsSpent, Number(v) - 1)))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-lg font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          >−</button>
          <input
            type="number"
            min={application.jointsSpent}
            value={boostJoints}
            onChange={(e) => setBoostJoints(e.target.value)}
            className="w-20 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-center text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <button
            type="button"
            onClick={() => setBoostJoints((v) => String(Number(v) + 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-lg font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          >+</button>
          <span className="text-xs text-muted-foreground">
            {Number(boostJoints) > application.jointsSpent
              ? <span className="text-amber-600 dark:text-amber-400">+{Number(boostJoints) - application.jointsSpent} {t('joints.joints', 'joints')}</span>
              : t('jobs.currentBid', 'current bid')}
          </span>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button size="sm" className="gap-1.5" onClick={() => void handleSave()} disabled={isSaving}>
          <Save className="h-3.5 w-3.5" />
          {t('common.save', 'Save')}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
          {t('common.cancel', 'Cancel')}
        </Button>
      </div>
    </div>
  );
}
