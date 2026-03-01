import { useTranslation } from 'react-i18next';
import { useIsDark } from '@/hooks/useIsDark';
import { Badge } from '@/components/ui/badge';
import { Button as ShadcnButton } from '@/components/ui/button';
import { Card as ShadcnCard, CardContent as ShadcnCardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  useAdminSystemInfoQuery,
  useAdminListBackupsQuery,
  useAdminCreateBackupMutation,
} from '@/features/admin/adminApi';
import { useAppSelector } from '@/app/hooks';
import { env } from '@/services/env';
import { formatDateTimeString, getLocaleFromLanguage } from '@/utils/date';
import { LoadingState, ErrorState } from '@/components/common/States';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import toast from 'react-hot-toast';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface SystemStats {
  database: {
    totalUsers: number;
    totalMasters: number;
    totalLeads: number;
    totalReviews: number;
    totalPayments: number;
  };
  system: {
    memory: {
      total: string;
      used: string;
      free: string;
      usage: string;
    };
    cpu: {
      load: number[];
      cores: number;
    };
    uptime: string;
    platform: string;
  };
  redis: {
    connectedClients: number;
    usedMemory: string;
    totalCommands: number;
  };
  daily: {
    newUsers: number;
    newLeads: number;
    newReviews: number;
    revenue: number;
  };
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
  progress,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  color?: string;
  progress?: number;
}) {
  return (
    <ShadcnCard className="h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <ShadcnCardContent className="pt-4">
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            {icon && <span className="text-xl">{icon}</span>}
          </div>
          <p
            className="text-2xl font-bold"
            style={color ? { color } : undefined}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {progress !== undefined && (
            <div className="mt-2">
              <Progress value={progress} className="h-1.5" />
              <p className="text-xs text-muted-foreground mt-1">{progress.toFixed(1)}%</p>
            </div>
          )}
        </div>
      </ShadcnCardContent>
    </ShadcnCard>
  );
}

