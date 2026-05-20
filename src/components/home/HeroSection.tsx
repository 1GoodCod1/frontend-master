import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMastersLandingStatsQuery, useMastersFiltersQuery } from '@/features/masters/mastersApi';
import { publicCachePolicy } from '@/config/publicCache';
import { useIsDark } from '@/hooks/useIsDark';
import { useUserCity } from '@/hooks/useUserCity';
import { USER_CITY_STORAGE_KEY } from '@/hooks/constants';
import { safeStorage } from '@/utils/safeStorage';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { cn } from '@/lib/utils';
import type { SearchSuggestionEvent } from '@/features/masters/components/search/SearchInputWithHistory';

import { HeroSearchForm } from './hero/HeroSearchForm';
import { HeroInlineStats } from './hero/HeroInlineStats';
import { HeroPhoneMockup } from './hero/HeroPhoneMockup';
import { HeroPathActions } from './hero/HeroPathActions';
import { HeroTrustBadges } from './hero/HeroTrustBadges';

interface HeroSectionProps {
  isAuthed: boolean;
  role: string | null;
}

function formatCount(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return k >= 10 ? `${Math.round(k)}K+` : `${k.toFixed(k >= 100 ? 0 : 1).replace(/\.0$/, '')}K+`;
  }
  return `${n.toLocaleString('ro-MD')}+`;
}

