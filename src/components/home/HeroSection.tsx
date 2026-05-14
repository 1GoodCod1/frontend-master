import { useMemo, useState, useCallback } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, ArrowRight, ChevronRight, Star, Clock, CheckCircle } from 'lucide-react';
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
import { HeroTrustBadges } from './hero/HeroTrustBadges';

type StatKey = 'verified' | 'projects' | 'rating' | 'support';
interface FloatingStatPos {
  valueKey: StatKey;
  labelKey: 'statVerified' | 'statProjects' | 'statRating' | 'statSupport';
  icon: React.ReactNode;
  color: string;
  // position around the hero
  className: string;
  rotate: string;
}
const FLOATING_STATS: FloatingStatPos[] = [
  {
    valueKey: 'verified',
    labelKey: 'statVerified',
    icon: <Users size={18} />,
    color: 'text-primary',
    className: 'left-[14%] top-[18%]',
    rotate: '-rotate-[4deg]',
  },
  {
    valueKey: 'projects',
    labelKey: 'statProjects',
    icon: <CheckCircle size={18} />,
    color: 'text-sky-600 dark:text-sky-400',
    className: 'left-[16%] top-[66%]',
    rotate: 'rotate-[3deg]',
  },
  {
    valueKey: 'rating',
    labelKey: 'statRating',
    icon: <Star size={18} />,
    color: 'text-amber-500 dark:text-amber-400',
    className: 'right-[14%] top-[24%]',
    rotate: 'rotate-[4deg]',
  },
  {
    valueKey: 'support',
    labelKey: 'statSupport',
    icon: <Clock size={18} />,
    color: 'text-emerald-600 dark:text-emerald-400',
    className: 'right-[16%] top-[62%]',
    rotate: '-rotate-[3deg]',
  },
];

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
    pollingInterval: publicCachePolicy.mastersFiltersPollingInterval,
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
    <section className="relative overflow-hidden">
      {/* Floating stats — desktop only */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none z-0" aria-hidden="false">
        {FLOATING_STATS.map((s, i) => (
          <div
            key={s.labelKey}
            className={cn(
              'absolute pointer-events-auto px-3.5 py-2.5 rounded-xl backdrop-blur-[2px] transition duration-500 animate-fade-in',
              s.className,
              s.rotate,
              'hover:rotate-0 hover:scale-110',
              isDark
                ? 'bg-white/[0.025] ring-1 ring-white/[0.05]'
                : 'bg-white/40 ring-1 ring-gray-200/40',
            )}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center gap-2.5">
              <div className={cn('opacity-80 shrink-0', s.color)}>{s.icon}</div>
              <div className="min-w-0">
                <div className={cn('text-2xl font-extrabold tabular-nums leading-none', s.color)}>
                  {stats[s.valueKey]}
                </div>
                <div className="text-[10px] mt-1.5 text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  {t(`home.${s.labelKey}`)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-10 sm:pb-12 flex flex-col items-center text-center">
        {/* Live badge */}
        <div
          className={cn(
            'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-sm border transition duration-500',
            isDark
              ? 'bg-[#E97525]/12 border-[#E97525]/25'
              : 'bg-primary/10 border-primary/20',
          )}
        >
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full animate-pulse',
              isDark ? 'bg-[#E97525]' : 'bg-primary',
            )}
          />
          <span
            className={cn(
              'text-[11px] font-semibold tracking-[0.18em] uppercase',
              isDark ? 'text-[#E97525]' : 'text-primary',
            )}
          >
            {t('home.heroPlatformBadge')}
          </span>
        </div>

        {/* Title */}
        <h1 className="mt-6 text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.05] text-slate-900 dark:text-white max-w-3xl">
          {t('home.heroTitleLine1')}{' '}
          <span className={cn(isDark ? 'text-[#E97525]' : 'text-primary')}>
            {t('home.heroTitleLine2Masters')}
          </span>
          <br />
          <span className="text-slate-700 dark:text-white/80 font-medium text-2xl sm:text-3xl md:text-4xl">
            {t('home.heroTitleLine2From')}
          </span>
          <span className="relative inline-block ml-1">
            <span className={cn('font-bold', isDark ? 'text-[#E97525]' : 'text-primary')}>
              Moldova
            </span>
            <svg
              className="absolute -bottom-0.5 left-0 w-full"
              height="5"
              viewBox="0 0 200 5"
              fill="none"
              aria-hidden
            >
              <path
                d="M0 3.5 Q50 0 100 3 Q150 5 200 2"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                opacity="0.55"
                className={isDark ? 'text-[#E97525]' : 'text-primary'}
              />
            </svg>
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-white/55 max-w-2xl leading-relaxed">
          {t('home.subtitle')}
        </p>

        {/* Search */}
        <div className="w-full max-w-3xl mt-8 sm:mt-10">
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

        {/* Category pills */}
        <div className="w-full max-w-3xl mt-5">
          <HeroCategoryPills
            categories={heroCategories}
            effectiveCityId={effectiveCityId}
            getCitySlugForUrl={getCitySlugForUrl}
            isDark={isDark}
          />
        </div>

        {/* CTA */}
        <div className="flex items-center flex-wrap justify-center gap-3 mt-8">
          <Button
            asChild
            className="group flex items-center gap-2.5 px-6 py-3 rounded-2xl font-semibold hover:scale-[1.03] active:scale-100 transition duration-200"
          >
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
                'flex items-center gap-2.5 px-6 py-3 rounded-2xl border transition duration-200',
                isDark
                  ? 'bg-white/[0.04] border-white/10 text-white/70 hover:bg-white/8'
                  : 'bg-secondary/80 border-border text-foreground/70 hover:bg-muted',
              )}
            >
              <RouterLink to="/plans">
                <ChevronRight size={17} />
                {t('home.viewPlans')}
              </RouterLink>
            </Button>
          )}
        </div>

        {/* Trust badges */}
        <div className="mt-8">
          <HeroTrustBadges isDark={isDark} />
        </div>
      </div>

      {/* Mobile/tablet compact stats — replaces the floating layout below lg */}
      <div className="lg:hidden max-w-3xl mx-auto px-4 sm:px-6 pb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {FLOATING_STATS.map((s) => (
            <div
              key={s.labelKey}
              className={cn(
                'flex items-center gap-2 px-3 py-2.5 rounded-xl border',
                isDark ? 'bg-white/[0.04] border-white/[0.07]' : 'bg-white/90 border-gray-200/70',
              )}
            >
              <div className={cn('opacity-70 shrink-0', s.color)}>{s.icon}</div>
              <div className="min-w-0">
                <div className={cn('text-base font-bold tabular-nums leading-none', s.color)}>
                  {stats[s.valueKey]}
                </div>
                <div className="text-[9px] mt-1 text-muted-foreground uppercase tracking-wider truncate">
                  {t(`home.${s.labelKey}`)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!isAuthed && (
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pb-8">
          <div className="flex items-center justify-center gap-6">
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
        </div>
      )}

      {/* Hero / content separator */}
      <div
        className={cn(
          'max-w-7xl mx-auto px-4 sm:px-6',
          isAuthed ? 'pb-6 sm:pb-8' : 'pb-2',
        )}
        aria-hidden
      >
        <div
          className={cn(
            'h-px w-full',
            isDark
              ? 'bg-gradient-to-r from-transparent via-white/10 to-transparent'
              : 'bg-gradient-to-r from-transparent via-black/10 to-transparent',
          )}
        />
      </div>
    </section>
  );
};
