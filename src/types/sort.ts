export type SortBy = 'all' | 'createdAt' | 'rating' | 'views' | 'leadsCount' | 'price' | 'totalReviews' | 'updatedAt';
export type SortOrder = 'asc' | 'desc';

export function defaultSortOrder(sortBy: SortBy): SortOrder {
  if (sortBy === 'price') return 'asc';
  return 'desc';
}