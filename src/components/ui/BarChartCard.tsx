import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Activity } from 'lucide-react';

type DataPoint = { [key: string]: string | number };

const BAR_COLORS = [
  { fill: '#3b82f6', hover: '#2563eb' },
  { fill: '#10b981', hover: '#059669' },
  { fill: '#f59e0b', hover: '#d97706' },
];

function ChartTooltipContent({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value?: number; color?: string; name?: string; dataKey?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/50 bg-popover px-3 py-2 shadow-xl backdrop-blur-sm">
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</p>
      <div className="space-y-1">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="size-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs text-muted-foreground">{entry.name ?? entry.dataKey}:</span>
            <span className="text-xs font-bold text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BarChartCard({
  title,
  data,
  dataKey,
  xKey = 'date',
}: {
  title: string;
  data: DataPoint[];
  dataKey?: string;
  xKey?: string;
}) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <Card className="min-w-0 overflow-hidden border-0 bg-card shadow-[0_2px_6px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
        <CardContent className="flex h-[300px] flex-col p-5">
          <p className="mb-3 text-sm font-semibold text-foreground">{title}</p>
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <Activity className="size-8 opacity-20" />
            <p>Нет данных для отображения</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const keys = dataKey
    ? [dataKey]
    : Object.keys(data[0])
        .filter((k) => k !== xKey && typeof data[0][k] === 'number')
        .slice(0, 3);

  return (
    <Card className="group min-w-0 overflow-hidden border-0 bg-card shadow-[0_2px_6px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.25)] transition-all duration-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.35)]">
      <CardContent className="flex h-[300px] flex-col p-5">
        <p className="mb-3 text-sm font-semibold text-foreground">{title}</p>
        <div className="min-h-[230px] min-w-0 flex-1">
          <ResponsiveContainer width="100%" height={230} minWidth={0} minHeight={200}>
            <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 4 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
                opacity={0.4}
              />
              <XAxis
                dataKey={xKey}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                width={36}
              />
              <Tooltip content={<ChartTooltipContent />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} />
              {keys.length > 1 && (
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                  iconType="circle"
                  iconSize={8}
                />
              )}
              {keys.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={BAR_COLORS[index % BAR_COLORS.length].fill}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
