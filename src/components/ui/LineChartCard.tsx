import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';

type Point = { date: string; value: number };

function toSeries(obj: unknown): Point[] {
  if (Array.isArray(obj)) {
    return obj.map((item: Record<string, unknown>) => ({
      date: String(item.date ?? item.name ?? item.label ?? ''),
      value: Number(item.value ?? item.count ?? item.total ?? 0),
    }));
  }
  const o = obj as Record<string, unknown> | null | undefined;
  if (Array.isArray(o?.series)) return o.series as Point[];
  if (Array.isArray(o?.items)) return o.items as Point[];
  if (Array.isArray(o?.data)) return o.data as Point[];
  return [];
}

export function LineChartCard({ title, data }: { title: string; data: unknown }) {
  const series = toSeries(data);

  if (!title) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series}>
          <XAxis dataKey="date" hide={series.length > 14} />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            dot={false}
            stroke="hsl(var(--primary))"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <Card className="h-[320px] overflow-hidden">
      <CardContent className="flex h-full flex-col gap-2 p-4">
        <p className="text-sm font-medium">{title}</p>
        <div className="min-h-0 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series}>
              <XAxis dataKey="date" hide={series.length > 14} />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                dot={false}
                stroke="hsl(var(--primary))"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
