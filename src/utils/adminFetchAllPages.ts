import { store } from '@/app/store';
import { adminApi } from '@/features/admin/adminApi';
import { parseAdminPaginatedResponse } from '@/utils/data';
import type { AdminUserRow } from '@/hooks/admin/users';
import type { AdminMasterRow } from '@/hooks/admin/masters';

const PAGE_SIZE = 500;
/** Safety cap: 500 * 2000 rows */
const MAX_PAGES = 2000;

export type AdminUsersExportParams = {
  role?: string;
  verified?: boolean;
  banned?: boolean;
  q?: string;
};

export type AdminMastersExportParams = {
  verified?: boolean;
  featured?: boolean;
  q?: string;
};

/**
 * Loads all admin users matching filters using offset pagination (no cursor).
 */
export async function fetchAllAdminUsers(
  params: AdminUsersExportParams,
): Promise<AdminUserRow[]> {
  const base = {
    ...(params.role ? { role: params.role } : {}),
    ...(params.verified === true ? { verified: true as const } : {}),
    ...(params.banned === true ? { banned: true as const } : {}),
    ...(params.q ? { q: params.q } : {}),
  };

  const all: AdminUserRow[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const raw = await store
      .dispatch(
        adminApi.endpoints.adminUsers.initiate({
          page,
          limit: PAGE_SIZE,
          ...base,
        }),
      )
      .unwrap();

    const { items, meta } = parseAdminPaginatedResponse<AdminUserRow>(raw, {
      page,
      limit: PAGE_SIZE,
      total: 0,
    });

    all.push(...items);

    const totalFromMeta = meta.total ?? 0;
    totalPages = Math.max(
      1,
      meta.totalPages ?? Math.ceil(totalFromMeta / PAGE_SIZE),
    );

    if (items.length === 0) break;

    page++;
  } while (page <= totalPages && page <= MAX_PAGES);

  return all;
}

/**
 * Loads all admin masters matching filters using offset pagination (no cursor).
 */
export async function fetchAllAdminMasters(
  params: AdminMastersExportParams,
): Promise<AdminMasterRow[]> {
  const base = {
    ...(params.verified === true ? { verified: true as const } : {}),
    ...(params.featured === true ? { featured: true as const } : {}),
    ...(params.q ? { q: params.q } : {}),
  };

  const all: AdminMasterRow[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const raw = await store
      .dispatch(
        adminApi.endpoints.adminMasters.initiate({
          page,
          limit: PAGE_SIZE,
          ...base,
        }),
      )
      .unwrap();

    const { items, meta } = parseAdminPaginatedResponse<AdminMasterRow>(raw, {
      page,
      limit: PAGE_SIZE,
      total: 0,
    });

    all.push(...items);

    const totalFromMeta = meta.total ?? 0;
    totalPages = Math.max(
      1,
      meta.totalPages ?? Math.ceil(totalFromMeta / PAGE_SIZE),
    );

    if (items.length === 0) break;

    page++;
  } while (page <= totalPages && page <= MAX_PAGES);

  return all;
}
