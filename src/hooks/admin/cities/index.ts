export type AdminCityRow = {
  id: string;
  name?: string;
  slug?: string;
  isActive?: boolean;
  [k: string]: unknown;
};

export { useAdminCities } from './useAdminCities';
