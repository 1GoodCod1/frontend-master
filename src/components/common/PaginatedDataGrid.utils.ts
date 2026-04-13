import { pickPagination } from '@/types/pagination';
import {
  type GridColDef,
  type GridRenderCellParams,
} from '@/types/dataGrid';
import { isRecord } from '@/utils/guards';

export type ExtractedPaged = {
  rows: Record<string, unknown>[];
  total?: number;
  page?: number;
  limit?: number;
};

/** Сколько колонок показывать на узких экранах (меньше DOM на слабых устройствах) */
export const COMPACT_MAX_COLUMNS = 6;

/** Виртуализировать тело таблицы при большом числе строк на странице */
export const VIRTUAL_TABLE_ROW_THRESHOLD = 20;

/**
 * Server-paged data: always use meta.total (and meta page/limit), not only when rows.length > 0.
 * Otherwise empty pages or filters with 0 rows on a page showed total = 0 and broke Prev/Next.
 */
export function extractPaged(data: unknown, fallbackPage = 1, fallbackLimit = 20): ExtractedPaged {
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
export function getVisiblePages(current: number, totalPages: number): (number | 'ellipsis')[] {
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

export function inferId(row: Record<string, unknown>, index: number): string | number {
  const candidate =
    row.id ?? row._id ?? row.uuid ?? row.userId ?? row.masterId ?? index;
  return typeof candidate === 'string' || typeof candidate === 'number'
    ? candidate
    : index;
}

export function inferColumns(rows: Record<string, unknown>[], preferred: string[] = []): GridColDef[] {
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
