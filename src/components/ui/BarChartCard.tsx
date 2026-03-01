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

type DataPoint = { [key: string]: string | number };

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
      <Card className="h-[320px]">
        <CardContent className="flex flex-col gap-2 p-4">
          <p className="text-sm font-medium">{title}</p>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Нет данных для отображения
          </p>
        </CardContent>
      </Card>
    );
  }

  const keys = dataKey
    ? [dataKey]
    : Object.keys(data[0])
        .filter((k) => k !== xKey && typeof data[0][k] === 'number')
        .slice(0, 3);

  const colors = [
    'hsl(var(--primary))',
    'hsl(var(--destructive))',
    '#ed6c02',
  ];

  return (
    <Card className="h-[320px] overflow-hidden">
      <CardContent className="flex h-full flex-col gap-2 p-4">
        <p className="text-sm font-medium">{title}</p>
        <div className="min-h-0 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip />
              {keys.length > 1 && <Legend />}
              {keys.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={colors[index] ?? colors[0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
