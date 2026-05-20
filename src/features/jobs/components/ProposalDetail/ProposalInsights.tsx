import { useTranslation } from 'react-i18next';
import { Eye } from 'lucide-react';
import { JointsBadge } from '@/components/joints';
import type { JobApplicationDto } from '@/types';

interface ProposalInsightsProps {
  application: JobApplicationDto;
}

export function ProposalInsights({ application }: ProposalInsightsProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900 p-5">
      <p className="mb-3 text-sm font-semibold text-foreground">
        {t('jobs.proposalInsights', 'Proposal insights')}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="flex flex-col items-center justify-center rounded-xl bg-white px-4 py-3 shadow-sm dark:bg-zinc-800">
          <JointsBadge value={application.jointsSpent} size="md" />
          <p className="mt-2 text-xs text-muted-foreground">{t('jobs.jointsSpent', 'Joints spent')}</p>
        </div>
        <div className="rounded-xl bg-white dark:bg-zinc-800 px-4 py-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-foreground">#{application.rank}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{t('jobs.rank', 'Rank')}</p>
        </div>
        <div className="rounded-xl bg-white dark:bg-zinc-800 px-4 py-3 text-center shadow-sm">
          <p className="text-lg font-bold text-foreground">
            {application.viewedAt
              ? <Eye className="h-5 w-5 text-blue-500 mx-auto" />
              : <span className="text-muted-foreground">—</span>}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {application.viewedAt ? t('jobs.viewed', 'Viewed') : t('jobs.notViewed', 'Not viewed')}
          </p>
        </div>
      </div>
    </div>
  );
}
