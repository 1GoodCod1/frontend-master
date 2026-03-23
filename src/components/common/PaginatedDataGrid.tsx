import { useMemo, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  type GridColDef,
  type GridRenderCellParams,
} from '@/types/dataGrid';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { pickPagination } from '@/types/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataGridToolbar } from './DataGridToolbar';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { isRecord } from '@/utils/guards';

type Extracted = {
  rows: Record<string, unknown>[];
  total?: number;
  page?: number;
  limit?: number;
};


/**
 * Server-paged data: always use meta.total (and meta page/limit), not only when rows.length > 0.
 * Otherwise empty pages or filters with 0 rows on a page showed total = 0 and broke Prev/Next.
 */
function extractPaged(data: unknown, fallbackPage = 1, fallbackLimit = 20): Extracted {
  if (Array.isArray(data)) {
    const rows = data.filter(isRecord);
    return { rows, total: rows.length, page: fallbackPage, limit: fallbackLimit };
  }
  if (!isRecord(data)) {
    return { rows: [], total: 0, page: fallbackPage, limit: fallbackLimit };
  }
  const p = pickPagination(data);
  const rows = p.rows.filter(isRecord);
  return {
    rows,
    total: p.total,
    page: p.page ?? fallbackPage,
    limit: p.limit ?? fallbackLimit,
  };
}

/** 1-based page numbers with ellipsis for large page counts */
function getVisiblePages(current: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 0) return [];
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);
  for (let p = current - 1; p <= current + 1; p++) {
    if (p >= 1 && p <= totalPages) pages.add(p);
  }
  const sorted = Array.from(pages).sort((a, b) => a - b);
  const out: (number | 'ellipsis')[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push('ellipsis');
    out.push(sorted[i]);
  }
  return out;
}

function inferId(row: Record<string, unknown>, index: number): string | number {
  const candidate =
    row.id ?? row._id ?? row.uuid ?? row.userId ?? row.masterId ?? index;
  return typeof candidate === 'string' || typeof candidate === 'number'
    ? candidate
    : index;
}

function inferColumns(rows: Record<string, unknown>[], preferred: string[] = []): GridColDef[] {
  const sample = rows?.[0];
  if (!sample) return [];
  const keys = Object.keys(sample);
  const ordered = [...preferred.filter((k) => keys.includes(k)), ...keys.filter((k) => !preferred.includes(k))];
  return ordered
    .filter((k) => k !== 'password' && k !== 'hash')
    .slice(0, 12)
    .map((field) => ({
      field,
      headerName: field,
      flex: 1,
      minWidth: 140,
      valueGetter: (params: GridRenderCellParams) => {
        const row = isRecord(params?.row) ? params.row : {};
        const v = row[field];
        if (v == null) return '';
        if (typeof v === 'object') return JSON.stringify(v);
        return v;
      },
    }));
}

export type DataGridExtraProps = {
  onRefresh?: () => void;
  onExport?: () => void;
  exportDisabled?: boolean;
  onRowDoubleClick?: (row: Record<string, unknown>) => void;
  onRowClick?: (row: Record<string, unknown>) => void;
  rowHeight?: number;
  getRowClassName?: (row: Record<string, unknown>, index: number) => string;
  checkboxSelection?: boolean;
  rowSelectionModel?: (string | number)[];
  onRowSelectionModelChange?: (model: (string | number)[]) => void;
  /** Ignored, for API compatibility */
  disableRowSelectionOnClick?: boolean;
  /** Ignored (MUI compatibility) */
  sx?: unknown;
};

export type PaginatedDataGridProps = {
  data: unknown;
  loading?: boolean;
  error?: unknown;
  page: number;
  limit: number;
  onPageChange: (page: number, limit: number) => void;
  columns?: GridColDef[];
  preferredColumns?: string[];
  height?: number;
  dataGridProps?: DataGridExtraProps;
};

