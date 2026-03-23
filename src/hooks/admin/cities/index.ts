export type AdminCityRow = {
  id: string;
  name?: string;
  slug?: string;
  translations?: Record<string, { name?: string }> | null;
  isActive?: boolean;
  [k: string]: unknown;
};

export { useAdminCities } from './useAdminCities';
