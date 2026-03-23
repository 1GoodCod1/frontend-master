/** Локализации с API (ro / ru / en) */
export type CategoryTranslations = Record<
  string,
  { name?: string; description?: string }
>;

export type CategoryDto = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  iconKey?: string | null;
  iconUrl?: string | null;
  translations?: CategoryTranslations | null;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
  _count?: { masters: number };
};

export type CategoryWithStatsDto = CategoryDto & { _count: { masters: number } };

export type CategoryOverviewStatDto = {
  id: string;
  name: string;
  mastersCount: number;
  isActive: boolean;
  avgRating: number;
  totalLeads: number;
};

export type CategoryMastersResponse<TMaster = unknown> = {
  category: CategoryWithStatsDto;
  masters: TMaster[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

