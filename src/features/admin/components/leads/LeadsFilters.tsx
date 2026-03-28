import { Download } from 'lucide-react';
import { STATUS_OPTIONS } from '@/hooks/admin/leads';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface RequestsFiltersProps {
  status: string;
  dateFrom: string;
  dateTo: string;
  allLeadsLength: number;
  onStatusChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onExport: () => void;
}

export default function RequestsFilters({
  status,
  dateFrom,
  dateTo,
  allLeadsLength,
  onStatusChange,
  onDateFromChange,
  onDateToChange,
  onExport,
}: RequestsFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-block">
              <Button
                size="sm"
                onClick={onExport}
                disabled={!allLeadsLength}
                className="gap-2 border-0 bg-amber-600 text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-amber-700 hover:shadow-xl dark:bg-amber-700 dark:hover:bg-amber-600"
              >
                <Download className="size-4" />
                Export requests
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>Export requests to CSV</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Select value={status || 'all'} onValueChange={(v) => onStatusChange(v === 'all' ? '' : v)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Request status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {STATUS_OPTIONS.map((s) => (
            <SelectItem key={s} value={s}>
              {s.replace('_', ' ')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="date"
        className="w-[180px]"
        value={dateFrom}
        onChange={(e) => onDateFromChange(e.target.value)}
        aria-label="Date from (YYYY-MM-DD)"
      />
      <Input
        type="date"
        className="w-[180px]"
        value={dateTo}
        onChange={(e) => onDateToChange(e.target.value)}
        aria-label="Date to (YYYY-MM-DD)"
      />
    </div>
  );
}
