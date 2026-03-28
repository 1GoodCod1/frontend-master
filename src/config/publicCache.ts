/**
 * Публичные списки (мастера, фильтры, каталоги): в dev — агрессивное обновление;
 * в production — меньше лишних refetch и короче HTTP-bust на клиенте (сервер отдаёт свой Cache-Control).
 */
export const isProductionBuild = import.meta.env.PROD;

const PATHS_BUST_HTTP_DEV = new Set([
  '/masters/popular',
  '/masters/new',
  '/masters/landing-stats',
  '/masters/filters',
  '/categories',
  '/cities',
  '/web-push/vapid-public-key',
]);

/** В prod не трогаем отдельные GET /categories и /cities — полагаемся на короткий max-age с API */
const PATHS_BUST_HTTP_PROD = new Set([
  '/masters/popular',
  '/masters/new',
  '/masters/landing-stats',
  '/masters/filters',
  '/categories',
  '/cities',
  '/web-push/vapid-public-key',
]);

const DYNAMIC_PATH_PATTERNS: RegExp[] = [
  /^\/masters\/[^/]+$/,
  /^\/masters\/[^/]+\/photos$/,
  /^\/reviews\/master\/[^/]+$/,
  /^\/reviews\/stats\/[^/]+$/,
];

export function shouldBustHttpCacheForPublicGetPath(pathWithoutQuery: string): boolean {
  const set = isProductionBuild ? PATHS_BUST_HTTP_PROD : PATHS_BUST_HTTP_DEV;
  if (set.has(pathWithoutQuery)) return true;
  return DYNAMIC_PATH_PATTERNS.some((re) => re.test(pathWithoutQuery));
}

export const publicCachePolicy = {
  /** RTK: список фильтров реже пересобирается в prod */
  mastersFiltersKeepUnusedDataFor: isProductionBuild ? 300 : 120,
  mastersPopularKeepUnusedDataFor: isProductionBuild ? 300 : 60,
  mastersFiltersRefetchOnFocus: !isProductionBuild,
  mastersPopularRefetchOnFocus: !isProductionBuild,
} as const;