export const HeroSection = ({ isAuthed, role }: HeroSectionProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isDark = useIsDark();
  const { data: landingStats } = useMastersLandingStatsQuery();
  const { data: filtersData } = useMastersFiltersQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: publicCachePolicy.mastersFiltersRefetchOnFocus,
    pollingInterval: publicCachePolicy.mastersFiltersPollingInterval,
  });
  const cities = useMemo(() => filtersData?.cities ?? [], [filtersData?.cities]);
  const { cityId: detectedCityId } = useUserCity();
  const { add: addSearchHistory } = useSearchHistory();

  const [searchQuery, setSearchQuery] = useState('');
  const [cityId, setCityId] = useState<string | undefined>(undefined);
  const effectiveCityId = cityId === undefined ? detectedCityId : cityId;

  const getCityLabel = (c: { id: string; name: string; slug: string }) =>
    t(`cities.${c.slug}`, { defaultValue: c.name }) || c.name;
  const getCitySlugForUrl = useCallback(
    (cityIdOrSlug: string) =>
      cities.find((c) => c.id === cityIdOrSlug || c.slug === cityIdOrSlug)?.slug ?? cityIdOrSlug,
    [cities],
  );

  const stats = useMemo(() => {
    if (!landingStats) {
      return { verified: '0+', projects: '0+', rating: '4.9' };
    }
    const { verifiedMastersCount, completedProjectsCount, averageRating } = landingStats;
    const projectsStr =
      completedProjectsCount != null && completedProjectsCount >= 1000
        ? `${(completedProjectsCount / 1000).toFixed(completedProjectsCount >= 10000 ? 0 : 1).replace(/\.0$/, '')}K+`
        : `${completedProjectsCount ?? 0}+`;
    const ratingStr =
      averageRating != null &&
      typeof averageRating === 'number' &&
      !Number.isNaN(averageRating)
        ? averageRating.toFixed(1)
        : '4.9';
    const verifiedStr = formatCount(verifiedMastersCount ?? 0);
    return {
      verified: verifiedStr,
      projects: projectsStr,
      rating: ratingStr,
    };
  }, [landingStats]);

  const handleSearch = (e: React.SubmitEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
      addSearchHistory(searchQuery.trim());
    }
    if (effectiveCityId) params.set('city', getCitySlugForUrl(effectiveCityId));
    navigate(`/masters${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const handleSuggestionSelect = useCallback(
    (event: SearchSuggestionEvent) => {
      const params = new URLSearchParams();
      if (effectiveCityId) params.set('city', getCitySlugForUrl(effectiveCityId));

      if (event.type === 'category' && event.category) {
        params.set('category', event.category.slug);
      } else if (event.type === 'master' && event.master) {
        navigate(`/masters/${event.master.slug}`);
        return;
      } else if (event.type === 'service' && event.service) {
        params.set('q', event.service.title);
        addSearchHistory(event.service.title);
        if (event.service.categorySlug) {
          params.set('category', event.service.categorySlug);
        }
      } else {
        params.set('q', event.value);
        addSearchHistory(event.value);
      }

      navigate(`/masters${params.toString() ? `?${params.toString()}` : ''}`);
    },
    [effectiveCityId, getCitySlugForUrl, navigate, addSearchHistory],
  );

  const handleCityChange = (v: string) => {
    const id = v === 'all' ? '' : v;
    setCityId(id);
    if (id) {
      const city = cities.find((c) => c.id === id);
      const name = city?.name ?? city?.slug ?? '';
      if (name) safeStorage.setItem(USER_CITY_STORAGE_KEY, name);
    } else {
      safeStorage.removeItem(USER_CITY_STORAGE_KEY);
    }
  };

  return (
    <section className="relative overflow-hidden">
      <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-8 pt-8 sm:pt-12 pb-10 sm:pb-14">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          <div className="text-left min-w-0">
            <div
              className={cn(
                'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition duration-500',
                isDark
                  ? 'bg-[#E97525]/12 border-[#E97525]/25'
                  : 'bg-[#E97525]/10 border-[#E97525]/20',
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#E97525] animate-pulse" />
              <span
                className={cn(
                  'text-[11px] font-semibold tracking-[0.14em] uppercase',
                  isDark ? 'text-[#E97525]' : 'text-[#c45f1a]',
                )}
              >
                {t('home.heroLiveBadge')}
              </span>
            </div>

            <h1 className="mt-5 sm:mt-6 text-[clamp(2rem,5vw,3.25rem)] font-bold tracking-tight leading-[1.08] text-foreground">
              {t('home.heroTitleLine1')}
              <br />
              <span className="text-[#E97525]">{t('home.heroTitleLine2')}</span>
              <br />
              <span className="relative inline-block text-[#E97525]">
                {t('home.heroTitleLine3')}
                <svg
                  className="absolute -bottom-0.5 left-0 w-full h-[5px] pointer-events-none text-[#E97525]"
                  viewBox="0 0 120 5"
                  preserveAspectRatio="none"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M0 3.5 Q30 0.5 60 3 Q90 5.5 120 2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity="0.65"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-4 sm:mt-5 text-[15px] sm:text-base text-muted-foreground leading-relaxed max-w-xl">
              {t('home.subtitle')}
            </p>

            <div className="mt-5 sm:mt-6">
              <HeroPathActions isAuthed={isAuthed} role={role} isDark={isDark} />
            </div>

            <div className="mt-5 sm:mt-6">
              <HeroSearchForm
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                effectiveCityId={effectiveCityId}
                cities={cities}
                getCityLabel={getCityLabel}
                onCityChange={handleCityChange}
                onSubmit={handleSearch}
                onSuggestionSelect={handleSuggestionSelect}
                isDark={isDark}
              />
            </div>

            <div className="mt-5 sm:mt-6">
              <HeroInlineStats stats={stats} isDark={isDark} />
            </div>

            <div className="mt-4 sm:mt-5">
              <HeroTrustBadges isDark={isDark} />
            </div>
          </div>

          <div className="hidden md:block">
            <HeroPhoneMockup isDark={isDark} />
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 pb-6" aria-hidden>
        <div
          className={cn(
            'h-px w-full',
            isDark
              ? 'bg-gradient-to-r from-transparent via-white/10 to-transparent'
              : 'bg-gradient-to-r from-transparent via-black/8 to-transparent',
          )}
        />
      </div>
    </section>
  );
};
