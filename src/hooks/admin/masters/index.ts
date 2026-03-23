export type PaginationMeta = {
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  nextCursor?: string | null;
} & Record<string, unknown>;

export type AdminMasterRow = {
  id: string;
  createdAt?: string | null;
  phone?: string | null;
  fullName?: string | null;
  email?: string | null;
  isFeatured?: boolean | null;
  isVerified?: boolean | null;
  avgRating?: number | null;
  rating?: number | null;
  views?: number | null;
  tariffType?: string | null;
  tariff?: string | null;
  plan?: string | null;
  user?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    isVerified?: boolean | null;
  } | null;
  category?: { name?: string | null } | null;
  city?: { name?: string | null } | null;
  slug?: string | null;
  photos?: Array<{ id?: string; file?: { path?: string | null } | null }> | null;
} & Record<string, unknown>;

export { useAdminMasters } from './useAdminMasters';
