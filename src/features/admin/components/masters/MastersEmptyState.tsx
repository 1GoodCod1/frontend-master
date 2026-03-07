import { Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MastersEmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export default function MastersEmptyState({ hasFilters, onClearFilters }: MastersEmptyStateProps) {
  return (
    <div className="py-12 px-6 text-center">
      <Briefcase className="mx-auto size-20 text-muted-foreground/30 mb-4" />
      <p className="text-lg font-semibold text-foreground mb-1">No Masters Found</p>
      <p className="text-sm text-muted-foreground mb-6">
        {hasFilters
          ? 'Try adjusting your filters to see more results'
          : 'No master profiles have been created yet'}
      </p>
      {hasFilters && (
        <Button variant="outline" onClick={onClearFilters}>
          Clear Filters
        </Button>
      )}
    </div>
  );
}
