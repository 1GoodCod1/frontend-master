export type SortBy = 'all' | 'createdAt' | 'rating' | 'price';
export type SortOrder = 'asc' | 'desc';

export function defaultSortOrder(sortBy: SortBy): SortOrder {
  if (sortBy === 'price') return 'asc';
  return 'desc';
}