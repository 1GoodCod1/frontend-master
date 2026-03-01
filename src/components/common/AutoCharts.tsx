import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';

type AnyObj = Record<string, unknown>;

function isObj(v: unknown): v is AnyObj {
  return Boolean(v && typeof v === 'object' && !Array.isArray(v));
}

function pickXKey(sample: AnyObj): string | null {
  const candidates = ['date', 'day', 'month', 'week', 'period', 'label', 'name', 'time'];
  for (const k of candidates) if (k in sample) return k;
  const first = Object.keys(sample)[0];
  return first ?? null;
}

function pickYKeys(sample: AnyObj): string[] {
  const keys = Object.keys(sample).filter((k) => typeof sample[k] === 'number');
  return keys.filter((k) => !['id', 'countId'].includes(k));
}

function toSeriesCandidates(data: AnyObj): Array<{ title: string; rows: AnyObj[] }> {
  const out: Array<{ title: string; rows: AnyObj[] }> = [];
  for (const [k, v] of Object.entries(data)) {
    if (Array.isArray(v) && v.length > 0 && isObj(v[0])) {
      out.push({ title: k, rows: v as AnyObj[] });
    }
  }
  return out;
}

export function AutoCharts({ data, title }: { data: unknown; title?: string }) {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const series = toSeriesCandidates(data as AnyObj);
  if (!series.length) return null;

  return (
    <div className="flex flex-col gap-4">
      {title ? <h3 className="text-lg font-semibold">{title}</h3> : null}
      {series.map((s) => {
        const xKey = pickXKey(s.rows[0]);
        const yKeys = pickYKeys(s.rows[0]);
        if (!xKey || !yKeys.length) return null;

        const useBar = yKeys.length === 1 && /count|total|sum/i.test(yKeys[0]);

        return (
          <Card key={s.title} className="border-border">
            <CardContent className="p-4">
              <p className="mb-2 text-sm font-medium text-muted-foreground">{s.title}</p>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {useBar ? (
                    <BarChart data={s.rows}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey={xKey} className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 'var(--radius)',
                        }}
                      />
                      <Bar dataKey={yKeys[0]} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : (
                    <LineChart data={s.rows}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey={xKey} className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 'var(--radius)',
                        }}
                      />
                      {yKeys.slice(0, 3).map((yk) => (
                        <Line key={yk} type="monotone" dataKey={yk} dot={false} stroke="hsl(var(--primary))" />
                      ))}
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
