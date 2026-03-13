import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Activity } from 'lucide-react';

type Point = { date: string; value: number | null };

const CHART_THEMES: Record<string, { stroke: string; gradientFrom: string; gradientTo: string }> = {
  blue:    { stroke: '#3b82f6', gradientFrom: 'rgba(59,130,246,0.25)', gradientTo: 'rgba(59,130,246,0)' },
  emerald: { stroke: '#10b981', gradientFrom: 'rgba(16,185,129,0.25)', gradientTo: 'rgba(16,185,129,0)' },
  amber:   { stroke: '#f59e0b', gradientFrom: 'rgba(245,158,11,0.25)', gradientTo: 'rgba(245,158,11,0)' },
  violet:  { stroke: '#8b5cf6', gradientFrom: 'rgba(139,92,246,0.25)', gradientTo: 'rgba(139,92,246,0)' },
  rose:    { stroke: '#f43f5e', gradientFrom: 'rgba(244,63,94,0.25)',  gradientTo: 'rgba(244,63,94,0)' },
  teal:    { stroke: '#14b8a6', gradientFrom: 'rgba(20,184,166,0.25)', gradientTo: 'rgba(20,184,166,0)' },
};

function toSeries(obj: unknown): Point[] {
  if (Array.isArray(obj)) {
    return obj.map((item: Record<string, unknown>) => ({
      date: String(item.date ?? item.name ?? item.label ?? ''),
      value: item.value === null || item.value === undefined
        ? null
        : Number(item.value ?? item.count ?? item.total ?? 0),
    }));
  }
  const o = obj as Record<string, unknown> | null | undefined;
  if (Array.isArray(o?.series)) return o.series as Point[];
  if (Array.isArray(o?.items)) return o.items as Point[];
  if (Array.isArray(o?.data)) return o.data as Point[];
  return [];
}

function formatDateLabel(dateStr: string): string {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const [, month, day] = dateStr.split('T')[0].split('-');
    return `${day}.${month}`;
  }
  return dateStr;
}

function ChartTooltipContent({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value?: number | null; color?: string; name?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  if (val === null || val === undefined) return null;

  return (
    <div className="rounded-lg border border-border/50 bg-popover px-3 py-2 shadow-xl backdrop-blur-sm">
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm font-bold text-foreground">{typeof val === 'number' && val % 1 !== 0 ? val.toFixed(2) : val}</p>
    </div>
  );
}

export function LineChartCard({
  title,
  data,
  color = 'blue',
  unit,
  allowDecimals = false,
}: {
  title?: string;
  data: unknown;
  color?: keyof typeof CHART_THEMES | string;
  unit?: string;
  allowDecimals?: boolean;
}) {
  const series = toSeries(data);
  const theme = CHART_THEMES[color] ?? CHART_THEMES.blue;
  const gradientId = `gradient-${color}-${title?.replace(/\s/g, '') ?? 'default'}`;
  const hasData = series.length > 0;

  const renderChart = (height: number) => (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={series} margin={{ top: 8, right: 8, left: -12, bottom: 4 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.gradientFrom} />
            <stop offset="100%" stopColor={theme.gradientTo} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="hsl(var(--border))"
          opacity={0.4}
        />
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          tickFormatter={formatDateLabel}
          interval="preserveStartEnd"
          minTickGap={40}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          allowDecimals={allowDecimals}
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          width={36}
          tickFormatter={(v: number) => {
            if (unit) return `${v}${unit}`;
            return String(v);
          }}
        />
        <Tooltip
          content={<ChartTooltipContent />}
          cursor={{ stroke: 'hsl(var(--border))', strokeDasharray: '4 4' }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={theme.stroke}
          strokeWidth={2.5}
          fill={`url(#${gradientId})`}
          fillOpacity={1}
          dot={false}
          activeDot={{
            r: 5,
            fill: theme.stroke,
            stroke: 'hsl(var(--background))',
            strokeWidth: 2,
          }}
          connectNulls={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  if (!title) {
    return (
      <div className="min-h-[200px] w-full">
        {hasData ? renderChart(200) : (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            <Activity className="mr-2 size-4 opacity-40" />
            Нет данных
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="group overflow-hidden border-0 bg-card shadow-[0_2px_6px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.25)] transition-all duration-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.35)]">
      <CardContent className="flex h-[300px] flex-col p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {hasData && (() => {
            const validPoints = series.filter((p) => p.value !== null);
            const sum = validPoints.reduce((s, p) => s + (p.value ?? 0), 0);
            const isRating = title.toLowerCase().includes('рейтинг') || title.toLowerCase().includes('rating');
            const displayVal = isRating && validPoints.length > 0
              ? (sum / validPoints.length).toFixed(1)
              : sum.toLocaleString();
            return (
              <div className="flex items-center gap-1.5">
                <div className="size-2.5 rounded-full" style={{ backgroundColor: theme.stroke }} />
                <span className="text-xs text-muted-foreground">
                  {displayVal}{unit ? ` ${unit}` : ''} {isRating ? 'avg' : 'total'}
                </span>
              </div>
            );
          })()}
        </div>
        <div className="min-w-0 flex-1">
          {hasData ? renderChart(230) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
              <Activity className="size-8 opacity-20" />
              <p>Нет данных для отображения</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
