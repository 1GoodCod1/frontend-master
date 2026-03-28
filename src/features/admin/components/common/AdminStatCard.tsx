import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const staggerDelayClass = ['delay-0', 'delay-75', 'delay-100', 'delay-150', 'delay-200'] as const;

interface AdminStatCardProps {
  value: string | number;
  label: string;
  kicker?: string;
  /** Muted line under the label (e.g. explanation of what the metric means). */
  labelHint?: string;
  icon: React.ReactNode;
  iconBgClassName: string;
  iconForegroundClassName?: string;
  cardClassName?: string;
  className?: string;
  staggerIndex?: number;
}

export function AdminStatCard({
  value,
  label,
  kicker,
  labelHint,
  icon,
  iconBgClassName,
  iconForegroundClassName,
  cardClassName,
  className,
  staggerIndex,
}: AdminStatCardProps) {
  const delayClass = staggerIndex != null ? staggerDelayClass[Math.min(staggerIndex, staggerDelayClass.length - 1)] : '';
  return (
    <Card
      className={cn(
        'animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards transition hover:-translate-y-1 hover:shadow-lg border-2',
        delayClass,
        cardClassName,
        className,
      )}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className={cn(
              'size-12 sm:size-14 rounded-lg flex items-center justify-center shrink-0 shadow-md',
              '[&_svg]:shrink-0 [&_svg]:stroke-[currentColor]',
              iconForegroundClassName ?? 'text-primary-foreground',
              iconBgClassName,
            )}
          >
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            {kicker ? (
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/80 mb-0.5 truncate">
                {kicker}
              </p>
            ) : null}
            <p className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">{value}</p>
            <p className="text-sm text-muted-foreground font-medium line-clamp-2">{label}</p>
            {labelHint ? (
              <p className="text-[11px] text-muted-foreground/90 leading-snug mt-1 line-clamp-3">{labelHint}</p>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
