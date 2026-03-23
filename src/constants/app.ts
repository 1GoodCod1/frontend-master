/** Префиксы эндпоинтов RTK Query для персиста в localStorage */
export const PERSISTED_ENDPOINT_PREFIXES = [
  'categoriesList',
  'categoriesWithCounts',
  'categoriesById',
  'citiesList',
  'citiesById',
] as const;

/** Версия схемы кэша API для миграций */
export const API_CACHE_PERSIST_VERSION = 8;
