import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const staggerDelayClass = ['delay-0', 'delay-75', 'delay-100', 'delay-150', 'delay-200'] as const;

interface AdminStatCardProps {
  value: string | number;
  label: string;
  icon: React.ReactNode;
  iconBgClassName: string;
  cardClassName?: string;
  className?: string;
  /** 0-based index for stagger animation (uses delay-0, delay-75, …) */
  staggerIndex?: number;
}

export function AdminStatCard({ value, label, icon, iconBgClassName, cardClassName, className, staggerIndex }: AdminStatCardProps) {
  const delayClass = staggerIndex != null ? staggerDelayClass[Math.min(staggerIndex, staggerDelayClass.length - 1)] : '';
  return (
    <Card
      className={cn(
        'animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards transition-all hover:-translate-y-1 hover:shadow-lg border-2',
        delayClass,
        cardClassName,
        className,
      )}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className={cn(
              'size-12 sm:size-14 rounded-lg flex items-center justify-center shrink-0 text-white shadow-md',
              iconBgClassName,
            )}
          >
            {icon}
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">{value}</p>
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
