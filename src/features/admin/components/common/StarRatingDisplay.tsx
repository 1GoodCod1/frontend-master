import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingDisplayProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = { sm: 'size-4', md: 'size-5', lg: 'size-6' };

export function StarRatingDisplay({ value, max = 5, size = 'md', className }: StarRatingDisplayProps) {
  const clamped = Math.max(0, Math.min(max, value));
  const sizeClass = sizeClasses[size];
  const full = Math.floor(clamped);
  const hasHalf = clamped % 1 >= 0.25 && clamped % 1 < 0.75;

  return (
    <div className={cn('flex items-center gap-0.5', className)} role="img" aria-label={`Rating: ${clamped} out of ${max}`}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < full || (i === full && hasHalf);
        const half = i === full && hasHalf;
        return (
          <span key={i} className="relative inline-block">
            <Star className={cn(sizeClass, 'shrink-0 text-muted-foreground/40')} />
            {filled && (
              <Star
                className={cn(
                  sizeClass,
                  'absolute left-0 top-0 shrink-0 fill-amber-400 text-amber-400',
                  half && 'overflow-hidden',
                )}
                style={half ? { clipPath: 'inset(0 50% 0 0)' } : undefined}
              />
            )}
          </span>
        );
      })}
    </div>
  );
}
