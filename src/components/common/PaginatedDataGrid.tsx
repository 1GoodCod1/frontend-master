import { useMemo, useState } from 'react';
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


function firstArrayInObject(obj: unknown): unknown[] | undefined {
  if (!isRecord(obj)) return undefined;
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (Array.isArray(v)) return v;
  }
  return undefined;
}

function extractPaged(data: unknown, fallbackPage = 1, fallbackLimit = 20): Extracted {
  if (Array.isArray(data)) {
    const rows = data.filter(isRecord);
    return { rows, total: rows.length, page: fallbackPage, limit: fallbackLimit };
  }
  if (!isRecord(data)) {
    return { rows: [], total: 0, page: fallbackPage, limit: fallbackLimit };
  }
  const p = pickPagination(data);
  if (p.rows.length)
    return {
      rows: p.rows.filter(isRecord),
      total: p.total,
      page: p.page ?? fallbackPage,
      limit: p.limit ?? fallbackLimit,
    };
  const rowsAny = firstArrayInObject(data) || [];
  const rows = rowsAny.filter(isRecord);
  return { rows, total: rows.length, page: fallbackPage, limit: fallbackLimit };
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
          Не удалось определить колонки для таблицы (неизвестная форма ответа). Открой JSON view ниже.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full max-w-full min-w-0 rounded-xl border border-slate-200 dark:border-white/[0.08] overflow-hidden bg-card shadow-sm" style={{ height }}>
      <DataGridToolbar
        onRefresh={dataGridProps?.onRefresh}
        onExport={dataGridProps?.onExport}
        exportDisabled={dataGridProps?.exportDisabled}
        quickFilterValue={quickFilter}
        onQuickFilterChange={setQuickFilter}
        quickFilterPlaceholder="Search…"
      />

      <div className="relative min-w-0 overflow-auto overscroll-x-contain" style={{ height: height - 52 }}>
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
            No rows
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 p-2 border-t border-slate-200 dark:border-white/[0.08] bg-muted/30 dark:bg-white/[0.03] rounded-b-lg">
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
          <span>per page</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-1 rounded-md border-0 bg-amber-50 text-amber-700 px-3 py-1.5 text-sm font-medium transition-all hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-800/40 disabled:pointer-events-none disabled:opacity-50"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1, limit)}
          >
            Previous
          </button>
          <span className="px-2 text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-1 rounded-md border-0 bg-amber-50 text-amber-700 px-3 py-1.5 text-sm font-medium transition-all hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-800/40 disabled:pointer-events-none disabled:opacity-50"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1, limit)}
          >
            Next
          </button>
        </div>
      </div>

      {error ? (
        <Alert variant="destructive" className="mt-2 mx-2">
          <AlertDescription>Ошибка загрузки данных</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
