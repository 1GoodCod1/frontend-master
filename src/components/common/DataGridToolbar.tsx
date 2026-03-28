import { RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface DataGridToolbarProps {
  onRefresh?: () => void;
  onExport?: () => void;
  exportDisabled?: boolean;
  quickFilterValue?: string;
  onQuickFilterChange?: (value: string) => void;
  quickFilterPlaceholder?: string;
}

export function DataGridToolbar({
  onRefresh,
  onExport,
  exportDisabled,
  quickFilterValue = '',
  onQuickFilterChange,
  quickFilterPlaceholder = 'Search…',
}: DataGridToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2 border-b border-slate-200 dark:border-white/[0.08] bg-muted/30 dark:bg-white/[0.03] rounded-t-lg">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {onQuickFilterChange && (
          <Input
            placeholder={quickFilterPlaceholder}
            value={quickFilterValue}
            onChange={(e) => onQuickFilterChange(e.target.value)}
            className="max-w-full sm:max-w-xs h-8 min-w-0"
          />
        )}
      </div>
      <div className="flex items-center gap-2">
        {onExport != null && (
          <Button
            type="button"
            size="sm"
            onClick={onExport}
            disabled={exportDisabled}
            className="gap-1.5 border-0 bg-amber-600 text-white shadow-sm transition hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600"
          >
            <Download className="size-4" />
            Export
          </Button>
        )}
        {onRefresh && (
          <Button type="button" size="sm" onClick={onRefresh} className="gap-1.5 border-0 bg-amber-50 text-amber-700 shadow-sm transition hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-800/40">
            <RefreshCw className="size-4" />
            Refresh
          </Button>
        )}
      </div>
    </div>
  );
}
