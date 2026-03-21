import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RequestsEmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export default function RequestsEmptyState({ hasFilters, onClearFilters }: RequestsEmptyStateProps) {
  return (
    <div className="py-12 px-6 text-center">
      <Users className="mx-auto size-20 text-muted-foreground/30 mb-4" />
      <p className="text-lg font-semibold text-foreground mb-1">No Leads Found</p>
      <p className="text-sm text-muted-foreground mb-6">
        {hasFilters
          ? 'Try adjusting your filters to see more results'
          : 'No leads have been created yet'}
      </p>
      {hasFilters && (
        <Button variant="outline" onClick={onClearFilters}>
          Clear Filters
        </Button>
      )}
    </div>
  );
}
