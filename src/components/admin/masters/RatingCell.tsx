import { StarRatingDisplay } from '@/components/admin/common/StarRatingDisplay';

interface RatingCellProps {
  rating: number | undefined;
  reviewCount: number | undefined;
}

export default function RatingCell({ rating, reviewCount }: RatingCellProps) {
  const ratingValue = rating ?? 0;
  const reviewCountValue = reviewCount ?? 0;

  if (!ratingValue) {
    return <span className="text-sm text-muted-foreground">No reviews</span>;
  }

  return (
    <div className="flex items-center gap-1.5">
      <StarRatingDisplay value={ratingValue} size="sm" />
      <span className="text-sm font-semibold text-foreground">{ratingValue.toFixed(1)}</span>
      <span className="text-xs text-muted-foreground">({reviewCountValue})</span>
    </div>
  );
}
