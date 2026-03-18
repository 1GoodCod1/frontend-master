import { useEffect, useState, useCallback, useMemo } from 'react';
import { useCitiesListQuery } from '@/features/cities/citiesApi';
import type { CityDto } from '@/types';
import { safeStorage } from '@/utils/safeStorage';
import { hasUserCityConsent } from '@/features/cookie-consent/storage';
import {
  findNearestCityByCoords,
} from '@/utils/moldovaCityCoords';

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

function findCityBySlug(
  slug: string,
  cities: CityDto[]
): { id: string; name: string } | null {
  if (!slug?.trim() || !cities?.length) return null;
  const normalized = normalizeForMatch(slug);
  const found = cities.find(
    (c) =>
      normalizeForMatch((c.slug ?? '').toString()) === normalized ||
      normalizeForMatch((c.name ?? '').toString()) === normalized
  );
  if (!found) return null;
  return {
    id: found.id,
    name: (found.name ?? found.slug ?? '').toString(),
  };
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
  const [consentVersion, setConsentVersion] = useState(0);

  useEffect(() => {
    const handler = () => setConsentVersion((v) => v + 1);
    window.addEventListener('mh:cityConsentChanged', handler);
    return () => window.removeEventListener('mh:cityConsentChanged', handler);
  }, []);

  const resolveAndStore = useCallback(
    (apiCity: string, coords?: { lat: number; lon: number }) => {
      // Prefer coordinates: IP APIs often return wrong city name but correct lat/lng
      if (coords?.lat != null && coords?.lon != null) {
        const nearestSlug = findNearestCityByCoords(coords.lat, coords.lon);
        if (nearestSlug) {
          const byCoords = findCityBySlug(nearestSlug, cities);
          if (byCoords) {
            setCityId(byCoords.id);
            setCityName(byCoords.name);
            safeStorage.setItem(STORAGE_KEY, byCoords.name);
            return;
          }
        }
      }
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

    const tryIPFallback = (): Promise<void> => {
      if (cancelled) return Promise.resolve();
      return fetch(
        'https://ipapi.co/json/?fields=city,latitude,longitude',
        { signal: controller.signal }
      )
        .then((r) => r.json())
        .then(
          (data: {
            city?: string;
            latitude?: number;
            longitude?: number;
          }) => {
            if (cancelled) return;
            const apiCity = data?.city;
            const lat = data?.latitude;
            const lon = data?.longitude;
            if (apiCity || (lat != null && lon != null)) {
              resolveAndStore(
                apiCity ?? '',
                lat != null && lon != null ? { lat, lon } : undefined
              );
            }
          }
        )
        .catch(() => {
          if (cancelled) return;
          return fetch(
            'http://ip-api.com/json/?fields=city,lat,lon',
            { signal: controller.signal }
          )
            .then((r) => r.json())
            .then(
              (data: { city?: string; lat?: number; lon?: number }) => {
                if (cancelled) return;
                const apiCity = data?.city;
                const lat = data?.lat;
                const lon = data?.lon;
                if (apiCity || (lat != null && lon != null)) {
                  resolveAndStore(
                    apiCity ?? '',
                    lat != null && lon != null ? { lat, lon } : undefined
                  );
                }
              }
            )
            .catch(() => {});
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    };

    const attemptBrowserGeolocation = (): Promise<void> =>
      new Promise((resolve, reject) => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
          reject(new Error('Geolocation not supported'));
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (cancelled) return;
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            if (lat != null && lon != null && !Number.isNaN(lat) && !Number.isNaN(lon)) {
              resolveAndStore('', { lat, lon });
            }
            resolve();
          },
          () => reject(new Error('Geolocation denied or failed')),
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
        );
      });

    attemptBrowserGeolocation()
      .catch(() => tryIPFallback())
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [cities, citiesQuery.isLoading, resolveAndStore, consentVersion]);

  const citySlug = useMemo(() => {
    if (!cityId) return '';
    const c = cities.find((x) => x.id === cityId || x.slug === cityId);
    return (c?.slug ?? cityId) as string;
  }, [cityId, cities]);

  return { cityId, citySlug, cityName, isLoading };
}
