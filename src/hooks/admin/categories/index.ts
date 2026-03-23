export type AdminCategoryRow = {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  iconKey?: string;
  iconUrl?: string;
  translations?: Record<string, { name?: string }> | null;
  isActive?: boolean;
  sortOrder?: number;
  [k: string]: unknown;
};

export { useAdminCategories } from './useAdminCategories';