function MemoryUsageChart({ data }: { data: SystemStats['system']['memory'] }) {
  const isDark = useIsDark();

  const parseBytes = (bytesStr: string): number => {
    if (!bytesStr) return 0;
    const match = bytesStr.match(/^(\d+\.?\d*)\s*([KMGT]?B)$/);
    if (!match) return 0;
    const [, value, unit] = match;
    const multipliers: { [key: string]: number } = {
      B: 1,
      KB: 1024,
      MB: 1024 ** 2,
      GB: 1024 ** 3,
      TB: 1024 ** 4,
    };
    return parseFloat(value) * (multipliers[unit] || 1);
  };

  const used = parseBytes(data.used);
  const free = parseBytes(data.free);

  const chartData = [
    { name: 'Used', value: used, fill: isDark ? '#9e9e9e' : '#4A90E2' },
    { name: 'Free', value: free, fill: isDark ? '#424242' : '#e0e0e0' },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
          label={({ name, percent }) =>
            `${name}: ${(((percent ?? 0) as number) * 100).toFixed(1)}%`
          }
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? '#252525' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : '#e0e0e0'}`,
            borderRadius: 8,
          }}
          formatter={(value) => {
            const n = typeof value === 'number' ? value : Number(value ?? 0);
            const mb = n / (1024 ** 2);
            return `${mb.toFixed(2)} MB`;
          }}
        />
        <Legend
          wrapperStyle={{ color: isDark ? '#e8e8e8' : '#1a1a1a' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

function DailyMetricsChart({ data }: { data: SystemStats['daily'] }) {
  const isDark = useIsDark();

  const chartData = [
    { name: 'Users', value: data.newUsers, color: isDark ? '#9e9e9e' : '#4A90E2' },
    { name: 'Leads', value: data.newLeads, color: isDark ? '#757575' : '#6BA3E8' },
    { name: 'Reviews', value: data.newReviews, color: isDark ? '#616161' : '#357ABD' },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} />
        <XAxis
          dataKey="name"
          stroke={isDark ? '#b0b0b0' : '#666666'}
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke={isDark ? '#b0b0b0' : '#666666'}
          style={{ fontSize: '12px' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? '#252525' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : '#e0e0e0'}`,
            borderRadius: 8,
          }}
          labelStyle={{ color: isDark ? '#e8e8e8' : '#1a1a1a' }}
        />
        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function DatabaseMetricsChart({ data }: { data: SystemStats['database'] }) {
  const isDark = useIsDark();

  const chartData = [
    { name: 'Users', value: data.totalUsers },
    { name: 'Masters', value: data.totalMasters },
    { name: 'Leads', value: data.totalLeads },
    { name: 'Reviews', value: data.totalReviews },
    { name: 'Payments', value: data.totalPayments },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} />
        <XAxis
          dataKey="name"
          stroke={isDark ? '#b0b0b0' : '#666666'}
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke={isDark ? '#b0b0b0' : '#666666'}
          style={{ fontSize: '12px' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? '#252525' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : '#e0e0e0'}`,
            borderRadius: 8,
          }}
          labelStyle={{ color: isDark ? '#e8e8e8' : '#1a1a1a' }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={isDark ? '#9e9e9e' : '#4A90E2'}
          fill={isDark ? 'rgba(158, 158, 158, 0.2)' : 'rgba(74, 144, 226, 0.2)'}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function CpuLoadChart({ load }: { load: number[] }) {
  const isDark = useIsDark();

  const chartData = load.map((value, index) => ({
    name: `Core ${index + 1}`,
    load: value,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="horizontal">
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} />
        <XAxis
          type="number"
          domain={[0, 100]}
          stroke={isDark ? '#b0b0b0' : '#666666'}
          style={{ fontSize: '12px' }}
        />
        <YAxis
          type="category"
          dataKey="name"
          stroke={isDark ? '#b0b0b0' : '#666666'}
          style={{ fontSize: '12px' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? '#252525' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : '#e0e0e0'}`,
            borderRadius: 8,
          }}
          labelStyle={{ color: isDark ? '#e8e8e8' : '#1a1a1a' }}
          formatter={(value) => {
            const n = typeof value === 'number' ? value : Number(value ?? 0);
            return `${n.toFixed(1)}%`;
          }}
        />
        <Bar dataKey="load" radius={[0, 8, 8, 0]}>
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                entry.load > 80
                  ? isDark
                    ? '#f44336'
                    : '#e57373'
                  : entry.load > 50
                  ? isDark
                    ? '#ff9800'
                    : '#ffb74d'
                  : isDark
                  ? '#4caf50'
                  : '#81c784'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

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

  const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

  // Извлекаем массив backup'ов из ответа
  // API возвращает: { success: true, data: [...], timestamp, path }
  const backupsList = (() => {
    const raw = backups.data as unknown;
    if (Array.isArray(raw)) return raw;
    if (isRecord(raw) && Array.isArray(raw.data)) return raw.data;
    return [];
  })();
  const [createBackup, { isLoading: isCreatingBackup }] = useAdminCreateBackupMutation();

  const infoRaw = info.data as unknown;
  const infoObj = isRecord(infoRaw) ? infoRaw : undefined;
  const infoPayload = infoObj && isRecord(infoObj.data) ? infoObj.data : infoObj;
  const stats: SystemStats | undefined =
    isRecord(infoPayload) && isRecord(infoPayload.stats)
      ? (infoPayload.stats as unknown as SystemStats)
      : undefined;
  const lastUpdatedRaw =
    (infoObj && (infoObj.timestamp ?? (isRecord(infoPayload) ? infoPayload.timestamp : undefined))) ?? undefined;
  const lastUpdated =
    typeof lastUpdatedRaw === 'string' || typeof lastUpdatedRaw === 'number'
      ? new Date(lastUpdatedRaw)
      : null;

  const handleCreateBackup = async () => {
    try {
      await createBackup({} as any).unwrap();
      toast.success(t('admin.system.backupCreated'));
      
      // Принудительно обновляем список backup'ов несколько раз
      // Это гарантирует что новый backup появится в списке
      const refetchBackups = () => {
        backups.refetch();
      };
      
      // Обновляем сразу и через небольшие задержки
      refetchBackups();
      setTimeout(refetchBackups, 500);
      setTimeout(refetchBackups, 1500);
      setTimeout(refetchBackups, 3000);
    } catch (e: any) {
      toast.error(e?.data?.message ?? e?.message ?? t('admin.system.createFailed'));
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
    } catch (e: any) {
      toast.error(e?.message ?? t('admin.system.downloadFailed'));
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
    return <ErrorState error={info.error as any} onRetry={info.refetch} />;
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

      {Boolean(infoObj) && (
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

      {!stats && Boolean(infoObj) && (
        <ShadcnCard className="mb-6 border-amber-500/30 bg-amber-500/5">
          <ShadcnCardContent className="pt-6 text-center">
            <p className="font-semibold text-amber-600 dark:text-amber-400 mb-1">
              ⚠️ {t('admin.system.systemDataNotAvailable')}
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              {t('admin.system.systemDataCouldNotLoad')}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Expected: info.data.stats, but got: {Object.keys(infoObj || {}).join(', ') || 'empty object'}
            </p>
            <ShadcnButton variant="outline" onClick={() => info.refetch()}>
              {t('admin.system.retry')}
            </ShadcnButton>
            <div className="mt-4 max-h-[300px] overflow-auto text-left">
              <pre className="text-xs text-muted-foreground">
                {JSON.stringify(infoRaw, null, 2)}
              </pre>
            </div>
          </ShadcnCardContent>
        </ShadcnCard>
      )}

        {/* Database Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="col-span-full">
              <h3 className="text-lg font-bold mb-2">📊 {t('admin.system.databaseStatistics')}</h3>
            </div>
            <StatCard title={t('admin.system.totalUsers')} value={stats.database.totalUsers.toLocaleString()} icon="👥" color={isDark ? '#9e9e9e' : '#4A90E2'} />
            <StatCard title={t('admin.system.totalMasters')} value={stats.database.totalMasters.toLocaleString()} icon="🔧" color={isDark ? '#9e9e9e' : '#4A90E2'} />
            <StatCard title={t('admin.system.totalLeads')} value={stats.database.totalLeads.toLocaleString()} icon="📋" color={isDark ? '#9e9e9e' : '#4A90E2'} />
            <StatCard title={t('admin.system.totalReviews')} value={stats.database.totalReviews.toLocaleString()} icon="⭐" color={isDark ? '#9e9e9e' : '#4A90E2'} />
            <StatCard title={t('admin.system.totalPayments')} value={stats.database.totalPayments.toLocaleString()} icon="💳" color={isDark ? '#9e9e9e' : '#4A90E2'} />
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
                />
                <CpuLoadChart load={stats.system.cpu.load} />
              </div>
            </SectionCard>
            <SectionCard title={`🖥️ ${t('admin.system.systemInfo')}`}>
              <div className="space-y-4">
                <StatCard title={t('admin.system.systemUptime')} value={stats.system.uptime} icon="⏱️" subtitle={`${stats.system.platform}`} />
                <div className="border-t my-2" />
                <p className="text-sm font-semibold mt-2">🔴 {t('admin.system.redisInfo')}</p>
                <StatCard title={t('admin.system.connectedClients')} value={stats.redis.connectedClients} icon="🔴" color={isDark ? '#f44336' : '#e57373'} />
                <StatCard title={t('admin.system.usedMemory')} value={stats.redis.usedMemory} icon="💾" />
                <StatCard title={t('admin.system.totalCommands')} value={stats.redis.totalCommands.toLocaleString()} icon="📊" />
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
                  <StatCard title={t('admin.system.newUsersToday')} value={stats.daily.newUsers} color={isDark ? '#4caf50' : '#66bb6a'} />
                  <StatCard title={t('admin.system.newLeadsToday')} value={stats.daily.newLeads} color={isDark ? '#9e9e9e' : '#4A90E2'} />
                  <StatCard title={t('admin.system.newReviewsToday')} value={stats.daily.newReviews} color={isDark ? '#ff9800' : '#ffa726'} />
                  <StatCard title={t('admin.system.revenueToday')} value={`${stats.daily.revenue.toFixed(2)} MDL`} color={isDark ? '#4caf50' : '#66bb6a'} />
                </div>
                <DailyMetricsChart data={stats.daily} />
              </div>
            </SectionCard>
            <SectionCard title={`🗄️ ${t('admin.system.databaseMetrics')}`}>
              <DatabaseMetricsChart data={stats.database} />
            </SectionCard>
          </div>
        )}

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
            <ErrorState error={backups.error as any} onRetry={backups.refetch} />
          ) : Array.isArray(backupsList) && backupsList.length > 0 ? (
            <div className="space-y-3">
              {backupsList.map((backup: any, index: number) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border bg-card transition-colors hover:bg-muted/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="font-semibold text-foreground">{backup.filename || `Backup ${index + 1}`}</p>
                    <p className="text-xs text-muted-foreground">
                      Created: {backup.created ? formatDateTimeString(backup.created, locale) : backup.modified ? formatDateTimeString(backup.modified, locale) : 'Unknown date'}
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