import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  changePercent?: number;
  subtitle?: string;
  /** React node or emoji string */
  icon?: React.ReactNode | string;
  /** Override value color (hex) */
  color?: string;
  /** Show progress bar 0–100 */
  progress?: number;
  /** Card hover effect (SystemPage style) */
  hover?: boolean;
}

export function StatCard({
  title,
  value,
  trend,
  changePercent,
  subtitle,
  icon,
  color,
  progress,
  hover = false,
}: StatCardProps) {
  const trendColor =
    trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground';
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const iconNode = typeof icon === 'string' ? <span className="text-xl">{icon}</span> : icon;

  return (
    <Card
      className={cn(
        'border-0 shadow-[0_2px_6px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.25)]',
        hover && 'h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-lg'
      )}
    >
      <CardContent className="pt-6">
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground font-medium">{title}</span>
            {iconNode}
          </div>
          <span
            className="text-2xl font-extrabold tracking-tight"
            style={color ? { color } : undefined}
          >
            {value}
          </span>
          {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
          {progress !== undefined && (
            <div className="mt-2">
              <Progress value={progress} className="h-1.5" />
              <p className="text-xs text-muted-foreground mt-1">{progress.toFixed(1)}%</p>
            </div>
          )}
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
