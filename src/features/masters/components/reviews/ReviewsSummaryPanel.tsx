import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { InlineStarRating } from './InlineStarRating';

export function ReviewsSummaryPanel({
  avgRating,
  totalCount,
  distribution,
}: {
  avgRating: number;
  totalCount: number;
  distribution: number[];
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
      <div className="flex flex-col items-center justify-center shrink-0 px-6 py-3 rounded-xl bg-amber-500/15 dark:bg-amber-500/20">
        <span className="text-2xl font-bold text-amber-700 dark:text-amber-400">{avgRating.toFixed(1)}</span>
        <div className="flex gap-0.5 mt-1">
          <InlineStarRating rating={avgRating} starClassName="h-4 w-4" />
        </div>
        <span className="text-xs text-muted-foreground mt-1">
          (<span className="font-semibold text-amber-700 dark:text-amber-400">{totalCount}</span>{' '}
          {t('masterDetails.reviewsCountLabel', 'reviews')})
        </span>
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = distribution[stars - 1];
          const pct = totalCount > 0 ? (count / totalCount) * 100 : 0;
          return (
            <div key={stars} className="flex items-center gap-2">
              <div className="flex items-center gap-1 w-16 shrink-0">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                <span className="text-sm font-medium">{stars}</span>
              </div>
              <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-500 transition duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground w-6 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
