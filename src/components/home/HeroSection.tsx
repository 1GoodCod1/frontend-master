import { useMemo, useState, useCallback } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, ArrowRight, ChevronRight } from 'lucide-react';
import { useMastersLandingStatsQuery, useMastersFiltersQuery } from '@/features/masters/mastersApi';
import { publicCachePolicy } from '@/config/publicCache';
import { useIsDark } from '@/hooks/useIsDark';
import { useUserCity } from '@/hooks/useUserCity';
import { USER_CITY_STORAGE_KEY } from '@/hooks/constants';
import { safeStorage } from '@/utils/safeStorage';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SearchSuggestionEvent } from '@/features/masters/components/search/SearchInputWithHistory';

import { HeroSearchForm } from './hero/HeroSearchForm';
import { HeroCategoryPills } from './hero/HeroCategoryPills';
import { HeroStats } from './hero/HeroStats';
import { HeroTrustBadges } from './hero/HeroTrustBadges';
import { HeroImage } from './hero/HeroImage';

interface HeroSectionProps {
  isAuthed: boolean;
}

export const HeroSection = ({ isAuthed }: HeroSectionProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isDark = useIsDark();
  const { data: landingStats } = useMastersLandingStatsQuery();
  const { data: filtersData } = useMastersFiltersQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: publicCachePolicy.mastersFiltersRefetchOnFocus,
  });
  const categories = filtersData?.categories ?? [];
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
  const heroCategories = categories.slice(0, 6);

  const stats = useMemo(() => {
    if (!landingStats) {
      return { verified: '0+', projects: '0+', rating: '4.9', support: '24/7' };
    }
    const { verifiedMastersCount, completedProjectsCount, averageRating } = landingStats;
    const projectsStr =
      completedProjectsCount != null && completedProjectsCount >= 1000
        ? `${(completedProjectsCount / 1000).toFixed(completedProjectsCount >= 10000 ? 0 : 1)}K+`
        : `${completedProjectsCount ?? 0}+`;
    const ratingStr =
      averageRating != null &&
      typeof averageRating === 'number' &&
      !Number.isNaN(averageRating)
        ? averageRating.toFixed(1)
        : '4.9';
    return {
      verified: `${verifiedMastersCount ?? 0}+`,
      projects: projectsStr,
      rating: ratingStr,
      support: '24/7',
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
    <section className="relative min-h-screen overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-6 sm:pb-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* LEFT COLUMN */}
          <div className={cn(
            'flex flex-col gap-6 sm:gap-8 pl-4 sm:pl-6 border-l-4 rounded-r-lg',
            isDark ? 'border-[#E97525]/60' : 'border-primary/40'
          )}>
            {/* Badge */}
            <div
              className={cn(
                'inline-flex items-center gap-2 self-start px-4 py-2 rounded-full backdrop-blur-sm border transition-all duration-500',
                isDark
                  ? 'bg-[#E97525]/15 border-[#E97525]/30'
                  : 'bg-primary/12 border-primary/25'
              )}
            >
              <div className={cn('w-1.5 h-1.5 rounded-full animate-pulse', isDark ? 'bg-[#E97525]' : 'bg-primary')} />
              <span className={cn('text-xs font-medium tracking-wide uppercase', isDark ? 'text-[#E97525]' : 'text-primary')}>
                {t('home.heroPlatformBadge')}
              </span>
            </div>

            {/* Heading */}
            <div
              className={cn(
                'rounded-xl p-5 sm:p-6 transition-all duration-500',
                isDark ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-white/60 border border-gray-200/80 shadow-sm'
              )}
            >
              <h1
                className={cn(
                  'leading-[1.15] mb-4 transition-colors duration-500',
                  'text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight',
                  'text-slate-900 dark:text-white'
                )}
              >
                {t('home.heroTitleLine1')}{' '}
                <span className={cn('font-bold', isDark ? 'text-[#E97525]' : 'text-primary')}>
                  {t('home.heroTitleLine2Masters')}
                </span>
                <br />
                <span className="text-slate-900 dark:text-white font-medium">
                  {t('home.heroTitleLine2From')}{' '}
                </span>
                <span className="relative inline-block">
                  <span className={cn('font-bold', isDark ? 'text-[#E97525]' : 'text-primary')}>
                    Moldova
                  </span>
                  <svg className="absolute -bottom-0.5 left-0 w-full" height="4" viewBox="0 0 200 4" fill="none">
                    <path d="M0 3 Q50 0 100 2.5 Q150 4 200 1.5" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" className={isDark ? 'text-[#E97525]' : 'text-primary'} />
                  </svg>
                </span>
              </h1>
              <p className={cn('text-base sm:text-lg max-w-lg leading-relaxed transition-colors duration-500', 'text-slate-600 dark:text-white/50')}>
                {t('home.subtitle')}
              </p>
            </div>

            <div className="h-px shrink-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" aria-hidden />

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

            <div className="h-px shrink-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" aria-hidden />

            <HeroCategoryPills
              categories={heroCategories}
              effectiveCityId={effectiveCityId}
              getCitySlugForUrl={getCitySlugForUrl}
              isDark={isDark}
            />

            <div className="h-px shrink-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" aria-hidden />

            {/* CTA Buttons */}
            <div className="flex items-center flex-wrap gap-4">
              <Button asChild className="group flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-semibold hover:scale-105 active:scale-100 transition-all duration-200">
                <RouterLink to="/masters">
                  <Users size={17} />
                  {t('home.findMasters')}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </RouterLink>
              </Button>
              {!isAuthed && (
                <Button
                  asChild
                  variant="outline"
                  className={cn(
                    'flex items-center gap-2.5 px-7 py-3.5 rounded-2xl border transition-all duration-200',
                    isDark
                      ? 'bg-white/[0.04] border-white/10 text-white/70 hover:bg-white/8'
                      : 'bg-secondary/80 border-border text-foreground/70 hover:bg-muted'
                  )}
                >
                  <RouterLink to="/plans">
                    <ChevronRight size={17} />
                    {t('home.viewPlans')}
                  </RouterLink>
                </Button>
              )}
            </div>

            <HeroTrustBadges isDark={isDark} />
          </div>

          {/* RIGHT COLUMN */}
          <HeroImage isDark={isDark} onlineMastersCount={landingStats?.verifiedOnlineMastersCount} />
        </div>

        <HeroStats stats={stats} isDark={isDark} />

        {/* Bottom links */}
        {!isAuthed && (
          <div className="flex items-center justify-center gap-6 mt-6">
            <div
              className="h-px flex-1 max-w-24"
              style={{
                background: isDark
                  ? 'linear-gradient(to right, transparent, rgba(255,255,255,0.1))'
                  : 'linear-gradient(to right, transparent, rgba(0,0,0,0.1))',
              }}
            />
            <RouterLink
              to="/login"
              className="text-primary text-sm hover:text-primary/80 transition-colors underline underline-offset-4 decoration-primary/30"
            >
              {t('home.masterLogin')}
            </RouterLink>
            <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <RouterLink
              to="/register"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 decoration-muted-foreground/30 hover:decoration-foreground/30"
            >
              {t('nav.register')}
            </RouterLink>
            <div
              className="h-px flex-1 max-w-24"
              style={{
                background: isDark
                  ? 'linear-gradient(to left, transparent, rgba(255,255,255,0.1))'
                  : 'linear-gradient(to left, transparent, rgba(0,0,0,0.1))',
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
};
