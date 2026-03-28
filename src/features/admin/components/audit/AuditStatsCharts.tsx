import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { unwrapAuditStatsPayload } from '@/utils/data';
import { formatAuditActorLabel, type AuditActorUser } from '@/utils/auditDisplay';

const axisTick = {
  fontSize: 10,
  fill: 'hsl(var(--muted-foreground))',
} as const;

/** Extra left room so the first tilted X label is not clipped. */
const chartOuterMargin = { top: 4, right: 8, left: 14, bottom: 6 };

const tooltipStyles = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 'var(--radius)',
  fontSize: 11,
  padding: '6px 10px',
} as const;

const tooltipLabelStyle = { fontSize: 11, fontWeight: 600 as const, marginBottom: 2 };
const tooltipItemStyle = { fontSize: 11, padding: 0 };

type ByActionRow = { action: string; count: number };
type ByUserRow = {
  userId: string;
  count: number;
  user?: AuditActorUser | null;
};

export default function AuditStatsCharts({ data }: { data: unknown }) {
  const { t } = useTranslation();

  const parsed = useMemo(() => unwrapAuditStatsPayload(data), [data]);
  const byAction: ByActionRow[] = useMemo(() => {
    const raw = parsed?.byAction;
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((r): r is ByActionRow => r != null && typeof r === 'object' && typeof (r as ByActionRow).action === 'string')
      .map((r) => ({
        action: r.action,
        count: typeof r.count === 'number' ? r.count : Number(r.count) || 0,
      }));
  }, [parsed]);

  const byUser: ByUserRow[] = useMemo(() => {
    const raw = parsed?.byUser;
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((r): r is ByUserRow => r != null && typeof r === 'object' && typeof (r as ByUserRow).userId === 'string')
      .slice(0, 8)
      .map((r) => ({
        userId: r.userId,
        count: typeof r.count === 'number' ? r.count : Number(r.count) || 0,
        user: (r as ByUserRow).user ?? null,
      }));
  }, [parsed]);

  const actionChartData = useMemo(
    () =>
      byAction.map((row) => ({
        name: t(`admin.users.auditAction_${row.action}`, row.action),
        count: row.count,
      })),
    [byAction, t],
  );

  const userChartData = useMemo(
    () =>
      byUser.map((row) => ({
        name: formatAuditActorLabel(t, row.userId, row.user ?? null),
        count: row.count,
      })),
    [byUser, t],
  );

  if (!parsed) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        {t('admin.audit.statsChartsNoData')}
      </p>
    );
  }

  const hasActions = actionChartData.length > 0;
  const hasUsers = userChartData.length > 0;

  if (!hasActions && !hasUsers) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        {t('admin.audit.statsChartsEmptyPeriod')}
      </p>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {hasActions ? (
        <Card className="border-border/80 shadow-sm">
          <CardContent className="p-3 pt-3.5">
            <p className="mb-2 text-xs font-medium tracking-tight text-muted-foreground">
              {t('admin.audit.statsChartByAction')}
            </p>
            <div className="h-[240px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={actionChartData} margin={chartOuterMargin}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="name"
                    tick={axisTick}
                    interval={0}
                    angle={-32}
                    textAnchor="end"
                    height={62}
                    tickMargin={6}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={axisTick}
                    width={30}
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted) / 0.12)' }}
                    contentStyle={{ ...tooltipStyles, maxWidth: 300 }}
                    labelStyle={tooltipLabelStyle}
                    itemStyle={tooltipItemStyle}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--primary))"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={40}
                    name={t('admin.audit.statsChartCount')}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {hasUsers ? (
        <Card className="border-border/80 shadow-sm">
          <CardContent className="p-3 pt-3.5">
            <p className="mb-2 text-xs font-medium tracking-tight text-muted-foreground">
              {t('admin.audit.statsChartByUser')}
            </p>
            <div className="h-[240px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={userChartData} margin={chartOuterMargin}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="name"
                    tick={axisTick}
                    interval={0}
                    angle={-32}
                    textAnchor="end"
                    height={68}
                    tickMargin={6}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={axisTick}
                    width={30}
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted) / 0.12)' }}
                    contentStyle={{ ...tooltipStyles, maxWidth: 320 }}
                    labelStyle={tooltipLabelStyle}
                    itemStyle={tooltipItemStyle}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(262 83% 58%)"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={40}
                    name={t('admin.audit.statsChartCount')}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
