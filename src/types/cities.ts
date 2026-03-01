export type CityDto = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  _count?: { masters: number };
};

export type CityWithStatsDto = CityDto & { _count: { masters: number } };

export type CityMastersResponse<TMaster = unknown> = {
  city: CityWithStatsDto;
  masters: TMaster[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
};

export type CityOverviewStatDto = {
  id: string;
  name: string;
  mastersCount: number;
  isActive: boolean;
  avgRating: number;
  totalLeads: number;
};

