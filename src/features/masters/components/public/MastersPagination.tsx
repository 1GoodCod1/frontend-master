import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MastersPaginationProps {
  page: number;
  totalPages: number;
  canPrev: boolean;
  canNext: boolean;
  isFetching: boolean;
  onPrev: () => void;
  onNext: () => void;
  onGoTo?: (page: number) => void;
}

/**
 * Build a paginated list with ellipsis.
 * Examples (current shown in brackets):
 *  total=5,  cur=3  → [1, 2, 3, 4, 5]
 *  total=10, cur=1  → [1, 2, 3, …, 10]
 *  total=10, cur=5  → [1, …, 4, 5, 6, …, 10]
 *  total=10, cur=10 → [1, …, 8, 9, 10]
 */
function getPageItems(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const items: (number | 'ellipsis')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push('ellipsis');
  for (let i = start; i <= end; i++) items.push(i);
  if (end < total - 1) items.push('ellipsis');
  items.push(total);
  return items;
}

export function MastersPagination({
  page,
  totalPages,
  canPrev,
  canNext,
  isFetching,
  onPrev,
  onNext,
  onGoTo,
}: MastersPaginationProps) {
  const { t } = useTranslation();
  const items = useMemo(() => getPageItems(page, totalPages || 1), [page, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label={t('common.page')}
      className="mt-8 mb-2 flex items-center justify-center gap-1"
    >
      <button
        type="button"
        aria-label={t('common.prev')}
        onClick={onPrev}
        disabled={!canPrev || isFetching}
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm transition-all',
          'text-foreground/70 hover:text-foreground hover:bg-accent',
          'disabled:opacity-30 disabled:pointer-events-none',
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {items.map((it, idx) =>
        it === 'ellipsis' ? (
          <span
            key={`e-${idx}`}
            className="inline-flex h-9 w-9 items-center justify-center text-muted-foreground"
            aria-hidden
          >
            <MoreHorizontal className="h-4 w-4" />
          </span>
        ) : (
          <button
            key={it}
            type="button"
            aria-current={it === page ? 'page' : undefined}
            disabled={isFetching}
            onClick={() => onGoTo?.(it)}
            className={cn(
              'inline-flex h-9 min-w-[2.25rem] px-2 items-center justify-center rounded-lg text-sm font-semibold tabular-nums transition-all',
              it === page
                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30 dark:bg-[#E97525] dark:text-white dark:shadow-[#E97525]/30'
                : 'text-foreground/70 hover:text-foreground hover:bg-accent',
              'disabled:pointer-events-none',
              !onGoTo && it !== page && 'cursor-default',
            )}
          >
            {it}
          </button>
        ),
      )}

      <button
        type="button"
        aria-label={t('common.next')}
        onClick={onNext}
        disabled={!canNext || isFetching}
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm transition-all',
          'text-foreground/70 hover:text-foreground hover:bg-accent',
          'disabled:opacity-30 disabled:pointer-events-none',
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
