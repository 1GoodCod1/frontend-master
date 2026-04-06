import { useTranslation } from 'react-i18next';
import { useIsDark } from '@/hooks/useIsDark';
import { Badge } from '@/components/ui/badge';
import { Button as ShadcnButton } from '@/components/ui/button';
import { StatCard } from '@/components/ui/StatCard';
import {
  useAdminSystemInfoQuery,
  useAdminListBackupsQuery,
  useAdminCreateBackupMutation,
  useAdminReferralsEnabledQuery,
  useAdminSetReferralsEnabledMutation,
} from '@/features/admin/adminApi';
import { useAppSelector } from '@/app/hooks';
import { env } from '@/services/env';
import { formatDateTimeString, getLocaleFromLanguage } from '@/utils/date';
import { LoadingState, ErrorState } from '@/components/common/States';
import { toErrorMessage } from '@/utils/errors';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import toast from 'react-hot-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  MemoryUsageChart,
  DailyMetricsChart,
  DatabaseMetricsChart,
  CpuLoadChart,
  type SystemStats,
} from '@/features/admin/components/system/SystemCharts';

export default function SystemPage() {
  const { t, i18n } = useTranslation();
  const locale = getLocaleFromLanguage(i18n.language);
  const isDark = useIsDark();
  const accessToken = useAppSelector((state) => state.auth.tokens?.accessToken);
  
  // Real-time updates every 5 seconds
  const info = useAdminSystemInfoQuery(undefined, {
    pollingInterval: 5000,
    refetchOnMountOrArgChange: true,
  });
  const backups = useAdminListBackupsQuery(undefined, {
    pollingInterval: 30000, // Update backups every 30 seconds
  });

  const [createBackup, { isLoading: isCreatingBackup }] = useAdminCreateBackupMutation();
  const { data: referralsData } = useAdminReferralsEnabledQuery();
  const [setReferralsEnabled, { isLoading: isSavingReferrals }] = useAdminSetReferralsEnabledMutation();
  const referralsEnabled = referralsData?.enabled ?? false;

  const stats: SystemStats | undefined = info.data?.stats;
  const backupsList = backups.data ?? [];
  const lastUpdated = info.data?.timestamp ? new Date(info.data.timestamp) : null;

  const handleReferralsToggle = async (checked: boolean) => {
    try {
      await setReferralsEnabled(checked).unwrap();
      toast.success(t('admin.system.referralsToggleSuccess'));
    } catch (e: unknown) {
      toast.error(toErrorMessage(e) ?? t('admin.system.referralsToggleFailed'));
    }
  };

  const handleCreateBackup = async () => {
    try {
      await createBackup().unwrap();
      toast.success(t('admin.system.backupCreated'));
    } catch (e: unknown) {
      toast.error(toErrorMessage(e) ?? t('admin.system.createFailed'));
    }
  };

  const handleDownloadBackup = async (filename: string) => {
    try {
      if (!accessToken) {
        toast.error(t('admin.system.authRequired'));
        return;
      }

      const response = await fetch(`${env.apiUrl}/admin/backups/${encodeURIComponent(filename)}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || t('admin.system.downloadFailed'));
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(t('admin.system.backupDownloaded'));
    } catch (e: unknown) {
      toast.error(toErrorMessage(e) ?? t('admin.system.downloadFailed'));
    }
  };

  const parseUsage = (usageStr: string): number => {
    if (!usageStr) return 0;
    const match = usageStr.match(/^(\d+\.?\d*)%$/);
    return match ? parseFloat(match[1]) : 0;
  };


  // Показываем загрузку только при первой загрузке
  if (info.isLoading && !info.data) {
    return <LoadingState />;
  }

  // Показываем ошибку только если нет данных вообще
  if (info.isError && !info.data) {
    return <ErrorState error={info.error} onRetry={info.refetch} />;
  }

  return (
    <div className="animate-in fade-in duration-200">
      <PageHeader
        title={t('admin.system.title')}
        subtitle={t('admin.system.subtitle')}
      />

      {info.isLoading && (
        <div className="mb-6">
          <Badge variant="secondary" className="text-sm">
            ⏳ {t('admin.system.loadingSystemInfo')}
          </Badge>
        </div>
      )}

      {Boolean(info.data) && (
        <div className="mb-6">
          <Badge variant="secondary" className="gap-1.5 font-semibold">
            <span className="size-2 rounded-full bg-green-500 animate-pulse" />
            🔴 {t('admin.system.liveLastUpdated')}:{' '}
            {lastUpdated && !Number.isNaN(lastUpdated.getTime())
              ? lastUpdated.toLocaleTimeString()
              : t('admin.system.justNow')}
          </Badge>
        </div>
      )}

        {/* Database Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="col-span-full">
              <h3 className="text-lg font-bold mb-2">📊 {t('admin.system.databaseStatistics')}</h3>
            </div>
            <StatCard title={t('admin.system.totalUsers')} value={stats.database.totalUsers.toLocaleString()} icon="👥" color={isDark ? '#9e9e9e' : '#4A90E2'} hover />
            <StatCard title={t('admin.system.totalMasters')} value={stats.database.totalMasters.toLocaleString()} icon="🔧" color={isDark ? '#9e9e9e' : '#4A90E2'} hover />
            <StatCard title={t('admin.system.totalLeads')} value={stats.database.totalLeads.toLocaleString()} icon="📋" color={isDark ? '#9e9e9e' : '#4A90E2'} hover />
            <StatCard title={t('admin.system.totalReviews')} value={stats.database.totalReviews.toLocaleString()} icon="⭐" color={isDark ? '#9e9e9e' : '#4A90E2'} hover />
            <StatCard title={t('admin.system.totalPayments')} value={stats.database.totalPayments.toLocaleString()} icon="💳" color={isDark ? '#9e9e9e' : '#4A90E2'} hover />
          </div>
        )}

        {/* System Metrics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <SectionCard title={`💾 ${t('admin.system.memoryUsage')}`}>
              <div className="space-y-4">
                <StatCard
                  title={t('admin.system.totalMemory')}
                  value={stats.system.memory.total}
                  subtitle={`Used: ${stats.system.memory.used} | Free: ${stats.system.memory.free}`}
                  progress={parseUsage(stats.system.memory.usage)}
                  color={parseUsage(stats.system.memory.usage) > 80 ? '#f44336' : isDark ? '#9e9e9e' : '#4A90E2'}
                  hover
                />
                <MemoryUsageChart data={stats.system.memory} />
              </div>
            </SectionCard>
            <SectionCard title={`⚡ ${t('admin.system.cpuLoad')}`}>
              <div className="space-y-4">
                <StatCard
                  title={`${t('admin.system.cpuCores')}: ${stats.system.cpu.cores}`}
                  value={`Avg: ${(stats.system.cpu.load.reduce((a, b) => a + b, 0) / stats.system.cpu.load.length).toFixed(1)}%`}
                  subtitle={t('admin.system.avgLoadAcrossCores')}
                  hover
                />
                <CpuLoadChart load={stats.system.cpu.load} />
              </div>
            </SectionCard>
            <SectionCard title={`🖥️ ${t('admin.system.systemInfo')}`}>
              <div className="space-y-4">
                <StatCard title={t('admin.system.systemUptime')} value={stats.system.uptime} icon="⏱️" subtitle={`${stats.system.platform}`} hover />
                <div className="border-t my-2" />
                <p className="text-sm font-semibold mt-2">🔴 {t('admin.system.redisInfo')}</p>
                <StatCard title={t('admin.system.connectedClients')} value={stats.redis.connectedClients} icon="🔴" color={isDark ? '#f44336' : '#e57373'} hover />
                <StatCard title={t('admin.system.usedMemory')} value={stats.redis.usedMemory} icon="💾" hover />
                <StatCard title={t('admin.system.totalCommands')} value={stats.redis.totalCommands.toLocaleString()} icon="📊" hover />
              </div>
            </SectionCard>
          </div>
        )}

        {/* Daily Metrics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <SectionCard title={`📈 ${t('admin.system.dailyMetrics')}`}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <StatCard title={t('admin.system.newUsersToday')} value={stats.daily.newUsers} color={isDark ? '#4caf50' : '#66bb6a'} hover />
                  <StatCard title={t('admin.system.newLeadsToday')} value={stats.daily.newLeads} color={isDark ? '#9e9e9e' : '#4A90E2'} hover />
                  <StatCard title={t('admin.system.newReviewsToday')} value={stats.daily.newReviews} color={isDark ? '#ff9800' : '#ffa726'} hover />
                </div>
                <DailyMetricsChart data={stats.daily} />
              </div>
            </SectionCard>
            <SectionCard title={`🗄️ ${t('admin.system.databaseMetrics')}`}>
              <DatabaseMetricsChart data={stats.database} />
            </SectionCard>
          </div>
        )}

        {/* Feature flags: Referrals */}
        <SectionCard
          title={t('admin.system.referralsProgram')}
          subtitle={t('admin.system.referralsProgramDesc')}
          className="mb-6"
        >
          <div className="flex items-center justify-between gap-4 rounded-lg border bg-card/50 p-4">
            <div className="space-y-0.5">
              <Label htmlFor="referrals-toggle" className="text-base font-semibold cursor-pointer">
                {t('admin.system.referralsEnabled')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {referralsEnabled
                  ? t('admin.system.referralsEnabledOn')
                  : t('admin.system.referralsEnabledOff')}
              </p>
            </div>
            <Switch
              id="referrals-toggle"
              checked={referralsEnabled}
              onCheckedChange={handleReferralsToggle}
              disabled={isSavingReferrals}
            />
          </div>
        </SectionCard>

        {/* Backups Section */}
        <SectionCard
          title={`💾 ${t('admin.system.backups')}`}
          subtitle={t('admin.system.manageBackups')}
          actions={
            <ShadcnButton onClick={handleCreateBackup} disabled={isCreatingBackup}>
              {isCreatingBackup ? t('admin.system.creating') : t('admin.system.createBackup')}
            </ShadcnButton>
          }
        >
          {backups.isLoading ? (
            <LoadingState />
          ) : backups.isError ? (
            <ErrorState error={backups.error} onRetry={backups.refetch} />
          ) : backupsList.length > 0 ? (
            <div className="space-y-3">
              {backupsList.map((backup, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border bg-card transition-colors hover:bg-muted/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="font-semibold text-foreground">{backup.filename || `Backup ${index + 1}`}</p>
                    <p className="text-xs text-muted-foreground">
                      Created: {backup.modified ? formatDateTimeString(backup.modified, locale) : 'Unknown date'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {backup.size && <Badge variant="secondary" className="text-xs">{backup.size}</Badge>}
                    <ShadcnButton variant="outline" size="sm" onClick={() => handleDownloadBackup(backup.filename)}>
                      {t('admin.system.download')}
                    </ShadcnButton>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No backups available
            </p>
          )}
        </SectionCard>
    </div>
  );
}