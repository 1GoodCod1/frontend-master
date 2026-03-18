export type AdminUserRow = {
  id: string;
  email?: string | null;
  role?: string | null;
  isVerified?: boolean | null;
  isBanned?: boolean | null;
  createdAt?: string | null;
  lastLoginAt?: string | null;
} & Record<string, unknown>;

export type PaginationMeta = {
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  nextCursor?: string | null;
} & Record<string, unknown>;

export { useAdminUsers } from './useAdminUsers';
