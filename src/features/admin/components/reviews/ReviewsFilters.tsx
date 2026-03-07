import { Download } from 'lucide-react';
import { STATUS_OPTIONS } from '@/hooks/admin/reviews/useAdminReviews';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ReviewsFiltersProps {
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  allReviewsLength: number;
  onExport: () => void;
}

export default function ReviewsFilters({
  statusFilter,
  onStatusFilterChange,
  allReviewsLength,
  onExport,
}: ReviewsFiltersProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-block">
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                disabled={!allReviewsLength}
                className="gap-2"
              >
                <Download className="size-4" />
                Export
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>Export reviews to CSV</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Select
        value={statusFilter || 'all'}
        onValueChange={(v) => onStatusFilterChange(v === 'all' ? '' : v)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {STATUS_OPTIONS.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {statusFilter && (
        <Badge
          variant="secondary"
          className="font-semibold cursor-pointer hover:bg-primary/20"
          onClick={() => onStatusFilterChange('')}
        >
          Filter: {statusFilter} ×
        </Badge>
      )}
    </div>
  );
}
