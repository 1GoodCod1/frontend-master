import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Eye,
  Star,
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
import { cn } from '@/lib/utils';
import { LoadingState, ErrorState } from '@/components/common/States';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  masterCardStaticCls,
  masterOutlineBtnCls,
  masterPageWideClassName,
} from '@/lib/masterCabinetStyles';
import { LineChartCard } from '@/components/ui/LineChartCard';
import { BarChartCard } from '@/components/ui/BarChartCard';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ChartDataItem = {
  date: string;
  leads: number;
  views: number;
  reviews: number;
  rating: number;
};

type ConversionData = { viewsToLeads?: number; leadsToBookings?: number; bookingsToReviews?: number };

export default function AnalyticsPage() {
  const { t, i18n } = useTranslation();
  const plan = useAppSelector(selectPlan) ?? 'BASIC';
  const isPro = plan === 'PRO';
  const isPlus = plan === 'PLUS';

  const defaultDays = isPro ? 30 : 7;
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');

  const { data: analytics, isLoading, error, refetch } = useAnalyticsMyQuery({ days: defaultDays });

  const myProfile = useMastersMyProfileQuery();
  const masterId = (myProfile.data as { data?: { id?: string }; id?: string })?.data?.id ?? (myProfile.data as { id?: string })?.id ?? null;
  const accessToken = useAppSelector((state) => state.auth.tokens?.accessToken);

  if (isLoading) return <LoadingState label={t('analyticsPage.loading', 'Загрузка аналитики...')} />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const data = analytics as Record<string, unknown> | undefined;
  const rootData = data ?? {};
  const analyticsData = (data?.data as Record<string, unknown>) || rootData;
  const summary = (analyticsData?.summary as Record<string, unknown>) || (data?.summary as Record<string, unknown>) || {};
  const trends = (analyticsData?.trends as Record<string, unknown>) || (data?.trends as Record<string, unknown>);
  const conversion = (analyticsData?.conversion as Record<string, unknown>) || (data?.conversion as Record<string, unknown>);
  const comparison = (analyticsData?.comparison as Record<string, unknown>) || (data?.comparison as Record<string, unknown>);
  const forecast = (analyticsData?.forecast as Record<string, unknown>) || (data?.forecast as Record<string, unknown>);
  const peakHours = Array.isArray(analyticsData?.peakHours)
    ? analyticsData.peakHours
    : Array.isArray(rootData.peakHours)
      ? rootData.peakHours
      : [];
  const topSources = Array.isArray(analyticsData?.topSources)
    ? analyticsData.topSources
    : Array.isArray(rootData.topSources)
      ? rootData.topSources
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
  const chartData: ChartDataItem[] = rawData.map((item) => {
    const rating = readNumber(item, ['rating', 'avgRating']);
    return {
      date: String(item.date ?? ''),
      leads: readNumber(item, ['leadsCount', 'leads', 'totalLeads']),
      views: readNumber(item, ['viewsCount', 'views', 'totalViews']),
      reviews: readNumber(item, ['reviewsCount', 'reviews', 'totalReviews']),
      rating,
    };
  });

  const blockClass = cn(masterCardStaticCls, 'p-4');

  return (
    <div className={masterPageWideClassName}>
      <PageHeader
        title={t('analyticsPage.title', 'Аналитика')}
        subtitle={
          isPro
            ? t('analyticsPage.subtitleBoost', 'Расширенная аналитика и прогнозы')
            : t('analyticsPage.subtitlePlus', 'Базовая аналитика и тренды')
        }
        actions={
        <div className="flex flex-wrap items-center gap-2">
          {isPro && (
            <Badge variant="secondary" className="gap-1 font-semibold bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 border-teal-200 dark:border-teal-700/50">
              <BarChart3 className="size-3.5" />
              {t('analyticsPage.proBadge', 'PRO')}
            </Badge>
          )}
          {isPro && masterId && (
            <Button
              size="sm"
              variant="outline"
              className={cn(masterOutlineBtnCls, 'gap-1.5')}
              onClick={async () => {
                try {
                  const lang = i18n.language?.startsWith('ru') ? 'ru' : 'en';
                  await exportService.exportAnalyticsPDF(masterId, accessToken ?? undefined, lang);
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

      {/* Summary */}
      <Card className={`overflow-hidden ${blockClass}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="size-5 text-indigo-500" />
            {t('analyticsPage.summary', 'Основные показатели')}
          </CardTitle>
          <CardDescription className="text-sm">{t('analyticsPage.summarySubtitle', 'За последние {{days}} дней', { days: defaultDays })}</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title={t('analyticsPage.totalLeads', 'Всего заявок')}
              value={readNumber(summary, ['totalLeads', 'leadsCount', 'leads'])}
              trend={trends?.leadsTrend as 'up' | 'down' | 'stable' | undefined}
              changePercent={trends?.leadsChangePercent as number | undefined}
              icon={<TrendingUp className="size-5 text-[#E97525] dark:text-[#E97525] opacity-70" />}
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
              value={readNumber(summary, ['masterTotalReviews', 'totalReviews', 'reviewsCount', 'reviews'])}
              subtitle={readNumber(summary, ['masterRating']) > 0
                ? `${t('analyticsPage.ratingChart', 'Рейтинг')}: ${readNumber(summary, ['masterRating']).toFixed(1)}`
                : undefined}
              icon={<Star className="size-5 text-[#E97525] opacity-70 dark:text-[#f08540]" />}
            />
          </div>
        </CardContent>
      </Card>

      {/* Conversion (Pro) */}
      {isPro && Boolean(conversion) && (
        <Card className={`overflow-hidden ${blockClass}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="size-5 text-indigo-500" />
              {t('analyticsPage.conversion', 'Воронка продаж')}
            </CardTitle>
            <CardDescription className="text-sm">{t('analyticsPage.conversionSubtitle', 'Эффективность каждого этапа')}</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-nowrap items-stretch gap-2 overflow-x-auto pb-2 sm:gap-4 sm:overflow-visible sm:pb-0">
              <div className="flex flex-col items-center justify-center flex-shrink-0 w-[100px] sm:w-auto sm:flex-1 p-4 rounded-xl bg-background/80 dark:bg-background/50 border-0 shadow-[0_2px_6px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">{t('analyticsPage.views', 'Просмотры')}</span>
                <span className="text-2xl font-bold">{readNumber(summary, ['totalViews', 'viewsCount', 'views'])}</span>
              </div>
              <div className="flex flex-shrink-0 items-center">
                <span className="bg-blue-600 text-[10px] font-bold px-2 py-1 rounded-md text-white whitespace-nowrap">
                  {Math.min(100, Number((conversion as ConversionData).viewsToLeads || 0)).toFixed(1)}%
                </span>
              </div>
              <div className="flex flex-col items-center justify-center flex-shrink-0 w-[100px] sm:w-auto sm:flex-1 p-4 rounded-xl bg-background/80 dark:bg-background/50 border-0 shadow-[0_2px_6px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">{t('analyticsPage.leads', 'Заявки')}</span>
                <span className="text-2xl font-bold">{readNumber(summary, ['totalLeads', 'leadsCount', 'leads'])}</span>
              </div>
              <div className="flex flex-shrink-0 items-center">
                <span className="bg-[#E97525] text-[10px] font-bold px-2 py-1 rounded-md text-white whitespace-nowrap">
                  {Math.min(100, Number((conversion as ConversionData).leadsToBookings || 0)).toFixed(1)}%
                </span>
              </div>
              <div className="flex flex-col items-center justify-center flex-shrink-0 w-[100px] sm:w-auto sm:flex-1 p-4 rounded-xl bg-background/80 dark:bg-background/50 border-0 shadow-[0_2px_6px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">{t('analyticsPage.bookings', 'Записи')}</span>
                <span className="text-2xl font-bold">{Number(analyticsData.bookingsCount ?? 0)}</span>
              </div>
              <div className="flex flex-shrink-0 items-center">
                <span className="bg-emerald-600 text-[10px] font-bold px-2 py-1 rounded-md text-white whitespace-nowrap">
                  {Math.min(100, Number((conversion as ConversionData).bookingsToReviews || 0)).toFixed(1)}%
                </span>
              </div>
              <div className="flex flex-col items-center justify-center flex-shrink-0 w-[100px] sm:w-auto sm:flex-1 p-4 rounded-xl bg-background/80 dark:bg-background/50 border-0 shadow-[0_2px_6px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">{t('analyticsPage.reviews', 'Отзывы')}</span>
                <span className="text-2xl font-bold">{readNumber(summary, ['totalReviews', 'reviewsCount', 'reviews'])}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights (Pro) */}
      {isPro && Array.isArray(analyticsData.insights) && analyticsData.insights.length > 0 && (
        <Card className={`overflow-hidden border-l-4 border-l-blue-500 ${blockClass}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <TrendingUp className="size-5" />
              {t('analyticsPage.insightsTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ul className="space-y-3">
              {(analyticsData.insights as Array<string | { key: string; params?: Record<string, number | string> }>).map((insight, idx) => {
                const text = typeof insight === 'string'
                  ? insight
                  : t(`analyticsPage.${insight.key}`, insight.params ?? {});
                return (
                  <li key={idx} className="text-sm flex gap-3 items-start">
                    <div className="size-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-blue-600 dark:text-blue-400 font-black text-[10px]">{idx + 1}</span>
                    </div>
                    <p className="leading-relaxed">{text}</p>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Comparison (Pro) */}
      {isPro && Boolean(comparison) && (
        <Card className={`overflow-hidden ${blockClass}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="size-5 text-indigo-500" />
              {t('analyticsPage.comparison')}
            </CardTitle>
            <CardDescription className="text-sm">{t('analyticsPage.comparisonSubtitle', 'Ваша позиция в категории и городе')}</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {(() => {
                const cat = comparison.categoryAvg as { avgLeads?: number; avgViews?: number; mastersCount?: number };
                const posCat = (comparison.position as { inCategory?: number })?.inCategory ?? 0;
                const totalCat = (cat.mastersCount ?? 0) + 1;
                const hasCompetitors = totalCat > 1;
                const formatVal = (v: number) => (!hasCompetitors ? '—' : v.toFixed(1));
                const formatPos = () => (!hasCompetitors ? '—' : `#${posCat} ${t('analyticsPage.ofTotal', 'из')} ${totalCat}`);
                return (
                  <Card className="border-0 shadow-[0_2px_6px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.25)] bg-background/80 dark:bg-background/50">
                    <CardContent className="p-5">
                      <h3 className="mb-4 text-base font-bold">
                        {t('analyticsPage.categoryAverage')}
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <p className="mb-0.5 text-sm text-muted-foreground">{t('analyticsPage.avgLeads')}</p>
                          <p className="text-xl font-bold">{formatVal(Number(cat.avgLeads) || 0)}</p>
                        </div>
                        <div>
                          <p className="mb-0.5 text-sm text-muted-foreground">{t('analyticsPage.avgViews')}</p>
                          <p className="text-xl font-bold">{formatVal(Number(cat.avgViews) || 0)}</p>
                        </div>
                        <div>
                          <p className="mb-0.5 text-sm text-muted-foreground">{t('analyticsPage.yourPosition')}</p>
                          <p className="text-xl font-bold text-[#E97525] dark:text-[#E97525]">{formatPos()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}
              {(() => {
                const city = comparison.cityAvg as { avgLeads?: number; avgViews?: number; mastersCount?: number };
                const posCity = (comparison.position as { inCity?: number })?.inCity ?? 0;
                const totalCity = (city.mastersCount ?? 0) + 1;
                const hasCompetitors = totalCity > 1;
                const formatVal = (v: number) => (!hasCompetitors ? '—' : v.toFixed(1));
                const formatPos = () => (!hasCompetitors ? '—' : `#${posCity} ${t('analyticsPage.ofTotal', 'из')} ${totalCity}`);
                return (
                  <Card className="border-0 shadow-[0_2px_6px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.25)] bg-background/80 dark:bg-background/50">
                    <CardContent className="p-5">
                      <h3 className="mb-4 text-base font-bold">
                        {t('analyticsPage.cityAverage')}
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <p className="mb-0.5 text-sm text-muted-foreground">{t('analyticsPage.avgLeads')}</p>
                          <p className="text-xl font-bold">{formatVal(Number(city.avgLeads) || 0)}</p>
                        </div>
                        <div>
                          <p className="mb-0.5 text-sm text-muted-foreground">{t('analyticsPage.avgViews')}</p>
                          <p className="text-xl font-bold">{formatVal(Number(city.avgViews) || 0)}</p>
                        </div>
                        <div>
                          <p className="mb-0.5 text-sm text-muted-foreground">{t('analyticsPage.yourPosition')}</p>
                          <p className="text-xl font-bold text-[#E97525] dark:text-[#E97525]">{formatPos()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Forecast (Pro) */}
      {isPro && forecast && (
        <Card className={`overflow-hidden ${blockClass}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="size-5 text-indigo-500" />
              {t('analyticsPage.forecast', 'Прогноз на следующую неделю')}
            </CardTitle>
            <CardDescription className="text-sm">{t('analyticsPage.forecastSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <StatCard
                title={t('analyticsPage.forecastLeads')}
                value={Number(forecast.nextWeekLeads) || 0}
                subtitle={t('analyticsPage.confidence', 'Уверенность: {{confidence}}%', { confidence: Number(forecast.confidence) || 0 })}
              />
              <StatCard
                title={t('analyticsPage.forecastViews')}
                value={Number(forecast.nextWeekViews) || 0}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <Card className={`overflow-hidden ${blockClass}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="size-5 text-indigo-500" />
            {t('analyticsPage.charts', 'Графики')}
          </CardTitle>
          <CardDescription className="text-sm">{t('analyticsPage.chartsSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'overview' | 'details')} className="mb-4">
            <TabsList>
              <TabsTrigger value="overview">{t('analyticsPage.tabOverview', 'Обзор')}</TabsTrigger>
              {isPro && <TabsTrigger value="details">{t('analyticsPage.tabDetails')}</TabsTrigger>}
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <div className="grid gap-6 md:grid-cols-2">
                <LineChartCard
                  title={t('analyticsPage.leadsChart')}
                  data={chartData.map((d) => ({ date: d.date, value: d.leads }))}
                  color="emerald"
                />
                <LineChartCard
                  title={t('analyticsPage.viewsChart')}
                  data={chartData.map((d) => ({ date: d.date, value: d.views }))}
                  color="blue"
                />
                <LineChartCard
                  title={t('analyticsPage.reviewsChart')}
                  data={chartData.map((d) => ({ date: d.date, value: d.reviews }))}
                  color="amber"
                />
              </div>
            </TabsContent>

            {isPro && (
              <TabsContent value="details" className="mt-4">
                <div className="grid gap-6 md:grid-cols-2">
                  {peakHours.length > 0 && (
                    <BarChartCard
                      title={t('analyticsPage.peakHours')}
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
                      title={t('analyticsPage.topSources')}
                      data={topSources.map((s: Record<string, unknown>) => ({
                        source: String(s.source),
                        leads: Number(s.leads),
                        views: Number(s.views),
                      }))}
                      xKey="source"
                    />
                  )}
                  <LineChartCard
                    title={t('analyticsPage.ratingChart')}
                    data={chartData.map((d) => ({
                      date: d.date,
                      value: d.rating > 0 ? d.rating : null,
                    }))}
                    color="teal"
                    allowDecimals
                  />
                </div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {!isPro && !isPlus && (
        <Alert className="rounded-xl border-border bg-muted/50">
          <AlertDescription>
            {t('analyticsPage.upgradeMessage')}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
