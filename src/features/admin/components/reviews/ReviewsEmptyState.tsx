import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReviewsEmptyStateProps {
  statusFilter: string;
  onClearFilter: () => void;
}

export default function ReviewsEmptyState({ statusFilter, onClearFilter }: ReviewsEmptyStateProps) {
  return (
    <div className="py-12 px-6 text-center">
      <MessageSquare className="mx-auto size-20 text-muted-foreground/30 mb-4" />
      <p className="text-lg font-semibold text-foreground mb-1">No Reviews Found</p>
      <p className="text-sm text-muted-foreground mb-6">
        {statusFilter ? 'Try adjusting your filters to see more results' : 'No reviews have been created yet'}
      </p>
      {statusFilter && (
        <Button variant="outline" onClick={onClearFilter}>
          Clear Filters
        </Button>
      )}
    </div>
  );
}
