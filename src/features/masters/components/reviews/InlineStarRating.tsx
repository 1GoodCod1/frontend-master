import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function InlineStarRating({
  rating,
  starClassName,
}: {
  rating: number;
  starClassName: string;
}) {
  const r = rating;
  return (
    <>
      {[1, 2, 3, 4, 5].map((v) => {
        const isFull = r >= v;
        const isHalf = r >= v - 0.5 && r < v;
        const isEmpty = !isFull && !isHalf;
        return (
          <div key={v} className="relative shrink-0">
            {isEmpty && (
              <Star className={cn(starClassName, 'text-gray-300 dark:text-gray-600 fill-transparent')} />
            )}
            {isFull && <Star className={cn(starClassName, 'text-amber-500 fill-amber-500')} />}
            {isHalf && (
              <>
                <Star className={cn(starClassName, 'text-gray-300 dark:text-gray-600 fill-transparent')} />
                <div className="absolute inset-0 w-1/2 overflow-hidden">
                  <Star className={cn(starClassName, 'text-amber-500 fill-amber-500')} />
                </div>
              </>
            )}
          </div>
        );
      })}
    </>
  );
}
