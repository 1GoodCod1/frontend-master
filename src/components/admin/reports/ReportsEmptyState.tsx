import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';

interface ReportsEmptyStateProps {
  statusFilter: string;
}

export default function ReportsEmptyState({ statusFilter }: ReportsEmptyStateProps) {
  const { t } = useTranslation();

  return (
    <div className="p-6 rounded-lg border border-border text-center">
      <AlertTriangle className="mx-auto size-20 text-muted-foreground/30 mb-4" />
      <p className="text-lg font-semibold text-foreground mb-1">{t('admin.reports.noReports')}</p>
      <p className="text-sm text-muted-foreground">
        {statusFilter ? 'Try adjusting your filters' : 'No reports have been submitted yet'}
      </p>
    </div>
  );
}
