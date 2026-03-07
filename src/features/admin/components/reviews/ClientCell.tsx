import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { ReviewDto } from '@/types/reviews';

interface ClientCellProps {
  review: ReviewDto;
}

export default function ClientCell({ review }: ClientCellProps) {
  const clientName = review.clientName || '—';

  return (
    <div className="flex items-center gap-3 w-full min-w-0">
      <Avatar className="size-12 rounded-lg shrink-0 bg-gradient-to-br from-primary to-primary/80 text-base font-semibold shadow-sm">
        <AvatarFallback>{clientName[0]?.toUpperCase() || 'C'}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-foreground truncate">{clientName}</span>
        {review.clientPhone && (
          <span className="text-xs text-muted-foreground truncate block">{review.clientPhone}</span>
        )}
      </div>
    </div>
  );
}
