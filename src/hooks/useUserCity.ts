import { useEffect, useState, useCallback, useMemo } from 'react';
import { useCitiesListQuery } from '@/features/cities/citiesApi';
import type { CityDto } from '@/types';
import { safeStorage } from '@/utils/safeStorage';
import { hasUserCityConsent } from '@/features/cookie-consent/storage';

export const USER_CITY_STORAGE_KEY = 'userCityName';
const STORAGE_KEY = USER_CITY_STORAGE_KEY;

function normalizeForMatch(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();
}

function matchCityToId(
  apiCity: string,
  cities: CityDto[]
): { id: string; name: string } | null {
  if (!apiCity?.trim() || !cities?.length) return null;
  const normalized = normalizeForMatch(apiCity);
  for (const c of cities) {
    const name = (c.name ?? '').toString();
    const slug = (c.slug ?? '').toString();
    if (
      normalizeForMatch(name).includes(normalized) ||
      normalized.includes(normalizeForMatch(name)) ||
      normalizeForMatch(slug).includes(normalized) ||
      normalized.includes(normalizeForMatch(slug))
    ) {
      return {
        id: c.id,
        name: name || slug,
      };
    }
  }
  return null;
}

export function useUserCity() {
  const citiesQuery = useCitiesListQuery({ isActive: true });
  const cities = useMemo(
    () => (citiesQuery.data ?? []) as CityDto[],
    [citiesQuery.data]
  );
  const [cityId, setCityId] = useState<string>('');
  const [cityName, setCityName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const resolveAndStore = useCallback(
    (apiCity: string) => {
      const matched = matchCityToId(apiCity, cities);
      if (matched) {
        setCityId(matched.id);
        setCityName(matched.name);
        safeStorage.setItem(STORAGE_KEY, matched.name);
      }
    },
    [cities]
  );

  useEffect(() => {
    if (!cities.length) {
      if (!citiesQuery.isLoading) {
        queueMicrotask(() => setIsLoading(false));
      }
      return;
    }

    const cached = safeStorage.getItem(STORAGE_KEY);
    if (cached?.trim()) {
      const normalized = normalizeForMatch(cached);
      const found = cities.find((c) => {
        const name = (c.name ?? '').toString();
        const slug = (c.slug ?? '').toString();
        return (
          normalizeForMatch(name) === normalized ||
          normalized.includes(normalizeForMatch(name)) ||
          normalizeForMatch(slug) === normalized ||
          normalized.includes(normalizeForMatch(slug))
        );
      });
      if (found) {
        queueMicrotask(() => {
          setCityId(found.id);
          setCityName(found.name ?? found.slug ?? '');
          setIsLoading(false);
        });
        return;
      }
    }

    if (!hasUserCityConsent()) {
      queueMicrotask(() => setIsLoading(false));
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    fetch('https://ipapi.co/json/?fields=city', {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data: { city?: string }) => {
        if (cancelled) return;
        const apiCity = data?.city;
        if (apiCity) resolveAndStore(apiCity);
      })
      .catch(() => {
        if (cancelled) return;
        try {
          fetch('http://ip-api.com/json/?fields=city', {
            signal: controller.signal,
          })
            .then((r) => r.json())
            .then((data: { city?: string }) => {
              if (cancelled) return;
              if (data?.city) resolveAndStore(data.city);
            })
            .catch(() => {})
            .finally(() => {
              if (!cancelled) setIsLoading(false);
            });
        } catch {
          if (!cancelled) setIsLoading(false);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [cities, citiesQuery.isLoading, resolveAndStore]);

  const citySlug = useMemo(() => {
    if (!cityId) return '';
    const c = cities.find((x) => x.id === cityId || x.slug === cityId);
    return (c?.slug ?? cityId) as string;
  }, [cityId, cities]);

  return { cityId, citySlug, cityName, isLoading };
}
