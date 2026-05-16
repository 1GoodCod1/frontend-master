import { Link as RouterLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MetricAccent = 'blue' | 'rose' | 'amber' | 'violet';

const ACCENT_CLASS: Record<MetricAccent, string> = {
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400',
};

export interface DashboardMetricCardProps {
  to: string;
  icon: ReactNode;
  value: string | number;
  label: string;
  description: string;
  accent?: MetricAccent;
}

export default function DashboardMetricCard({
  to,
  icon,
  value,
  label,
  description,
  accent = 'blue',
}: DashboardMetricCardProps) {
  return (
    <RouterLink
      to={to}
      className={cn(
        'group flex h-full flex-col gap-4 rounded-2xl p-5 no-underline transition duration-200',
        'bg-[#F9FAFB] border border-gray-200/80 shadow-sm',
        'dark:bg-white/[0.06] dark:border-white/[0.08] dark:shadow-lg dark:shadow-black/20',
        'hover:-translate-y-1 hover:shadow-md hover:shadow-black/10 dark:hover:border-white/[0.14]',
      )}
    >
      <div className="flex items-start justify-between">
        <span
          className={cn(
            'flex size-11 items-center justify-center rounded-xl',
            ACCENT_CLASS[accent],
          )}
        >
          {icon}
        </span>
        <ArrowUpRight className="size-4 text-muted-foreground/40 transition-colors group-hover:text-foreground/60" />
      </div>
      <div>
        <p className="text-3xl font-bold tracking-tight tabular-nums text-foreground">
          {value}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-foreground/80">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
    </RouterLink>
  );
}
