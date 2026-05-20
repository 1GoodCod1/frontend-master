import { Link as RouterLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { surfaceCardInteractiveCls } from '@/lib/surfaceCard';

export interface DashboardMetricCardProps {
  to: string;
  icon: ReactNode;
  value: string | number;
  label: string;
  description: string;
}

const FABER_ICON_WRAP = 'bg-[#FFF8EB] dark:bg-[#E97525]/12';
const FABER_ICON_COLOR = 'text-[#E97525]';

export default function DashboardMetricCard({
  to,
  icon,
  value,
  label,
  description,
}: DashboardMetricCardProps) {
  return (
    <RouterLink
      to={to}
      className={cn(
        'group flex h-full min-h-[132px] flex-col gap-3 rounded-[18px] p-4 no-underline',
        surfaceCardInteractiveCls,
        'transition duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/10',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]',
            FABER_ICON_WRAP,
            FABER_ICON_COLOR,
            '[&_svg]:size-4',
          )}
        >
          {icon}
        </span>
        <ArrowUpRight className="size-4 shrink-0 text-[#ADB5BD] transition-colors group-hover:text-[#E97525] dark:text-white/35 dark:group-hover:text-[#E97525]" />
      </div>
      <div className="mt-auto min-w-0">
        <p className="text-[28px] font-bold leading-none tracking-tight tabular-nums text-[#212529] dark:text-white">
          {value}
        </p>
        <p className="mt-2 text-[13px] font-semibold leading-tight text-[#212529] dark:text-white">
          {label}
        </p>
        <p className="mt-1 text-[11px] leading-snug text-[#6C757D] dark:text-white/50">
          {description}
        </p>
      </div>
    </RouterLink>
  );
}
