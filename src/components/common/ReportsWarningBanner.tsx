import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useReportsAgainstMeCountQuery } from '@/features/reports/reportsApi';
import { REPORTS_WARNING_THRESHOLD } from '@/constants';

export function ReportsWarningBanner() {
  const { t } = useTranslation();
  const { data, isLoading } = useReportsAgainstMeCountQuery();

  const count = (data as { count?: number } | undefined)?.count ?? 0;

  if (isLoading || count < REPORTS_WARNING_THRESHOLD) return null;

  return (
    <Alert className="mb-4 rounded-lg border-amber-500/50 bg-amber-500/10">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="font-bold">
        {t('dashboard.reportsWarning.title')}
      </AlertTitle>
      <AlertDescription className="mt-1">
        {t('dashboard.reportsWarning.message', { count })}
      </AlertDescription>
    </Alert>
  );
}
