export type AdminCategoryRow = {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
  sortOrder?: number;
  [k: string]: unknown;
};

export { useAdminCategories } from './useAdminCategories';
