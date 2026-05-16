import { useTranslation } from 'react-i18next';
import { Zap } from 'lucide-react';
import type { JobApplicationDto } from '@/types';

interface ProposalTermsViewProps {
  application: JobApplicationDto;
}

export function ProposalTermsView({ application }: ProposalTermsViewProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900 p-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {t('jobs.yourTerms', 'Your proposed terms')}
      </p>
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-xl bg-white dark:bg-zinc-800 px-4 py-3 shadow-sm">
          <span className="text-sm text-muted-foreground">{t('jobs.paymentApproach', 'Payment approach')}</span>
          <span className="text-sm font-semibold text-foreground">
            {application.paymentType === 'FULL' ? t('jobs.fullPayment', 'Full Payment') : t('jobs.partialPayment', 'Milestones')}
          </span>
        </div>
        {application.paymentType === 'FULL' && application.deadline && (
          <div className="flex items-center justify-between rounded-xl bg-white dark:bg-zinc-800 px-4 py-3 shadow-sm">
            <span className="text-sm text-muted-foreground">{t('jobs.deadlineDays', 'Completion time')}</span>
            <span className="text-sm font-semibold text-foreground">
              {application.deadline} {t('jobs.days', 'days')}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between rounded-xl bg-white dark:bg-zinc-800 px-4 py-3 shadow-sm">
          <span className="text-sm text-muted-foreground">{t('jobs.jointsSpent', 'Joints bid')}</span>
          <span className="flex items-center gap-1 text-sm font-bold text-primary">
            <Zap className="h-3.5 w-3.5" />{application.jointsSpent}
          </span>
        </div>
      </div>

      {/* Milestones */}
      {application.paymentType === 'PARTIAL' && application.milestones && application.milestones.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">{t('jobs.milestones', 'Milestones')}</p>
          <div className="space-y-2">
            {application.milestones.map((m, i) => (
              <div key={i} className="rounded-xl bg-white dark:bg-zinc-800 px-4 py-3 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{i + 1}. {m.title}</p>
                    {m.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{m.description}</p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-foreground">{m.price} MDL</p>
                    <p className="text-xs text-muted-foreground">{new Date(m.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-end rounded-xl bg-primary/5 px-4 py-2">
              <span className="text-xs text-muted-foreground mr-2">{t('jobs.milestonesTotal', 'Total')}:</span>
              <span className="text-sm font-bold text-primary">
                {application.milestones.reduce((s, m) => s + m.price, 0)} MDL
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
