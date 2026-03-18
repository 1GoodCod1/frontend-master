import { isRecord } from '@/utils/guards';
import { toNumber } from '@/utils/data';

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
};

export type Paginated<T> =
  | { items: T[]; meta: PaginationMeta }
  | { data: T[]; meta: PaginationMeta }
  | { items: T[]; page: number; limit: number; total: number }
  | { data: T[]; page: number; limit: number; total: number };

export function pickPagination<T>(
  input: unknown,
): { rows: T[]; total: number; page: number; limit: number } {
  if (!isRecord(input)) return { rows: [], total: 0, page: 1, limit: 10 };

  const items =
    input.items ?? input.data ?? input.rows ?? input.results ?? input.users;
  const meta = isRecord(input.meta)
    ? input.meta
    : isRecord(input.pagination)
      ? input.pagination
      : {};

  const page = toNumber(input.page ?? meta.page, 1) || 1;
  const limit = toNumber(input.limit ?? meta.limit, 10) || 10;
  const total = toNumber(
    input.total ?? meta.total ?? input.count ?? (Array.isArray(items) ? items.length : 0),
    0,
  );

  return { rows: Array.isArray(items) ? (items as T[]) : [], total, page, limit };
}
