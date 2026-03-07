import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaymentsEmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export default function PaymentsEmptyState({ hasFilters, onClearFilters }: PaymentsEmptyStateProps) {
  return (
    <div className="py-12 px-6 text-center">
      <CreditCard className="mx-auto size-20 text-muted-foreground/30 mb-4" />
      <p className="text-lg font-semibold text-foreground mb-1">No Payments Found</p>
      <p className="text-sm text-muted-foreground mb-6">
        {hasFilters
          ? 'Try adjusting your filters to see more results'
          : 'No payments have been processed yet'}
      </p>
      {hasFilters && (
        <Button variant="outline" onClick={onClearFilters}>
          Clear Filters
        </Button>
      )}
    </div>
  );
}
