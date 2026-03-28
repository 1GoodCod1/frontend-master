import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LoadingState, ErrorState } from '@/components/common/States';
import AuditStatsCharts from '@/features/admin/components/audit/AuditStatsCharts';
import AuditCleanupPanel from '@/features/admin/components/audit/AuditCleanupPanel';

interface StatsTabProps {
  timeframe: 'day' | 'week' | 'month';
  onTimeframeChange: (timeframe: 'day' | 'week' | 'month') => void;
  stats: {
    isLoading: boolean;
    isError: boolean;
    error?: unknown;
    data?: unknown;
    refetch: () => void;
  };
}

export default function StatsTab({ timeframe, onTimeframeChange, stats }: StatsTabProps) {
  const { t } = useTranslation();
  const label =
    timeframe === 'day'
      ? t('admin.audit.statsPeriod_day')
      : timeframe === 'week'
        ? t('admin.audit.statsPeriod_week')
        : t('admin.audit.statsPeriod_month');

  return (
    <div className="space-y-6 mt-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={timeframe} onValueChange={(v) => onTimeframeChange(v as 'day' | 'week' | 'month')}>
          <SelectTrigger className="w-[220px] h-9" aria-label={t('admin.audit.statsTimeframe')}>
            <SelectValue placeholder={t('admin.audit.statsTimeframe')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">{t('admin.audit.statsPeriod_day')}</SelectItem>
            <SelectItem value="week">{t('admin.audit.statsPeriod_week')}</SelectItem>
            <SelectItem value="month">{t('admin.audit.statsPeriod_month')}</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="secondary" className="text-xs font-medium bg-primary/12 text-primary">
          {t('admin.audit.statsViewingPeriod', { label })}
        </Badge>
      </div>

      {stats.isLoading ? (
        <LoadingState />
      ) : stats.isError ? (
        <ErrorState error={stats.error} onRetry={stats.refetch} />
      ) : (
        <div className="space-y-8">
          <div>
            <h3 className="mb-2 text-sm font-semibold tracking-tight text-foreground">
              {t('admin.audit.auditStatistics')}
            </h3>
            <AuditStatsCharts data={stats.data} />
          </div>
          <AuditCleanupPanel />
        </div>
      )}
    </div>
  );
}
