import { StarRatingDisplay } from '@/components/admin/common/StarRatingDisplay';

interface RatingCellProps {
  rating: number;
}

export default function RatingCell({ rating }: RatingCellProps) {
  const value = rating ?? 0;
  return (
    <div className="flex items-center gap-1.5">
      <StarRatingDisplay value={value} size="sm" />
      <span className="text-sm font-semibold text-foreground">{value.toFixed(1)}</span>
    </div>
  );
}
