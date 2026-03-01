import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingState, ErrorState } from '@/components/common/States';
import { useAdminAnalyticsQuery } from '@/features/admin/adminApi';
import { MetricCards } from '@/components/ui/MetricCards';
import { AutoCharts } from '@/components/common/AutoCharts';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

export default function AnalyticsAdminPage() {
  const { t } = useTranslation();
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week');
  const q = useAdminAnalyticsQuery({ timeframe } as any);

  const analyticsData = (() => {
    const raw = q.data as unknown;
    if (isRecord(raw) && isRecord(raw.data)) return raw.data;
    return raw;
  })();

  const timeframeLabel =
    timeframe === 'day'
      ? t('admin.analytics.viewingLast24h')
      : timeframe === 'week'
        ? t('admin.analytics.viewingLast7d')
        : t('admin.analytics.viewingLast30d');

  return (
    <div className="animate-in fade-in duration-200">
      <PageHeader title={t('admin.analytics.title')} subtitle={t('admin.analytics.subtitle')} />
      <SectionCard
        title={t('admin.analytics.overview')}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">{t('admin.analytics.timeframe')}</Label>
              <Select value={timeframe} onValueChange={(v) => setTimeframe(v as 'day' | 'week' | 'month')}>
                <SelectTrigger className="min-w-[220px]">
                  <SelectValue placeholder={t('admin.analytics.timeframe')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">📅 {t('admin.analytics.lastDay')}</SelectItem>
                  <SelectItem value="week">📊 {t('admin.analytics.lastWeek')}</SelectItem>
                  <SelectItem value="month">📈 {t('admin.analytics.lastMonth')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Badge variant="secondary" className="font-semibold">
              {timeframeLabel}
            </Badge>
          </div>
        }
      >
        {q.isLoading ? (
          <LoadingState />
        ) : q.isError ? (
          <ErrorState error={q.error as any} onRetry={() => q.refetch()} />
        ) : analyticsData ? (
          <div className="flex flex-col gap-6">
            <MetricCards data={analyticsData} />
            <AutoCharts title={t('admin.analytics.charts')} data={analyticsData} />
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">{t('admin.analytics.noDataAvailable')}</p>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
