import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Eye,
  Star,
  DollarSign,
  Download,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAnalyticsMyQuery } from '@/features/analytics/analyticsApi';
import { useMastersMyProfileQuery } from '@/features/masters/mastersApi';
import { useAppSelector } from '@/app/hooks';
import { selectPlan } from '@/features/auth/selectors';
import { exportService } from '@/features/export/exportApi';
import { extractItems } from '@/utils/data';
import { LoadingState, ErrorState } from '@/components/common/States';
import { LineChartCard } from '@/components/ui/LineChartCard';
import { BarChartCard } from '@/components/ui/BarChartCard';
import { StatCard } from '@/components/ui/StatCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

type ChartDataItem = {
  date: string;
  leads: number;
  views: number;
  reviews: number;
  revenue: number;
  rating: number;
};

type ConversionData = { viewsToLeads?: number; leadsToBookings?: number; bookingsToReviews?: number };
type RoiData = { roiPercent?: number; spent?: number; earned?: number };

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const plan = useAppSelector(selectPlan) ?? 'BASIC';
  const isPremium = plan === 'PREMIUM';
  const isVip = plan === 'VIP';

  const defaultDays = isPremium ? 30 : 7;
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');

  const { data: analytics, isLoading, error, refetch } = useAnalyticsMyQuery({ days: defaultDays });

  const myProfile = useMastersMyProfileQuery();
  const masterId = (myProfile.data as { data?: { id?: string }; id?: string })?.data?.id ?? (myProfile.data as { id?: string })?.id ?? null;
  const accessToken = useAppSelector((state) => state.auth.tokens?.accessToken);

  if (isLoading) return <LoadingState label={t('analyticsPage.loading', 'Загрузка аналитики...')} />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const data = analytics as Record<string, unknown> | undefined;
  const analyticsData = (data?.data as Record<string, unknown>) || data || {};
  const summary = (analyticsData?.summary as Record<string, unknown>) || (data?.summary as Record<string, unknown>) || {};
  const trends = (analyticsData?.trends as Record<string, unknown>) || (data?.trends as Record<string, unknown>);
  const conversion = (analyticsData?.conversion as Record<string, unknown>) || (data?.conversion as Record<string, unknown>);
  const comparison = (analyticsData?.comparison as Record<string, unknown>) || (data?.comparison as Record<string, unknown>);
  const forecast = (analyticsData?.forecast as Record<string, unknown>) || (data?.forecast as Record<string, unknown>);
  const peakHours = Array.isArray(analyticsData?.peakHours)
    ? analyticsData.peakHours
    : Array.isArray(data?.peakHours)
      ? data.peakHours
      : [];
  const topSources = Array.isArray(analyticsData?.topSources)
    ? analyticsData.topSources
    : Array.isArray(data?.topSources)
      ? data.topSources
      : [];

  const readNumber = (obj: Record<string, unknown>, keys: string[]): number => {
    for (const key of keys) {
      const value = obj[key];
      if (typeof value === 'number') return value;
      if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
        return Number(value);
      }
    }
    return 0;
  };

  const rawData = extractItems<Record<string, unknown>>(analyticsData?.data ?? data?.data ?? analyticsData ?? data);
  const chartData: ChartDataItem[] = rawData.map((item) => ({
    date: String(item.date ?? ''),
    leads: readNumber(item, ['leadsCount', 'leads', 'totalLeads']),
    views: readNumber(item, ['viewsCount', 'views', 'totalViews']),
    reviews: readNumber(item, ['reviewsCount', 'reviews', 'totalReviews']),
    revenue: readNumber(item, ['revenue', 'totalRevenue']),
    rating: readNumber(item, ['rating', 'avgRating']),
  }));

  const sectionHeader = (icon: React.ReactNode, title: string, subtitle: string) => (
    <div className="border-b border-slate-100 dark:border-white/[0.08] bg-slate-50/80 dark:bg-white/[0.04] px-6 py-5">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-500">{icon}</div>
        <div>
          <h2 className="text-lg font-semibold text-foreground tracking-tight">{title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8 lg:px-8">
      <div className="mb-8">
        <PageHeader
          title={t('analyticsPage.title', 'Аналитика')}
          subtitle={
            isPremium
              ? t('analyticsPage.subtitleBoost', 'Расширенная аналитика и прогнозы')
              : t('analyticsPage.subtitleVip', 'Базовая аналитика и тренды')
          }
          actions={
            <div className="flex flex-wrap items-center gap-2">
              {isPremium && (
                <Badge variant="secondary" className="gap-1 font-semibold">
                  <BarChart3 className="size-3.5" />
                  {t('analyticsPage.premiumBadge', 'PREMIUM - Расширенная аналитика')}
                </Badge>
              )}
              {isPremium && masterId && (
                <Button
                  size="sm"
                  className="gap-1.5 border-0 bg-amber-600 text-white shadow-md transition-all hover:bg-amber-700 hover:shadow-lg dark:bg-amber-600 dark:hover:bg-amber-500"
                  onClick={async () => {
                    try {
                      await exportService.exportAnalyticsPDF(masterId, accessToken ?? undefined);
                      toast.success(t('export.analyticsPDFSuccess'));
                    } catch (err: unknown) {
                      const msg = err instanceof Error ? err.message : t('export.exportFailed');
                      toast.error(msg);
                    }
                  }}
                >
                  <Download className="size-4" />
                  {t('export.exportPDF')}
                </Button>
              )}
            </div>
          }
        />
      </div>

      {/* Summary */}
      <Card className="mb-6 overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition-all duration-300">
        {sectionHeader(
          <BarChart3 className="size-5" />,
          t('analyticsPage.summary', 'Основные показатели'),
          t('analyticsPage.summarySubtitle', 'За последние {{days}} дней', { days: defaultDays })
        )}
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard
              title={t('analyticsPage.totalLeads', 'Всего лидов')}
              value={readNumber(summary, ['totalLeads', 'leadsCount', 'leads'])}
              trend={trends?.leadsTrend as 'up' | 'down' | 'stable' | undefined}
              changePercent={trends?.leadsChangePercent as number | undefined}
              icon={<TrendingUp className="size-5 text-amber-600 dark:text-amber-500 opacity-70" />}
            />
            <StatCard
              title={t('analyticsPage.totalViews', 'Просмотры')}
              value={readNumber(summary, ['totalViews', 'viewsCount', 'views'])}
              trend={trends?.viewsTrend as 'up' | 'down' | 'stable' | undefined}
              changePercent={trends?.viewsChangePercent as number | undefined}
              icon={<Eye className="size-5 text-blue-500 opacity-70 dark:text-blue-400" />}
            />
            <StatCard
              title={t('analyticsPage.totalReviews', 'Отзывы')}
              value={readNumber(summary, ['totalReviews', 'reviewsCount', 'reviews'])}
              icon={<Star className="size-5 text-amber-500 opacity-70 dark:text-amber-400" />}
            />
            <StatCard
              title={t('analyticsPage.totalRevenue', 'Выручка')}
              value={`${readNumber(summary, ['totalRevenue', 'revenue'])} MDL`}
              trend={trends?.revenueTrend as 'up' | 'down' | 'stable' | undefined}
              changePercent={trends?.revenueChangePercent as number | undefined}
              icon={<DollarSign className="size-5 text-emerald-600 opacity-70 dark:text-emerald-400" />}
            />
          </div>
        </CardContent>
      </Card>

      {/* Conversion (Premium) */}
      {isPremium && Boolean(conversion) && (
        <Card className="mb-6 overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition-all duration-300">
          {sectionHeader(
            <TrendingUp className="size-5" />,
            t('analyticsPage.conversion', 'Воронка продаж'),
            t('analyticsPage.conversionSubtitle', 'Эффективность каждого этапа')
          )}
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50/80 dark:bg-white/[0.04] rounded-xl border border-slate-100 dark:border-white/[0.08]">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">{t('analyticsPage.views', 'Просмотры')}</span>
                <span className="text-2xl font-black">{readNumber(summary, ['totalViews', 'viewsCount', 'views'])}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50/80 dark:bg-white/[0.04] rounded-xl border border-slate-100 dark:border-white/[0.08] relative">
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 bg-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white z-10">
                  {Number((conversion as ConversionData).viewsToLeads || 0).toFixed(1)}%
                </div>
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">{t('analyticsPage.leads', 'Лиды')}</span>
                <span className="text-2xl font-black">{readNumber(summary, ['totalLeads', 'leadsCount', 'leads'])}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50/80 dark:bg-white/[0.04] rounded-xl border border-slate-100 dark:border-white/[0.08] relative">
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 bg-amber-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white z-10">
                  {Number((conversion as ConversionData).leadsToBookings || 0).toFixed(1)}%
                </div>
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">{t('analyticsPage.bookings', 'Записи')}</span>
                <span className="text-2xl font-black">{Number(analyticsData.bookingsCount ?? 0)}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50/80 dark:bg-white/[0.04] rounded-xl border border-slate-100 dark:border-white/[0.08] relative">
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 bg-emerald-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white z-10">
                  {Number((conversion as ConversionData).bookingsToReviews || 0).toFixed(1)}%
                </div>
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">{t('analyticsPage.reviews', 'Отзывы')}</span>
                <span className="text-2xl font-black">{readNumber(summary, ['totalReviews', 'reviewsCount', 'reviews'])}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ROI & Insights (Premium) */}
      {isPremium &&
        (Boolean(analyticsData.roi) || Boolean(analyticsData.insights)) && (
          <div className="grid gap-6 md:grid-cols-3 mb-6">
            {analyticsData.roi != null && (
              <Card className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition-all duration-300 border-emerald-200/50 dark:border-emerald-600/30 md:col-span-1">
                <div className="border-b border-slate-100 dark:border-white/[0.08] bg-emerald-500/10 dark:bg-emerald-500/20 px-6 py-4">
                  <h3 className="font-bold flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                    <DollarSign className="size-4" />
                    {t('analyticsPage.roiTitle', 'ROI / Эффективность')}
                  </h3>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-sm text-muted-foreground">{t('analyticsPage.roiPayback', 'Окупаемость')}:</span>
                      <span className={cn(
                        "text-2xl font-black",
                        ((analyticsData.roi as RoiData)?.roiPercent ?? 0) > 0 ? "text-emerald-600" : "text-amber-500"
                      )}>
                        {(analyticsData.roi as RoiData)?.roiPercent ?? 0}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, Math.max(0, (analyticsData.roi as RoiData)?.roiPercent ?? 0))}%` }} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-slate-50 dark:bg-white/[0.06] rounded-lg">
                        <p className="text-muted-foreground mb-1">{t('analyticsPage.roiSpent', 'Потрачено')}</p>
                        <p className="font-bold">{(analyticsData.roi as RoiData).spent} MDL</p>
                      </div>
                      <div className="p-2 bg-slate-50 dark:bg-white/[0.06] rounded-lg">
                        <p className="text-muted-foreground mb-1">{t('analyticsPage.roiEarned', 'Заработано')}</p>
                        <p className="font-bold">{(analyticsData.roi as RoiData).earned} MDL</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {Array.isArray(analyticsData.insights) && (
              <Card className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition-all duration-300 border-blue-200/50 dark:border-blue-600/30 md:col-span-2">
                <div className="border-b border-slate-100 dark:border-white/[0.08] bg-blue-500/10 dark:bg-blue-500/20 px-6 py-4">
                  <h3 className="font-bold flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <TrendingUp className="size-4" />
                    {t('analyticsPage.insightsTitle', 'Персональные инсайты')}
                  </h3>
                </div>
                <CardContent className="p-6">
                  <ul className="space-y-3">
                    {(analyticsData.insights as string[]).map((insight, idx) => (
                      <li key={idx} className="text-sm flex gap-3 items-start">
                        <div className="size-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-blue-600 dark:text-blue-400 font-black text-[10px]">{idx + 1}</span>
                        </div>
                        <p className="leading-relaxed">{insight}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}

      {/* Comparison (Premium) */}
      {isPremium && Boolean(comparison) && (
        <Card className="mb-6 overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition-all duration-300">
          {sectionHeader(
            <Eye className="size-5" />,
            t('analyticsPage.comparison', 'Сравнение с конкурентами'),
            t('analyticsPage.comparisonSubtitle', 'Ваша позиция в категории и городе')
          )}
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/30 dark:backdrop-blur-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] hover:shadow-[0_6px_24px_rgb(0,0,0,0.06)] dark:shadow-none dark:hover:bg-white/[0.03] transition-all duration-300">
                <CardContent className="p-6">
                  <h3 className="mb-4 text-base font-bold">
                    {t('analyticsPage.categoryAverage', 'Средние показатели в категории')}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="mb-0.5 text-sm text-muted-foreground">{t('analyticsPage.avgLeads', 'Средние лиды')}</p>
                      <p className="text-xl font-bold">{(Number((comparison.categoryAvg as { avgLeads?: number })?.avgLeads) || 0).toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="mb-0.5 text-sm text-muted-foreground">{t('analyticsPage.avgViews', 'Средние просмотры')}</p>
                      <p className="text-xl font-bold">{(Number((comparison.categoryAvg as { avgViews?: number })?.avgViews) || 0).toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="mb-0.5 text-sm text-muted-foreground">{t('analyticsPage.yourPosition', 'Ваша позиция')}</p>
                      <p className="text-xl font-bold text-amber-600 dark:text-amber-500">#{String((comparison.position as { inCategory?: number })?.inCategory ?? '—')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/30 dark:backdrop-blur-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] hover:shadow-[0_6px_24px_rgb(0,0,0,0.06)] dark:shadow-none dark:hover:bg-white/[0.03] transition-all duration-300">
                <CardContent className="p-6">
                  <h3 className="mb-4 text-base font-bold">
                    {t('analyticsPage.cityAverage', 'Средние показатели в городе')}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="mb-0.5 text-sm text-muted-foreground">{t('analyticsPage.avgLeads', 'Средние лиды')}</p>
                      <p className="text-xl font-bold">{(Number((comparison.cityAvg as { avgLeads?: number })?.avgLeads) || 0).toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="mb-0.5 text-sm text-muted-foreground">{t('analyticsPage.avgViews', 'Средние просмотры')}</p>
                      <p className="text-xl font-bold">{(Number((comparison.cityAvg as { avgViews?: number })?.avgViews) || 0).toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="mb-0.5 text-sm text-muted-foreground">{t('analyticsPage.yourPosition', 'Ваша позиция')}</p>
                      <p className="text-xl font-bold text-amber-600 dark:text-amber-500">#{String((comparison.position as { inCity?: number })?.inCity ?? '—')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Forecast (Premium) */}
      {isPremium && forecast && (
        <Card className="mb-6 overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition-all duration-300">
          {sectionHeader(
            <TrendingUp className="size-5" />,
            t('analyticsPage.forecast', 'Прогноз на следующую неделю'),
            t('analyticsPage.forecastSubtitle', 'Прогнозируемые показатели')
          )}
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard
                title={t('analyticsPage.forecastLeads', 'Прогноз лидов')}
                value={Number(forecast.nextWeekLeads) || 0}
                subtitle={t('analyticsPage.confidence', 'Уверенность: {{confidence}}%', { confidence: Number(forecast.confidence) || 0 })}
              />
              <StatCard
                title={t('analyticsPage.forecastViews', 'Прогноз просмотров')}
                value={Number(forecast.nextWeekViews) || 0}
              />
              <StatCard
                title={t('analyticsPage.forecastRevenue', 'Прогноз выручки')}
                value={`${Number(forecast.nextWeekRevenue) || 0} MDL`}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <Card className="mb-6 overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition-all duration-300">
        {sectionHeader(
          <BarChart3 className="size-5" />,
          t('analyticsPage.charts', 'Графики'),
          t('analyticsPage.chartsSubtitle', 'Визуализация данных')
        )}
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'overview' | 'details')} className="mb-6">
            <TabsList>
              <TabsTrigger value="overview">{t('analyticsPage.tabOverview', 'Обзор')}</TabsTrigger>
              {isPremium && <TabsTrigger value="details">{t('analyticsPage.tabDetails', 'Детали')}</TabsTrigger>}
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <LineChartCard
                  title={t('analyticsPage.leadsChart', 'Лиды')}
                  data={chartData.map((d) => ({ date: d.date, value: d.leads }))}
                />
                <LineChartCard
                  title={t('analyticsPage.viewsChart', 'Просмотры')}
                  data={chartData.map((d) => ({ date: d.date, value: d.views }))}
                />
                <LineChartCard
                  title={t('analyticsPage.reviewsChart', 'Отзывы')}
                  data={chartData.map((d) => ({ date: d.date, value: d.reviews }))}
                />
                <LineChartCard
                  title={t('analyticsPage.revenueChart', 'Выручка')}
                  data={chartData.map((d) => ({ date: d.date, value: d.revenue }))}
                />
              </div>
            </TabsContent>

            {isPremium && (
              <TabsContent value="details" className="mt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {peakHours.length > 0 && (
                    <BarChartCard
                      title={t('analyticsPage.peakHours', 'Пиковые часы')}
                      data={peakHours.map((h: Record<string, unknown>) => ({
                        hour: `${h.hour}:00`,
                        leads: Number(h.leadsCount),
                        views: Number(h.viewsCount),
                      }))}
                      xKey="hour"
                    />
                  )}
                  {topSources.length > 0 && (
                    <BarChartCard
                      title={t('analyticsPage.topSources', 'Топ источники')}
                      data={topSources.map((s: Record<string, unknown>) => ({
                        source: String(s.source),
                        leads: Number(s.leads),
                        views: Number(s.views),
                      }))}
                      xKey="source"
                    />
                  )}
                  <LineChartCard
                    title={t('analyticsPage.ratingChart', 'Рейтинг')}
                    data={chartData.map((d) => ({ date: d.date, value: d.rating }))}
                  />
                </div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {!isPremium && !isVip && (
        <Alert className="rounded-lg border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.04]">
          <AlertDescription>
            {t('analyticsPage.upgradeMessage', 'Обновите тариф до VIP или PREMIUM для доступа к аналитике')}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
