import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  changePercent?: number;
  subtitle?: string;
  icon?: React.ReactNode;
}

export function StatCard({ title, value, trend, changePercent, subtitle, icon }: StatCardProps) {
  const trendColor =
    trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground';
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <Card className="border-0 shadow-[0_2px_6px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
      <CardContent className="pt-6">
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">{title}</span>
            {icon}
          </div>
          <span className="text-2xl font-extrabold tracking-tight">{value}</span>
          {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
          {trend != null && changePercent !== undefined && (
            <div className={cn('flex flex-row items-center gap-1', trendColor)}>
              <TrendIcon className="size-4 shrink-0" />
              <span className="text-xs font-semibold">
                {changePercent > 0 ? '+' : ''}
                {changePercent.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
