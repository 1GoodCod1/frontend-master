import type { TFunction } from 'i18next';

type WithSlugAndName = { slug?: string | null; name?: string | null } | null | undefined;

/**
 * Возвращает переведённое название города по текущей локали.
 * Использует ключ cities.{slug}; при отсутствии перевода — fallback на name из API.
 */
export function getTranslatedCityName(
  t: TFunction,
  city: WithSlugAndName
): string {
  if (!city) return '';
  const slug = city.slug ?? '';
  const fallback = city.name ?? slug;
  if (!slug) return fallback;
  const translated = t(`cities.${slug}`, { defaultValue: fallback });
  return translated || fallback;
}

/**
 * Возвращает переведённое название категории по текущей локали.
 * Использует ключ categories.{slug}; при отсутствии перевода — fallback на name из API.
 */
export function getTranslatedCategoryName(
  t: TFunction,
  category: WithSlugAndName
): string {
  if (!category) return '';
  const slug = category.slug ?? '';
  const fallback = category.name ?? slug;
  if (!slug) return fallback;
  const translated = t(`categories.${slug}`, { defaultValue: fallback });
  return translated || fallback;
}
