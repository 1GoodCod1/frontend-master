import { MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type PaginatedDataGridFooterProps = {
  total: number;
  currentPage: number;
  limit: number;
  totalPages: number;
  visiblePages: (number | 'ellipsis')[];
  pageSizeOptions: number[];
  onPageChange: (page: number, limit: number) => void;
};

export function PaginatedDataGridFooter({
  total,
  currentPage,
  limit,
  totalPages,
  visiblePages,
  pageSizeOptions,
  onPageChange,
}: PaginatedDataGridFooterProps) {
  const { t } = useTranslation();

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-muted/30 p-2 dark:border-white/[0.03] dark:bg-white/[0.03] rounded-b-lg">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          {total === 0 ? 0 : (currentPage - 1) * limit + 1}–{Math.min(currentPage * limit, total)} of {total}
        </span>
        <Select value={String(limit)} onValueChange={(v) => onPageChange(1, Number(v))}>
          <SelectTrigger className="w-[72px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>{t('dataGrid.perPage')}</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-1 sm:justify-end">
        <button
          type="button"
          className="inline-flex items-center justify-center gap-1 rounded-md border-0 bg-amber-50 text-amber-700 px-3 py-1.5 text-sm font-medium transition hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-800/40 disabled:pointer-events-none disabled:opacity-50"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1, limit)}
        >
          {t('common.prev')}
        </button>
        {visiblePages.map((item, idx) =>
          item === 'ellipsis' ? (
            <span
              key={`ellipsis-${idx}`}
              className="flex h-8 w-8 items-center justify-center text-muted-foreground"
              aria-hidden
            >
              <MoreHorizontal className="size-4" />
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={cn(
                'inline-flex min-w-8 items-center justify-center rounded-md px-2 py-1.5 text-sm font-medium transition',
                item === currentPage
                  ? 'bg-amber-600 text-white shadow-sm dark:bg-amber-600'
                  : 'border-0 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-800/40',
              )}
              onClick={() => onPageChange(item, limit)}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          className="inline-flex items-center justify-center gap-1 rounded-md border-0 bg-amber-50 text-amber-700 px-3 py-1.5 text-sm font-medium transition hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-800/40 disabled:pointer-events-none disabled:opacity-50"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1, limit)}
        >
          {t('common.next')}
        </button>
      </div>
    </div>
  );
}