export function PaginatedDataGrid(props: PaginatedDataGridProps) {
  const {
    data,
    loading,
    error,
    page,
    limit,
    onPageChange,
    columns,
    preferredColumns,
    height = 560,
    dataGridProps,
  } = props;

  const { t } = useTranslation();
  const [quickFilter, setQuickFilter] = useState('');

  const extracted = useMemo(() => extractPaged(data, page, limit), [data, page, limit]);

  type RowWithId = Record<string, unknown> & { __rowId: string | number };
  const rows = useMemo<RowWithId[]>(
    () => extracted.rows.map((r, idx) => ({ ...r, __rowId: inferId(r, idx) })),
    [extracted.rows],
  );

  const cols = useMemo(() => {
    if (columns?.length) return columns;
    return inferColumns(extracted.rows, preferredColumns ?? []);
  }, [columns, extracted.rows, preferredColumns]);

  const filteredRows = useMemo<RowWithId[]>(() => {
    if (!quickFilter.trim()) return rows;
    const q = quickFilter.toLowerCase();
    return rows.filter((row) =>
      cols.some((col) => {
        const val = col.valueGetter
          ? col.valueGetter({ row, value: row[col.field] })
          : row[col.field];
        return String(val ?? '').toLowerCase().includes(q);
      }),
    );
  }, [rows, cols, quickFilter]);

  const pageSizeOptions = useMemo(
    () => Array.from(new Set([10, 20, 25, 50, 100, limit])).sort((a, b) => a - b),
    [limit],
  );

  const total = extracted.total ?? rows.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const visiblePages = useMemo(
    () => getVisiblePages(currentPage, totalPages),
    [currentPage, totalPages],
  );

  const selectionModel = dataGridProps?.rowSelectionModel ?? [];
  const setSelectionModel = dataGridProps?.onRowSelectionModelChange;
  const hasSelection = dataGridProps?.checkboxSelection && setSelectionModel;
  const allSelected =
    hasSelection &&
    filteredRows.length > 0 &&
    filteredRows.every((r) => selectionModel.includes((r as { __rowId: string | number }).__rowId));
  const someSelected = hasSelection && filteredRows.some((r) => selectionModel.includes((r as { __rowId: string | number }).__rowId));

  const toggleRow = (rowId: string | number) => {
    if (!setSelectionModel) return;
    const next = selectionModel.includes(rowId)
      ? selectionModel.filter((id) => id !== rowId)
      : [...selectionModel, rowId];
    setSelectionModel(next);
  };

  const toggleAll = () => {
    if (!setSelectionModel) return;
    const ids = filteredRows.map((r) => (r as { __rowId: string | number }).__rowId);
    if (allSelected) {
      setSelectionModel(selectionModel.filter((id) => !ids.includes(id)));
    } else {
      const set = new Set([...selectionModel, ...ids]);
      setSelectionModel(Array.from(set));
    }
  };

  if (!cols.length) {
    return (
      <Alert className="border-primary/30 bg-primary/5">
        <AlertDescription>
          {t('dataGrid.noColumns')}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div
      className="flex w-full max-w-full min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-card shadow-sm dark:border-white/[0.08]"
      style={{ height }}
    >
      <DataGridToolbar
        onRefresh={dataGridProps?.onRefresh}
        onExport={dataGridProps?.onExport}
        exportDisabled={dataGridProps?.exportDisabled}
        quickFilterValue={quickFilter}
        onQuickFilterChange={setQuickFilter}
        quickFilterPlaceholder={t('common.search')}
      />

      <div className="relative min-h-0 min-w-0 flex-1 overflow-auto overscroll-x-contain">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 dark:bg-white/[0.03] hover:bg-muted/50 dark:hover:bg-muted/50 border-b-2 border-amber-500/30 dark:border-amber-500/20">
              {hasSelection && (
                <TableHead className="w-10 px-2">
                  <Checkbox
                    checked={allSelected || (someSelected ? 'indeterminate' : false)}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              {cols.map((col) => (
                <TableHead
                  key={col.field}
                  className={cn(col.cellClassName, 'font-semibold')}
                  style={{
                    minWidth: col.minWidth ?? col.width,
                    width: col.width,
                    maxWidth: col.flex ? undefined : col.width,
                  }}
                >
                  {col.headerName}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.map((row, index) => {
              const rowId = (row as { __rowId: string | number }).__rowId;
              const rowClassName = dataGridProps?.getRowClassName?.(row, index);
              return (
                <TableRow
                  key={String(rowId)}
                  className={cn(
                    'cursor-default',
                    (dataGridProps?.onRowDoubleClick || dataGridProps?.onRowClick) && 'cursor-pointer',
                    rowClassName,
                  )}
                  onClick={() => dataGridProps?.onRowClick?.(row)}
                  onDoubleClick={() => dataGridProps?.onRowDoubleClick?.(row)}
                  style={
                    dataGridProps?.rowHeight
                      ? { minHeight: dataGridProps.rowHeight, maxHeight: dataGridProps.rowHeight }
                      : undefined
                  }
                >
                  {hasSelection && (
                    <TableCell className="w-10 px-2" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectionModel.includes(rowId)}
                        onCheckedChange={() => toggleRow(rowId)}
                        aria-label="Select row"
                      />
                    </TableCell>
                  )}
                  {cols.map((col) => {
                    const value = col.valueGetter
                      ? col.valueGetter({ row, value: row[col.field], id: rowId })
                      : row[col.field];
                    const params: GridRenderCellParams = { row, value, id: rowId };
                    const content = col.renderCell
                      ? col.renderCell(params)
                      : value != null
                        ? String(value)
                        : '—';
                    return (
                      <TableCell
                        key={col.field}
                        className={cn(
                          'align-middle py-3',
                          col.cellClassName,
                          col.cellClassName?.includes('center') && 'justify-center text-center',
                        )}
                        style={{
                          minWidth: col.minWidth ?? col.width,
                          width: col.width,
                        }}
                      >
                        {content}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {filteredRows.length === 0 && !loading && (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            {t('dataGrid.noRows')}
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-muted/30 p-2 dark:border-white/[0.03] dark:bg-white/[0.03] rounded-b-lg">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            {total === 0 ? 0 : (currentPage - 1) * limit + 1}–{Math.min(currentPage * limit, total)} of {total}
          </span>
          <Select
            value={String(limit)}
            onValueChange={(v) => onPageChange(1, Number(v))}
          >
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
            className="inline-flex items-center justify-center gap-1 rounded-md border-0 bg-amber-50 text-amber-700 px-3 py-1.5 text-sm font-medium transition-all hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-800/40 disabled:pointer-events-none disabled:opacity-50"
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
                  'inline-flex min-w-8 items-center justify-center rounded-md px-2 py-1.5 text-sm font-medium transition-all',
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
            className="inline-flex items-center justify-center gap-1 rounded-md border-0 bg-amber-50 text-amber-700 px-3 py-1.5 text-sm font-medium transition-all hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-800/40 disabled:pointer-events-none disabled:opacity-50"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1, limit)}
          >
            {t('common.next')}
          </button>
        </div>
      </div>

      {error ? (
        <Alert variant="destructive" className="mt-2 mx-2">
          <AlertDescription>{t('dataGrid.loadError')}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
