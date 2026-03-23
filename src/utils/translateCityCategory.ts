import type { TFunction } from 'i18next';
import i18n from '@/i18n';

type WithSlugAndName = { slug?: string | null; name?: string | null } | null | undefined;

function localeKey(lang: string | undefined): string {
  return (lang ?? 'ro').split('-')[0] || 'ro';
}

/** Текущая локаль из i18n, если параметр не передан */
function resolveLang(language?: string): string {
  return localeKey(language ?? i18n.language);
}

/**
 * Название города: сначала translations из API, затем i18n, затем name.
 */
export function getTranslatedCityName(
  t: TFunction,
  city:
    | (WithSlugAndName & {
        translations?: Record<string, { name?: string }> | null;
      })
    | null
    | undefined,
  language?: string,
): string {
  if (!city) return '';
  const slug = city.slug ?? '';
  const fallback = city.name ?? slug;
  const lng = resolveLang(language);
  const tr = city.translations;
  if (tr && typeof tr === 'object') {
    const fromLng = tr[lng]?.name;
    if (fromLng) return fromLng;
    const ro = tr.ro?.name;
    if (ro) return ro;
  }
  if (!slug) return fallback;
  const translated = t(`cities.${slug}`, { defaultValue: fallback });
  return translated || fallback;
}

/**
 * Название категории: сначала translations из API, затем i18n, затем name.
 */
export function getTranslatedCategoryName(
  t: TFunction,
  category:
    | (WithSlugAndName & {
        translations?: Record<string, { name?: string }> | null;
      })
    | null
    | undefined,
  language?: string,
): string {
  if (!category) return '';
  const slug = category.slug ?? '';
  const fallback = category.name ?? slug;
  const lng = resolveLang(language);
  const tr = category.translations;
  if (tr && typeof tr === 'object') {
    const fromLng = tr[lng]?.name;
    if (fromLng) return fromLng;
    const ro = tr.ro?.name;
    if (ro) return ro;
  }
  if (!slug) return fallback;
  const translated = t(`categories.${slug}`, { defaultValue: fallback });
  return translated || fallback;
}
