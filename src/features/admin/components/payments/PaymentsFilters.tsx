import { Download } from 'lucide-react';
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

interface PaymentsFiltersProps {
  status: string;
  allPaymentsLength: number;
  onStatusChange: (value: string) => void;
  onExport: () => void;
}

export default function PaymentsFilters({
  status,
  allPaymentsLength,
  onStatusChange,
  onExport,
}: PaymentsFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-block">
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                disabled={!allPaymentsLength}
                className="gap-2"
              >
                <Download className="size-4" />
                Export
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>Export payments to CSV</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Select value={status || 'all'} onValueChange={(v) => onStatusChange(v === 'all' ? '' : v)}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="PENDING">PENDING</SelectItem>
          <SelectItem value="PAID">PAID</SelectItem>
          <SelectItem value="COMPLETED">COMPLETED</SelectItem>
          <SelectItem value="FAILED">FAILED</SelectItem>
          <SelectItem value="CANCELLED">CANCELLED</SelectItem>
        </SelectContent>
      </Select>
      {status && (
        <Badge
          variant="secondary"
          className="font-semibold cursor-pointer hover:bg-primary/20"
          onClick={() => onStatusChange('')}
        >
          Filter: {status} ×
        </Badge>
      )}
    </div>
  );
}
