import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts';
import {
  Eye, CheckCircle, Rocket, Lock, History,
  Activity, BarChart3, Users, Clock, MousePointerClick
} from 'lucide-react';
import { useMastersMyStatsQuery, useMastersMyProfileQuery, useMastersUpdateOnlineStatusMutation, useMastersGetAvailabilityStatusQuery, useMastersUpdateAvailabilityStatusMutation } from '@/features/masters/mastersApi';
import { useLeadsStatsQuery } from '@/features/leads/leadsApi';
import { useAnalyticsMyQuery } from '@/features/analytics/analyticsApi';
import { LoadingState, ErrorState } from '@/components/common/States';
import { StatCard } from '@/components/ui/StatCard';
import { OnlineStatusBadge } from '@/components/ui/OnlineStatusBadge';
import { AvailabilityControl } from '@/features/masters/components/master/AvailabilityControl';
import { extractItems } from '@/utils/data';
import { formatDateShort, formatDateCompact, getLocaleFromLanguage } from '@/utils/date';
import { useState, useRef, useEffect } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { ProfileViewsHistoryModal } from '@/features/masters/components/master/ProfileViewsHistoryModal';
import { Progress } from '@/components/ui/progress';
import { PushPermissionBanner } from '@/components/notifications/PushPermissionBanner';
import { MasterPendingBookingsCard } from '@/features/bookings/components/MasterPendingBookingsCard';

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ color?: string; name?: string; value?: number }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-3 shadow-xl">
        <p className="mb-2 text-sm font-medium text-muted-foreground">{label}</p>
        <div className="space-y-1">
          {payload!.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="size-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-sm font-medium">{entry.name}:</span>
              <span className="text-sm font-bold">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const locale = getLocaleFromLanguage(i18n.language);
  const stats = useMastersMyStatsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    pollingInterval: 60_000,
  });
  const leadsStats = useLeadsStatsQuery();
  const analytics = useAnalyticsMyQuery({ days: 14 });
  const profile = useMastersMyProfileQuery();
  const availability = useMastersGetAvailabilityStatusQuery();
  const [updateOnlineStatus, { isLoading: isUpdatingStatus }] = useMastersUpdateOnlineStatusMutation();
  const [updateAvailability] = useMastersUpdateAvailabilityStatusMutation();
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState(false);
  const [viewsHistoryOpen, setViewsHistoryOpen] = useState(false);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isChartWide = useMediaQuery('(min-width: 640px)');

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, []);

  type MasterProfileData = { isOnline?: boolean; lastActivityAt?: string | null; tariffType?: 'BASIC' | 'VIP' | 'PREMIUM' };
  type AvailabilityData = { availabilityStatus?: 'AVAILABLE' | 'BUSY' | 'OFFLINE'; maxActiveLeads?: number; currentActiveLeads?: number };
  const masterData: MasterProfileData = ((profile.data as { data?: MasterProfileData } | undefined)?.data ?? profile.data ?? {}) as MasterProfileData;
  const isOnline = masterData?.isOnline || false;

  const availabilityData: AvailabilityData = ((availability.data as { data?: AvailabilityData } | undefined)?.data ?? availability.data ?? {}) as AvailabilityData;
  const currentStatus = availabilityData?.availabilityStatus || 'AVAILABLE';
  const maxActiveLeads = availabilityData?.maxActiveLeads || 5;
  const currentActiveLeads = availabilityData?.currentActiveLeads || 0;

  const handleToggleOnlineStatus = async () => {
    try {
      await updateOnlineStatus({ isOnline: !isOnline }).unwrap();
      setStatusUpdateSuccess(true);
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = setTimeout(() => setStatusUpdateSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update online status:', error);
    }
  };

  const handleUpdateAvailability = async (status: string, maxLeads?: number) => {
    await updateAvailability({
      availabilityStatus: status,
      maxActiveLeads: maxLeads
    }).unwrap();
  };

  if (stats.isLoading || leadsStats.isLoading || profile.isLoading || analytics.isLoading) {
    return <LoadingState label={t('dashboard.loading')} />;
  }
  if (stats.isError) return <ErrorState error={stats.error} onRetry={stats.refetch} />;
  if (leadsStats.isError) return <ErrorState error={leadsStats.error} onRetry={leadsStats.refetch} />;

  type StatsDataShape = { leadsToday?: number; viewsToday?: number; viewsThisWeek?: number; viewsThisMonth?: number };
  type LeadsStatsDataShape = { total?: number; byStatus?: { newLeads?: number; inProgress?: number; closed?: number; spam?: number } };
  const statsData: StatsDataShape = ((stats.data as { data?: StatsDataShape } | undefined)?.data ?? stats.data ?? {}) as StatsDataShape;
  const leadsStatsData: LeadsStatsDataShape = ((leadsStats.data as { data?: LeadsStatsDataShape } | undefined)?.data ?? leadsStats.data ?? {}) as LeadsStatsDataShape;

  const {
    leadsToday = 0,
    viewsToday = 0,
    viewsThisWeek = 0,
    viewsThisMonth = 0,
  } = statsData;

  const {
    total = 0,
    byStatus = {},
  } = leadsStatsData;

  const {
    newLeads = 0,
    inProgress = 0,
    closed = 0,
    spam = 0,
  } = byStatus;

  const analyticsResponse = analytics.data as { data?: unknown } | undefined;
  const rawChartData = extractItems(analyticsResponse?.data ?? analyticsResponse);

  const toLocalDayKey = (value: unknown): string => {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    const date = value instanceof Date ? value : new Date(String(value ?? ''));
    if (Number.isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDayLabel = (dayKey: string, compact = false): string => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dayKey)) {
      const [year, month, day] = dayKey.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      return compact ? formatDateCompact(d, locale) : formatDateShort(d, locale);
    }
    const d = new Date(dayKey);
    return compact ? formatDateCompact(d, locale) : formatDateShort(dayKey, locale);
  };

  const chartData = rawChartData
    .map((item: unknown) => {
      const dayKey = toLocalDayKey((item as { date?: unknown }).date);
      const baseViews = Number((item as { viewsCount?: unknown; views?: unknown }).viewsCount ?? (item as { viewsCount?: unknown; views?: unknown }).views ?? 0);
      const baseLeads = Number((item as { leadsCount?: unknown; leads?: unknown }).leadsCount ?? (item as { leadsCount?: unknown; leads?: unknown }).leads ?? 0);

      return {
        dayKey,
        date: dayKey ? formatDayLabel(dayKey) : '',
        dateCompact: dayKey ? formatDayLabel(dayKey, true) : '',
        views: baseViews,
        leads: baseLeads,
      };
    })
    .filter((item) => item.dayKey !== '')
    .sort((a, b) => a.dayKey.localeCompare(b.dayKey))
    .slice(-14);

  return (
    <div className="mx-auto w-full max-w-[1400px] px-3 py-4 sm:px-4 sm:py-6 md:py-8 md:px-6 lg:px-8 space-y-6 sm:space-y-8 min-h-[calc(100vh-4rem)]">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{t('dashboard.title', 'Дашборд')}</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">{t('dashboard.subtitle', 'Обзор вашей активности и статистики')}</p>
      </div>

      <PushPermissionBanner />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Left Column (Main Content) - 2/3 width */}
        <div className="xl:col-span-2 space-y-8">

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title={t('dashboard.viewsToday', 'Просмотры (Сегодня)')}
              value={viewsToday}
              icon={<Eye className="size-5 text-blue-500/80" />}
              trend="up"
              changePercent={viewsThisWeek ? Math.round((viewsToday / viewsThisWeek) * 100) : 0}
            />
            <StatCard
              title={t('dashboard.leadsToday', 'Заявки (Сегодня)')}
              value={leadsToday}
              icon={<MousePointerClick className="size-5 text-emerald-500/80" />}
              trend={leadsToday > 0 ? "up" : "stable"}
              changePercent={0}
            />
            <StatCard
              title={t('dashboard.inProgress', 'В работе')}
              value={inProgress}
              icon={<Clock className="size-5 text-amber-500/80" />}
            />
            <StatCard
              title={t('dashboard.closed', 'Завершено')}
              value={closed}
              icon={<CheckCircle className="size-5 text-indigo-500/80" />}
            />
          </div>

          {/* Charts Section */}
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-2">
              <div className="min-w-0">
                <CardTitle className="text-lg sm:text-xl">{t('dashboard.activityTrend', 'График активности')}</CardTitle>
                <CardDescription className="text-sm">{t('dashboard.viewsAndLeadsTrend', 'Динамика просмотров и заявок за последние 14 дней')}</CardDescription>
              </div>
              <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm font-medium shrink-0">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-500 shrink-0"></div>
                  <span className="text-muted-foreground">{t('dashboard.views', 'Просмотры')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 shrink-0"></div>
                  <span className="text-muted-foreground">{t('dashboard.leads', 'Заявки')}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6">
              <div className="h-[260px] min-h-[200px] sm:h-[280px] w-full min-w-0 mt-2 sm:mt-4">
                {chartData.length > 0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height={isChartWide ? 280 : 260}
                    minWidth={0}
                    minHeight={200}
                  >
                    <AreaChart
                      data={chartData}
                      margin={{
                        top: 10,
                        right: isChartWide ? 20 : 10,
                        left: isChartWide ? 0 : -10,
                        bottom: isChartWide ? 0 : 50,
                      }}
                    >
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis
                        dataKey={isChartWide ? 'date' : 'dateCompact'}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(val, i) => {
                          if (isChartWide) return i % 2 !== 0 ? '' : val;
                          return i % 3 !== 0 ? '' : val;
                        }}
                        interval={isChartWide ? 'preserveStartEnd' : 0}
                        angle={isChartWide ? 0 : -45}
                        textAnchor={isChartWide ? 'middle' : 'end'}
                        tick={{ fontSize: isChartWide ? 12 : 10, fill: 'hsl(var(--muted-foreground))' }}
                        dy={isChartWide ? 10 : 0}
                      />
                      <YAxis
                        allowDecimals={false}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: isChartWide ? 12 : 10, fill: 'hsl(var(--muted-foreground))' }}
                        width={isChartWide ? 35 : 28}
                      />
                      <RechartsTooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="views" name={t('dashboard.views', 'Просмотры')} stroke="#3b82f6" strokeWidth={isChartWide ? 3 : 2} fillOpacity={1} fill="url(#colorViews)" />
                      <Area type="monotone" dataKey="leads" name={t('dashboard.leads', 'Заявки')} stroke="#10b981" strokeWidth={isChartWide ? 3 : 2} fillOpacity={1} fill="url(#colorLeads)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col h-full items-center justify-center text-sm text-muted-foreground gap-3">
                    <Activity className="size-10 text-muted-foreground/30" />
                    <p>{t('dashboard.noData', 'Недостаточно данных для графика')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Leads Funnel / Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="size-5 text-indigo-500" />
                  {t('dashboard.leadsFunnel', 'Воронка заявок')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                {[
                  { label: t('dashboard.statusNew', 'Новые'), count: newLeads, color: 'bg-blue-500', max: total || 1 },
                  { label: t('dashboard.statusInProgress', 'В работе'), count: inProgress, color: 'bg-amber-500', max: total || 1 },
                  { label: t('dashboard.statusClosed', 'Завершено (Успешно)'), count: closed, color: 'bg-emerald-500', max: total || 1 },
                  { label: t('dashboard.statusSpam', 'Отклонено / Спам'), count: spam, color: 'bg-destructive', max: total || 1 },
                ].map((stat, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-foreground">{stat.label}</span>
                      <span className="text-muted-foreground font-semibold">{stat.count}</span>
                    </div>
                    <Progress value={(stat.count / stat.max) * 100} className={cn("h-2 [&>div]:" + stat.color)} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl -mx-10 -my-10 z-0 pointer-events-none"></div>
              <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="size-5 text-amber-500" />
                  {t('dashboard.profileSummary', 'Сводка профиля')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 relative z-10">
                <div className="flex justify-between items-center p-3 rounded-lg bg-card/50 border border-border/50">
                  <span className="text-muted-foreground text-sm">{t('dashboard.viewsThisWeek', 'Просмотры за неделю')}</span>
                  <span className="font-bold text-lg">{viewsThisWeek}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-card/50 border border-border/50">
                  <span className="text-muted-foreground text-sm">{t('dashboard.viewsThisMonth', 'Просмотры за месяц')}</span>
                  <span className="font-bold text-lg">{viewsThisMonth}</span>
                </div>
                <div className="pt-4 w-full">
                  <Button
                    variant="outline"
                    className="w-full justify-between hover:bg-muted/50 group rounded-xl"
                    onClick={() => setViewsHistoryOpen(true)}
                  >
                    <span className="flex items-center gap-2">
                      <History className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      {t('dashboard.viewsHistory.showHistory', 'История просмотров')}
                    </span>
                    <Eye className="size-4 opacity-50" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>

        {/* Right Column (Controls & Settings) - 1/3 width */}
        <div className="space-y-6">

          {/* Pending Bookings */}
          <MasterPendingBookingsCard />

          {/* Status Control Card */}
          <Card className={cn(
            "shadow-lg border-2 transition-all duration-300 relative overflow-hidden",
            isOnline
              ? "border-emerald-500/50 dark:border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent dark:from-emerald-500/10 shadow-emerald-500/10"
              : ""
          )}>
            {isOnline && <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-16 -mt-16 animate-pulse z-0 pointer-events-none"></div>}

            <CardHeader className="pb-4 relative z-10">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{t('dashboard.statusControl', 'Статус')}</span>
                <Switch
                  checked={isOnline}
                  onCheckedChange={handleToggleOnlineStatus}
                  disabled={isUpdatingStatus}
                  className={cn(
                    "data-[state=checked]:bg-emerald-500 scale-110 shadow-inner",
                    isOnline ? "shadow-emerald-500/30" : ""
                  )}
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              <div className="flex items-center gap-4">
                <OnlineStatusBadge
                  isOnline={isOnline}
                  lastActivityAt={masterData?.lastActivityAt}
                  variant="dot"
                  size="medium"
                  showLabel={true}
                />
              </div>

              <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                {isOnline
                  ? t('dashboard.onlineStatusDescription', 'Вы в сети и видны клиентам. Ваш профиль будет отображаться выше в поиске.')
                  : t('dashboard.offlineStatusDescription', 'Вы не в сети. Клиенты не могут найти вас напрямую или сделать быстрый заказ.')}
              </div>

              {statusUpdateSuccess && (
                <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 py-2.5 animate-in fade-in slide-in-from-top-2">
                  <CheckCircle className="size-4" />
                  <AlertDescription className="ml-2">{t('dashboard.statusUpdated', 'Статус обновлен')}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Availability Control Card */}
          {masterData?.tariffType === 'PREMIUM' ? (
            <AvailabilityControl
              currentStatus={currentStatus}
              maxActiveLeads={maxActiveLeads}
              currentActiveLeads={currentActiveLeads}
              onUpdate={handleUpdateAvailability}
            />
          ) : (
            <Card className="shadow-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent z-0 pointer-events-none"></div>
              <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lock className="size-5 text-muted-foreground" />
                  {t('dashboard.availabilityControl.title', 'Управление доступностью')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-2 relative z-10">
                <p className="text-sm text-muted-foreground">
                  {t('dashboard.availabilityControl.premiumOnly', 'Настройки доступности (Готов взять заявку, Занят и т.д.) и лимит заявок доступны только для Premium.')}
                </p>
                <Button asChild className="w-full bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 transition-all rounded-xl">
                  <Link to="/plans" className="flex items-center justify-center gap-2">
                    <Rocket className="size-4" />
                    {t('dashboard.unlockFeature', 'Разблокировать с Premium')}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

        </div>
      </div>

      <ProfileViewsHistoryModal
        open={viewsHistoryOpen}
        onOpenChange={setViewsHistoryOpen}
      />
    </div>
  );
}
