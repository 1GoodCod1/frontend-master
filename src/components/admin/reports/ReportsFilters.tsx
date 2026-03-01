import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface ReportsFiltersProps {
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  reportsListLength: number;
  onExport: () => void;
}

export default function ReportsFilters({
  statusFilter,
  onStatusFilterChange,
  reportsListLength,
  onExport,
}: ReportsFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <Select value={statusFilter || 'all'} onValueChange={(v) => onStatusFilterChange(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t('admin.reports.filterByStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="PENDING">{t('admin.reports.status.PENDING')}</SelectItem>
            <SelectItem value="REVIEWED">{t('admin.reports.status.REVIEWED')}</SelectItem>
            <SelectItem value="RESOLVED">{t('admin.reports.status.RESOLVED')}</SelectItem>
            <SelectItem value="REJECTED">{t('admin.reports.status.REJECTED')}</SelectItem>
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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-block">
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                disabled={!reportsListLength}
                className="gap-2"
              >
                <Download className="size-4" />
                Export
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>Export reports to CSV</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
