import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Circle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface OnlineStatusBadgeProps {
  isOnline?: boolean;
  lastActivityAt?: string | Date | null;
  variant?: 'chip' | 'dot' | 'text' | 'ring';
  size?: 'small' | 'medium';
  showLabel?: boolean;
  children?: ReactNode;
}

export function OnlineStatusBadge({
  isOnline = false,
  lastActivityAt,
  variant = 'chip',
  size = 'small',
  showLabel = true,
  children,
}: OnlineStatusBadgeProps) {
  const { t } = useTranslation();

  const isRecentlyActive = lastActivityAt
    ? new Date().getTime() - new Date(lastActivityAt).getTime() < 15 * 60 * 1000
    : false;

  const effectiveOnline = isOnline === true;

  const getStatusText = () => {
    if (effectiveOnline) return t('master.status.online');
    if (isRecentlyActive) return t('master.status.recentlyActive');
    return t('master.status.offline');
  };

  const getTooltipText = () => {
    if (effectiveOnline) return t('master.status.onlineTooltip');
    if (isRecentlyActive && lastActivityAt) {
      const minutes = Math.floor(
        (new Date().getTime() - new Date(lastActivityAt).getTime()) / 60000
      );
      return t('master.status.recentlyActiveTooltip', { minutes });
    }
    return t('master.status.offlineTooltip');
  };

  const dotSize = size === 'small' ? 'h-2 w-2' : 'h-2.5 w-2.5';
  const colorClasses = effectiveOnline
    ? 'bg-green-500 text-green-500 dark:bg-green-400 dark:text-green-400'
    : isRecentlyActive
      ? 'bg-amber-500 text-amber-500 dark:bg-amber-400 dark:text-amber-400'
      : 'bg-gray-400 text-gray-500 dark:bg-gray-500 dark:text-gray-400';

  const dotEl = (
    <Circle
      className={cn(
        dotSize,
        'shrink-0 fill-current',
        colorClasses,
        effectiveOnline && 'animate-pulse shadow-[0_0_8px_currentColor]'
      )}
    />
  );

  const tooltipClass =
    'rounded-md px-2 py-1 text-xs bg-[hsl(var(--popover))] text-popover-foreground border-0 shadow-sm dark:shadow-black/40';

  const wrapTooltip = (children: React.ReactNode) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="top" className={tooltipClass}>
          {getTooltipText()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const ringClasses = effectiveOnline
    ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-background dark:ring-green-400'
    : isRecentlyActive
      ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-background dark:ring-amber-400'
      : 'ring-2 ring-gray-400 ring-offset-2 ring-offset-background dark:ring-gray-500';

  if (variant === 'ring' && children !== undefined) {
    return wrapTooltip(
      <span
        className={cn(
          'inline-flex rounded-full',
          ringClasses,
          effectiveOnline && 'animate-pulse'
        )}
      >
        {children}
      </span>
    );
  }

  if (variant === 'dot') {
    return wrapTooltip(
      <span
        className={cn(
          'inline-block rounded-full',
          dotSize,
          colorClasses,
          effectiveOnline && 'animate-pulse shadow-[0_0_8px_currentColor]'
        )}
      />
    );
  }

  if (variant === 'text') {
    return wrapTooltip(
      <span
        className={cn(
          'inline-flex items-center gap-1.5 font-medium',
          size === 'small' ? 'text-xs' : 'text-sm',
          effectiveOnline && 'text-green-600 dark:text-green-400',
          isRecentlyActive && !effectiveOnline && 'text-amber-600 dark:text-amber-400',
          !effectiveOnline && !isRecentlyActive && 'text-muted-foreground'
        )}
      >
        {dotEl}
        {showLabel && getStatusText()}
      </span>
    );
  }

  return wrapTooltip(
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border font-semibold',
        size === 'small' ? 'h-5 px-1.5 text-[0.7rem]' : 'h-6 px-2 text-xs',
        'border-current bg-muted/50',
        effectiveOnline && 'text-green-600 dark:text-green-400',
        isRecentlyActive && !effectiveOnline && 'text-amber-600 dark:text-amber-400',
        !effectiveOnline && !isRecentlyActive && 'text-muted-foreground'
      )}
    >
      {dotEl}
      {showLabel && getStatusText()}
    </span>
  );
}
