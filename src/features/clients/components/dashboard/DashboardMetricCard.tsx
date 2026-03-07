import { Link as RouterLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface DashboardMetricCardProps {
  to: string;
  icon: ReactNode;
  value: string | number;
  label: string;
  description: string;
  iconBgColor?: string;
  iconColor?: string;
  iconBoxShadow?: string;
  hoverBorderColor?: string;
  hoverBoxShadow?: string;
}

export default function DashboardMetricCard({
  to,
  icon,
  value,
  label,
  description,
  iconBgColor,
  iconColor,
  iconBoxShadow,
  hoverBorderColor,
  hoverBoxShadow,
}: DashboardMetricCardProps) {
  return (
    <RouterLink
      to={to}
      className={cn(
        'block h-full rounded-2xl border border-slate-200 dark:border-[#2c2a24] bg-card p-6 text-card-foreground shadow-sm no-underline transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-violet-500/40 dark:hover:border-violet-500/30',
        hoverBorderColor && 'hover:border-[var(--hover-border)]',
        hoverBoxShadow && 'hover:shadow-[var(--hover-shadow)]'
      )}
      style={
        {
          '--hover-border': hoverBorderColor,
          '--hover-shadow': hoverBoxShadow,
        } as React.CSSProperties
      }
    >
      <div className="flex flex-col gap-4">
        <span
          className="flex size-14 items-center justify-center rounded-full"
          style={{
            backgroundColor: iconBgColor,
            color: iconColor,
            boxShadow: iconBoxShadow,
          }}
        >
          {icon}
        </span>
        <div>
          <p className="text-2xl font-extrabold tracking-tight text-foreground">
            {value}
          </p>
          <p className="font-semibold text-muted-foreground">{label}</p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </RouterLink>
  );
}
