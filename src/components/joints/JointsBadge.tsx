import { cn } from '@/lib/utils';
import { JointsMark } from '@/components/joints/JointsMark';
import { JOINTS_BADGE_BASE, JOINTS_SIZE } from '@/components/joints/jointsStyles';

export type JointsBadgeSize = keyof typeof JOINTS_SIZE;

export type JointsBadgeProps = {
  value: number;
  size?: JointsBadgeSize;
  variant?: 'default' | 'inverted';
  /** e.g. "Min" — shown before the amount */
  prefix?: string;
  /** Show "joints" after the number */
  showLabel?: boolean;
  className?: string;
};

const JOINTS_INVERTED = cn(
  'border-white/30 bg-white/15 text-white shadow-none',
  'from-white/20 via-white/12 to-white/8',
  'dark:border-white/25 dark:from-white/15 dark:via-white/10 dark:to-white/5 dark:text-white',
);

export function JointsBadge({
  value,
  size = 'sm',
  variant = 'default',
  prefix,
  showLabel = false,
  className,
}: JointsBadgeProps) {
  const s = JOINTS_SIZE[size];
  const iconTone =
    variant === 'inverted' ? 'text-white' : 'text-[#D97706] dark:text-[#FBBF24]';

  return (
    <span
      className={cn(
        JOINTS_BADGE_BASE,
        variant === 'inverted' && JOINTS_INVERTED,
        s.wrap,
        className,
      )}
    >
      <JointsMark className={cn(s.icon, iconTone)} />
      <span className="inline-flex min-w-0 items-baseline gap-1">
        {prefix ? <span className="font-semibold opacity-80">{prefix}</span> : null}
        <span>{value}</span>
        {showLabel ? <span className={s.label}>joints</span> : null}
      </span>
    </span>
  );
}
