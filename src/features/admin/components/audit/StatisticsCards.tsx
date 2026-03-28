import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, Database, Shield, TrendingUp } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AdminStatCard } from '@/features/admin/components/common/AdminStatCard';
import { unwrapAuditStatsPayload } from '@/utils/data';
import { formatAuditActorLabel, type AuditActorUser } from '@/utils/auditDisplay';

type AuditStatsPayload = {
  timeframe?: string;
  totalLogs: number;
  byAction: Array<{ action: string; count: number }>;
  byUser: Array<{
    userId: string;
    count: number;
    user?: AuditActorUser | null;
  }>;
};

function normalizeByUserRow(raw: unknown): AuditStatsPayload['byUser'][0] | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;
  const userId = typeof r.userId === 'string' ? r.userId : 'unknown';
  const count = typeof r.count === 'number' ? r.count : Number(r.count);
  const safeCount = Number.isFinite(count) ? count : 0;
  let user: AuditActorUser | null = null;
  if (r.user != null && typeof r.user === 'object' && !Array.isArray(r.user)) {
    const u = r.user as Record<string, unknown>;
    user = {
      email: typeof u.email === 'string' ? u.email : null,
      phone: typeof u.phone === 'string' ? u.phone : null,
      role: u.role != null ? String(u.role) : null,
      firstName: typeof u.firstName === 'string' ? u.firstName : null,
      lastName: typeof u.lastName === 'string' ? u.lastName : null,
    };
  }
  return { userId, count: safeCount, user };
}

function parseAuditStats(raw: unknown): AuditStatsPayload | null {
  const o = unwrapAuditStatsPayload(raw);
  if (!o) return null;
  if (typeof o.totalLogs !== 'number') return null;
  const byUserRaw = Array.isArray(o.byUser) ? o.byUser : [];
  const byUser = byUserRaw
    .map((row) => normalizeByUserRow(row))
    .filter((row): row is NonNullable<typeof row> => row != null);
  return {
    timeframe: typeof o.timeframe === 'string' ? o.timeframe : undefined,
    totalLogs: o.totalLogs,
    byAction: Array.isArray(o.byAction) ? (o.byAction as AuditStatsPayload['byAction']) : [],
    byUser,
  };
}

function topUserDisplayLine(
  t: (key: string) => string,
  row: AuditStatsPayload['byUser'][0] | undefined,
): string {
  if (!row || row.userId === 'unknown') return t('admin.audit.statsTopUserEmpty');
  return formatAuditActorLabel(t, row.userId, row.user ?? null);
}

interface StatisticsCardsProps {
  stats: {
    isLoading: boolean;
    isError: boolean;
    data?: unknown;
    refetch: () => void;
  };
  timeframe: 'day' | 'week' | 'month';
  onTimeframeChange: (v: 'day' | 'week' | 'month') => void;
  /** Total rows in the audit log table (all time), from pagination meta. */
  journalTotal: number;
}

export default function StatisticsCards({
  stats,
  timeframe,
  onTimeframeChange,
  journalTotal,
}: StatisticsCardsProps) {
  const { t } = useTranslation();

  const parsed = useMemo(() => parseAuditStats(stats.data), [stats.data]);
  const topAction = parsed?.byAction?.[0];
  const topUser = parsed?.byUser?.[0];

  const periodLabel =
    timeframe === 'day'
      ? t('admin.audit.statsPeriod_day')
      : timeframe === 'week'
        ? t('admin.audit.statsPeriod_week')
        : t('admin.audit.statsPeriod_month');

  const topActionName = topAction?.action
    ? t(`admin.users.auditAction_${topAction.action}`, topAction.action)
    : '';

  const periodValue = stats.isLoading ? '…' : parsed != null ? parsed.totalLogs : stats.isError ? '—' : '—';
  const topActionValue =
    stats.isLoading ? '…' : topAction != null ? topAction.count : '—';
  const topActionLabel =
    topAction != null && topActionName
      ? topActionName
      : t('admin.audit.statsTopActionEmpty');
  const journalValue = journalTotal;

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-2">
          <Label htmlFor="audit-stats-timeframe" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('admin.audit.statsTimeframe')}
          </Label>
          <Select
            value={timeframe}
            onValueChange={(v) => onTimeframeChange(v as 'day' | 'week' | 'month')}
          >
            <SelectTrigger id="audit-stats-timeframe" className="w-[min(100%,240px)] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">{t('admin.audit.statsPeriod_day')}</SelectItem>
              <SelectItem value="week">{t('admin.audit.statsPeriod_week')}</SelectItem>
              <SelectItem value="month">{t('admin.audit.statsPeriod_month')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground pb-1 max-w-xl">
          {t('admin.audit.statsSummaryHint')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <AdminStatCard
          staggerIndex={0}
          kicker={periodLabel}
          value={periodValue}
          label={t('admin.audit.statsEventsInPeriod')}
          icon={<Shield className="size-7" />}
          iconBgClassName="bg-primary/15 dark:bg-primary/25"
          iconForegroundClassName="text-primary dark:text-primary-foreground"
          cardClassName="border-primary/20 bg-primary/5"
        />
        <AdminStatCard
          staggerIndex={1}
          kicker={t('admin.audit.statsMostCommonKicker')}
          value={topActionValue}
          label={topActionLabel}
          icon={<TrendingUp className="size-7" />}
          iconBgClassName="bg-emerald-600 dark:bg-emerald-600"
          iconForegroundClassName="text-white"
          cardClassName="border-emerald-500/20 bg-emerald-500/10"
        />
        <AdminStatCard
          staggerIndex={2}
          kicker={t('admin.audit.statsTopUserKicker')}
          value={
            stats.isLoading ? '…' : topUser != null ? topUser.count : '—'
          }
          label={stats.isLoading ? '…' : topUserDisplayLine(t, topUser)}
          labelHint={t('admin.audit.statsTopUserBlockHint')}
          icon={<BarChart3 className="size-7" />}
          iconBgClassName="bg-violet-600 dark:bg-violet-600"
          iconForegroundClassName="text-white"
          cardClassName="border-violet-500/20 bg-violet-500/10"
        />
        <AdminStatCard
          staggerIndex={3}
          kicker={t('admin.audit.statsJournalKicker')}
          value={journalValue}
          label={t('admin.audit.statsJournalTotal')}
          icon={<Database className="size-7" />}
          iconBgClassName="bg-slate-600 dark:bg-slate-600"
          iconForegroundClassName="text-white"
          cardClassName="border-border bg-muted/30"
        />
      </div>
    </div>
  );
}
