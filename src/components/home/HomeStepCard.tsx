import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { surfaceCardCls } from '@/lib/surfaceCard';

type HomeStepCardProps = {
  index: number;
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  badgeClassName?: string;
  accentClass?: string;
  iconBgClass?: string;
};

const DEFAULT_ACCENT = 'text-[#E97525]';
const DEFAULT_ICON_BG = 'bg-[#FFF8EB] dark:bg-[#E97525]/12';

export function HomeStepCard({
  index,
  icon: Icon,
  title,
  description,
  badge,
  badgeClassName = 'bg-[#E97525]/10 text-[#E97525]',
  accentClass = DEFAULT_ACCENT,
  iconBgClass = DEFAULT_ICON_BG,
}: HomeStepCardProps) {
  return (
    <div
      className={cn(
        'relative flex h-full flex-col items-center px-4 py-5 text-center sm:px-5 sm:py-6',
        surfaceCardCls,
        'transition duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/10',
      )}
    >
      <span
        className={cn(
          'absolute top-3 left-3 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold tabular-nums',
          iconBgClass,
          accentClass,
        )}
        aria-hidden
      >
        {index}
      </span>

      <div className={cn('mb-3 flex h-10 w-10 items-center justify-center rounded-[10px]', iconBgClass)}>
        <Icon className={cn('size-5', accentClass)} strokeWidth={2} />
      </div>

      {badge ? (
        <span className={cn('mb-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold', badgeClassName)}>
          {badge}
        </span>
      ) : null}

      <h3 className="text-sm font-semibold leading-snug text-[#212529] dark:text-white">{title}</h3>
      <p className="mt-1.5 text-xs leading-snug text-[#6C757D] dark:text-white/50">{description}</p>
    </div>
  );
}
