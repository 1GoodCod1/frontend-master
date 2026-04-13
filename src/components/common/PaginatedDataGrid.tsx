import { useMemo, useState } from 'react';
import { TableVirtuoso } from 'react-virtuoso';
import { useTranslation } from 'react-i18next';
import {
  type GridColDef,
  type GridRenderCellParams,
} from '@/types/dataGrid';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataGridToolbar } from './DataGridToolbar';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useIsMdUp } from '@/hooks/useMediaQuery';
import { PaginatedDataGridFooter } from './PaginatedDataGridFooter';
import {
  COMPACT_MAX_COLUMNS,
  VIRTUAL_TABLE_ROW_THRESHOLD,
  extractPaged,
  getVisiblePages,
  inferColumns,
  inferId,
} from './PaginatedDataGrid.utils';

type RowWithId = Record<string, unknown> & { __rowId: string | number };

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

  const rows = useMemo<RowWithId[]>(
    () => extracted.rows.map((r, idx) => ({ ...r, __rowId: inferId(r, idx) })),
    [extracted.rows],
  );

  const cols = useMemo(() => {
    if (columns?.length) return columns;
    return inferColumns(extracted.rows, preferredColumns ?? []);
  }, [columns, extracted.rows, preferredColumns]);

  const isMdUp = useIsMdUp();
  const visibleCols = useMemo(() => {
    if (isMdUp) return cols;
    return cols.slice(0, COMPACT_MAX_COLUMNS);
  }, [cols, isMdUp]);

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

  const useVirtualTable = filteredRows.length >= VIRTUAL_TABLE_ROW_THRESHOLD;

  const selectionModel = dataGridProps?.rowSelectionModel ?? [];
  const setSelectionModel = dataGridProps?.onRowSelectionModelChange;
  const hasSelection = dataGridProps?.checkboxSelection && setSelectionModel;
  const allSelected =
    hasSelection &&
    filteredRows.length > 0 &&
    filteredRows.every((r) => selectionModel.includes(r.__rowId));
  const someSelected =
    hasSelection && filteredRows.some((r) => selectionModel.includes(r.__rowId));

  const toggleRow = (rowId: string | number) => {
    if (!setSelectionModel) return;
    const next = selectionModel.includes(rowId)
      ? selectionModel.filter((id) => id !== rowId)
      : [...selectionModel, rowId];
    setSelectionModel(next);
  };

  const toggleAll = () => {
    if (!setSelectionModel) return;
    const ids = filteredRows.map((r) => r.__rowId);
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
        <AlertDescription>{t('dataGrid.noColumns')}</AlertDescription>
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

        {useVirtualTable ? (
          <TableVirtuoso<RowWithId>
            data={filteredRows}
            style={{ height: '100%' }}
            className="w-full"
            defaultItemHeight={52}
            increaseViewportBy={{ top: 160, bottom: 240 }}
            computeItemKey={(_, row) => String(row.__rowId)}
            fixedHeaderContent={() => (
              <tr className="bg-muted/50 dark:bg-white/[0.03] hover:bg-muted/50 dark:hover:bg-muted/50 border-b-2 border-amber-500/30 dark:border-amber-500/20">
                {hasSelection && (
                  <th className="h-10 w-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                    <Checkbox
                      checked={allSelected || (someSelected ? 'indeterminate' : false)}
                      onCheckedChange={toggleAll}
                      aria-label="Select all"
                    />
                  </th>
                )}
                {visibleCols.map((col) => (
                  <th
                    key={col.field}
                    className={cn(
                      'h-10 px-2 text-left align-middle font-semibold text-muted-foreground',
                      col.cellClassName,
                    )}
                    style={{
                      minWidth: col.minWidth ?? col.width,
                      width: col.width,
                      maxWidth: col.flex ? undefined : col.width,
                    }}
                  >
                    {col.headerName}
                  </th>
                ))}
              </tr>
            )}
            itemContent={(_index, row) => {
              const rowId = row.__rowId;
              return (
                <>
                  {hasSelection && (
                    <TableCell className="w-10 px-2" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectionModel.includes(rowId)}
                        onCheckedChange={() => toggleRow(rowId)}
                        aria-label="Select row"
                      />
                    </TableCell>
                  )}
                  {visibleCols.map((col) => {
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
                </>
              );
            }}
            components={{
              TableRow: ({ item, ...rowProps }) => {
                const row = item as RowWithId;
                const idx = filteredRows.findIndex((r) => r.__rowId === row.__rowId);
                const rowClassName = dataGridProps?.getRowClassName?.(row, idx >= 0 ? idx : 0);
                return (
                  <tr
                    {...rowProps}
                    className={cn(
                      'border-b border-slate-200 transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted dark:border-white/[0.08]',
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
                  />
                );
              },
            }}
          />
        ) : (
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
                {visibleCols.map((col) => (
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
                const rowId = row.__rowId;
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
                    {visibleCols.map((col) => {
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
        )}

        {filteredRows.length === 0 && !loading && (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            {t('dataGrid.noRows')}
          </div>
        )}
      </div>

      <PaginatedDataGridFooter
        total={total}
        currentPage={currentPage}
        limit={limit}
        totalPages={totalPages}
        visiblePages={visiblePages}
        pageSizeOptions={pageSizeOptions}
        onPageChange={onPageChange}
      />

      {error ? (
        <Alert variant="destructive" className="mt-2 mx-2">
          <AlertDescription>{t('dataGrid.loadError')}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
