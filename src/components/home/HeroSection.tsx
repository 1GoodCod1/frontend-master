import { useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  ChevronRight,
  Star,
  Shield,
  Clock,
  Users,
  CheckCircle,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { useMastersLandingStatsQuery } from '@/features/masters/mastersApi';
import { useCategoriesWithCountsQuery } from '@/features/categories/categoriesApi';
import { useMastersPopularQuery } from '@/features/masters/mastersApi';
import { useCitiesListQuery } from '@/features/cities/citiesApi';
import { useIsDark } from '@/hooks/useIsDark';
import { useUserCity, USER_CITY_STORAGE_KEY } from '@/hooks/useUserCity';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { SearchInputWithHistory } from '@/features/masters/components/search/SearchInputWithHistory';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import OptimizedImage from '@/components/common/OptimizedImage';
import { cn } from '@/lib/utils';
import type { CategoryDto } from '@/types';

interface HeroSectionProps {
  isAuthed: boolean;
}

const CATEGORY_EMOJI: Record<string, string> = {
  elektrika: '⚡',
  santehnika: '🔧',
  stroitelstvo: '🏗️',
  'otdelochnye-raboty': '🎨',
  mebel: '🪚',
  'uborka-klining': '✨',
  'remont-tehniki': '🔧',
  'remont-telefonov-pk': '📱',
};

export const HeroSection = ({ isAuthed }: HeroSectionProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isDark = useIsDark();
  const { data: landingStats } = useMastersLandingStatsQuery();
  const { data: categories = [] } = useCategoriesWithCountsQuery();
  const popular = useMastersPopularQuery({ limit: 5 });
  const { data: citiesFromDb = [] } = useCitiesListQuery({ isActive: true });
  const { cityId: detectedCityId } = useUserCity();
  const { add: addSearchHistory } = useSearchHistory();

  const [searchQuery, setSearchQuery] = useState('');
  const [cityId, setCityId] = useState<string | undefined>(undefined);
  const effectiveCityId = cityId === undefined ? detectedCityId : cityId;

  const cities = citiesFromDb;
  const getCityLabel = (c: { id: string; name: string; slug: string }) =>
    t(`cities.${c.slug}`, { defaultValue: c.name }) || c.name;
  const getCitySlugForUrl = (cityIdOrSlug: string) =>
    cities.find((c) => c.id === cityIdOrSlug || c.slug === cityIdOrSlug)?.slug ?? cityIdOrSlug;
  const popularMasters = (popular.data ?? []).slice(0, 3);
  const heroCategories = (categories as CategoryDto[]).slice(0, 6);

  const stats = useMemo(() => {
    if (!landingStats) {
      return {
        verified: '0+',
        projects: '0+',
        rating: '4.9',
        support: '24/7',
      };
    }
    const {
      verifiedMastersCount,
      completedProjectsCount,
      averageRating,
    } = landingStats;
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

  const badges = [
    { icon: <Shield size={14} />, textKey: 'heroTrustBadge1' as const },
    { icon: <Zap size={14} />, textKey: 'heroTrustBadge2' as const },
    { icon: <Star size={14} />, textKey: 'heroTrustBadge3' as const },
  ];

  const statCards = [
    { value: stats.verified, labelKey: 'statVerified' as const, icon: <Users size={18} />, colorClass: 'text-amber-600 dark:text-amber-400' },
    { value: stats.projects, labelKey: 'statProjects' as const, icon: <CheckCircle size={18} />, colorClass: 'text-sky-600 dark:text-sky-400' },
    { value: stats.rating, labelKey: 'statRating' as const, icon: <Star size={18} />, colorClass: 'text-amber-600 dark:text-amber-400' },
    { value: stats.support, labelKey: 'statSupport' as const, icon: <Clock size={18} />, colorClass: 'text-emerald-600 dark:text-emerald-400' },
  ];

  return (
    <section className="relative min-h-screen overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-6 sm:pb-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-6 sm:gap-8">
            {/* Badge */}
            <div
              className={cn(
                'inline-flex items-center gap-2 self-start px-4 py-2 rounded-full backdrop-blur-sm border transition-all duration-500',
                isDark
                  ? 'bg-amber-500/10 border-amber-500/20'
                  : 'bg-amber-500/12 border-amber-500/35'
              )}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-amber-600 dark:text-amber-400 text-xs font-medium tracking-wide uppercase">
                {t('home.heroPlatformBadge')}
              </span>
            </div>

            {/* Heading */}
            <div>
              <h1
                className={cn(
                  'leading-tight mb-4 transition-colors duration-500',
                  'text-3xl sm:text-4xl md:text-5xl font-extrabold',
                  'text-slate-900 dark:text-white'
                )}
              >
                {t('home.heroTitleLine1')}{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-300">
                    {t('home.heroTitleLine2Masters')}
                  </span>
                  <span className="absolute inset-0 blur-2xl bg-amber-500/20 -z-10" />
                </span>
                <br />
                <span className="text-slate-900 dark:text-white">
                  {t('home.heroTitleLine2From')}{' '}
                </span>
                <span className="relative">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500">
                    Moldova
                  </span>
                  <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 200 6" fill="none">
                    <path d="M0 5 Q50 1 100 4 Q150 7 200 3" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.6" className="text-amber-500" />
                  </svg>
                </span>
              </h1>
              <p
                className={cn(
                  'text-base sm:text-lg max-w-lg leading-relaxed transition-colors duration-500',
                  'text-slate-600 dark:text-white/50'
                )}
              >
                {t('home.subtitle')}
              </p>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch}>
              <div
                className={cn(
                  'flex flex-col sm:flex-row gap-2 sm:gap-3 p-2 rounded-2xl backdrop-blur-md border transition-all duration-500 focus-within:shadow-[0_0_30px_rgba(245,162,0,0.12)]',
                  isDark
                    ? 'bg-white/[0.04] border-white/10'
                    : 'bg-amber-50/70 border-amber-500/25'
                )}
              >
                <div className="flex items-center gap-3 flex-1 px-3 min-h-[44px] min-w-0">
                  <SearchInputWithHistory
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder={t('home.searchPlaceholder')}
                    variant="hero"
                    className="flex-1 min-w-0"
                  />
                </div>
                <div
                  className={cn(
                    'flex items-center gap-2 px-3 border-t sm:border-t-0 sm:border-l min-h-[44px] min-w-0',
                    isDark ? 'border-white/10 sm:border-l' : 'border-black/8 sm:border-l'
                  )}
                >
                  <MapPin size={16} className="text-muted-foreground shrink-0" />
                  <Select
                    value={effectiveCityId || 'all'}
                    onValueChange={(v) => {
                    const id = v === 'all' ? '' : v;
                    setCityId(id);
                    try {
                      if (id) {
                        const city = cities.find((c) => c.id === id);
                        const name = city?.name ?? city?.slug ?? '';
                        if (name) {
                          localStorage.setItem(USER_CITY_STORAGE_KEY, name);
                        }
                      } else {
                        localStorage.removeItem(USER_CITY_STORAGE_KEY);
                      }
                    } catch {
                      /* ignore */
                    }
                  }}
                  >
                    <SelectTrigger
                      className={cn(
                        'flex-1 min-w-0 sm:w-20 border-0 bg-transparent shadow-none focus:ring-0',
                        'h-auto py-2 text-sm font-medium'
                      )}
                    >
                      <SelectValue placeholder={t('home.locationPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('home.locationPlaceholder')}</SelectItem>
                      {cities.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {getCityLabel(c)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  size="sm"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 text-sm font-semibold whitespace-nowrap hover:shadow-[0_0_25px_rgba(245,162,0,0.5)] transition-all duration-200 dark:text-amber-950 dark:from-amber-400 dark:to-amber-500"
                >
                  {t('home.searchButton')} <ChevronRight size={16} />
                </Button>
              </div>
            </form>

            {/* Category pills - Categorii populare */}
            <div>
              <p
                className={cn(
                  'text-xs uppercase tracking-wider mb-3 transition-colors duration-500',
                  'text-muted-foreground'
                )}
              >
                {t('home.popularCategoriesHero')}
              </p>
              <div className="flex flex-wrap gap-2">
                {heroCategories.map((cat) => {
                  const emoji = CATEGORY_EMOJI[cat.slug] ?? '📋';
                  const translatedName = t(`categories.${cat.slug}`, { defaultValue: '' }) || cat.name;
                  return (
                    <RouterLink
                      key={cat.id}
                      to={`/masters?category=${cat.slug}${effectiveCityId ? `&city=${getCitySlugForUrl(effectiveCityId)}` : ''}`}
                      className={cn(
                        'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all duration-200',
                        'hover:text-amber-600 dark:hover:text-amber-400',
                        isDark
                          ? 'bg-white/[0.04] border border-white/8 hover:bg-amber-500/10 hover:border-amber-500/35'
                          : 'bg-amber-500/6 border border-amber-500/20 hover:bg-amber-500/10 hover:border-amber-500/35',
                        'text-foreground/80'
                      )}
                    >
                      <span>{emoji}</span>
                      {translatedName}
                    </RouterLink>
                  );
                })}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center flex-wrap gap-4">
              <Button asChild className="group flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 font-semibold hover:shadow-[0_0_40px_rgba(245,162,0,0.5)] hover:scale-105 active:scale-100 transition-all duration-200 dark:from-amber-400 dark:to-amber-500 dark:text-amber-950">
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
                      : 'bg-amber-500/6 border-amber-500/20 text-foreground/70 hover:bg-amber-500/10'
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
            <div className="flex flex-wrap gap-4">
              {badges.map((b) => (
                <div
                  key={b.textKey}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <span className="text-amber-500">{b.icon}</span>
                  {t(`home.${b.textKey}`)}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="relative flex items-center justify-center order-first lg:order-none">
            <div
              className="absolute inset-0 rounded-[3rem] blur-3xl transition-all duration-500"
              style={{
                background: isDark
                  ? 'radial-gradient(ellipse, rgba(245,162,0,0.08), transparent 70%)'
                  : 'radial-gradient(ellipse, rgba(245,162,0,0.12), transparent 70%)',
              }}
            />

            <div className="relative w-full max-w-lg">
              <div
                className={cn(
                  'absolute -inset-4 rounded-[3rem] border transition-all duration-500',
                  isDark ? 'border-amber-500/8' : 'border-amber-500/15'
                )}
              />
              <div
                className={cn(
                  'absolute -inset-8 rounded-[4rem] border transition-all duration-500',
                  isDark ? 'border-amber-500/4' : 'border-amber-500/8'
                )}
              />

              {/* Main card */}
              <div
                className={cn(
                  'relative rounded-[2.5rem] border overflow-hidden transition-all duration-500',
                  isDark
                    ? 'bg-black border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.8)]'
                    : 'bg-gradient-to-br from-amber-50/95 via-amber-50/90 to-amber-100/80 border-amber-500/30 shadow-[0_30px_80px_rgba(245,162,0,0.12)]'
                )}
              >
                {/* Card top bar */}
                <div
                  className={cn(
                    'flex items-center justify-between px-5 py-3 border-b transition-all duration-500',
                    isDark ? 'border-white/5' : 'border-black/6'
                  )}
                >
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  </div>
                  <div
                    className={cn(
                      'flex items-center gap-2 px-3 py-1 rounded-full text-xs transition-all duration-500',
                      isDark ? 'bg-white/5 text-white/40' : 'bg-amber-500/10 text-amber-900/70'
                    )}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {t('home.heroSpecialistsAvailable')}
                  </div>
                  <div className={cn('text-xs', 'text-muted-foreground')}>
                    master-hub.md
                  </div>
                </div>

                {/* Image area */}
                <div
                  className={cn(
                    'relative h-64 sm:h-72 transition-all duration-500',
                    isDark ? 'bg-black' : 'bg-amber-100/50'
                  )}
                >
                  <OptimizedImage
                    basePath={isDark ? '/images/hero-masters-dark' : '/images/hero-masters'}
                    alt=""
                    className="w-full h-full object-cover transition-opacity duration-500"
                    loading="eager"
                    draggable={false}
                  />
                  <div
                    className="absolute inset-0 transition-all duration-500"
                    style={{
                      background: isDark
                        ? 'linear-gradient(to top, #000000 10%, transparent 60%)'
                        : 'linear-gradient(to top, rgba(255,248,230,0.55) 0%, transparent 40%)',
                    }}
                  />
                  {/* Floating badge */}
                  <div
                    className={cn(
                      'absolute top-4 right-4 flex items-center gap-2 px-3 py-2 rounded-xl backdrop-blur-md border transition-all duration-500',
                      isDark
                        ? 'bg-black/80 border-white/10'
                        : 'bg-amber-50/85 border-amber-500/35'
                    )}
                  >
                    <div className="flex -space-x-1">
                      {['bg-blue-400', 'bg-green-400', 'bg-yellow-400'].map((c, i) => (
                        <div
                          key={i}
                          className={cn(`w-5 h-5 rounded-full ${c} border`, isDark ? 'border-black' : 'border-amber-50')}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-foreground">
                      +{landingStats?.verifiedOnlineMastersCount ?? 120} activi
                    </span>
                  </div>
                </div>

                {/* Card bottom */}
                <div className="px-5 pb-5 pt-3 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {popularMasters.length > 0
                      ? popularMasters.map((m) => {
                          const displayName =
                            `${m?.user?.firstName ?? ''} ${m?.user?.lastName ?? ''}`.trim() || 'Master';
                          const shortName =
                            displayName.split(' ')[0] +
                            (displayName.includes(' ') ? ' ' + (displayName.split(' ')[1]?.[0] ?? '') + '.' : '');
                          const catName = m.category?.name ?? t('home.findMasters');
                          const rating = (m.rating ?? m.avgRating ?? 4.9).toFixed(1);
                          return (
                            <RouterLink
                              key={m.id}
                              to={`/masters/${m.slug ?? m.id}`}
                              className={cn(
                                'p-2.5 rounded-xl border cursor-pointer transition-all duration-200',
                                'hover:border-amber-500/30',
                                isDark
                                  ? 'bg-white/[0.03] border-white/5'
                                  : 'bg-amber-50/50 border-amber-500/15'
                              )}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-lg">
                                  {CATEGORY_EMOJI[m.category?.slug ?? ''] ?? '🔧'}
                                </span>
                                <div className="flex items-center gap-0.5 text-amber-500">
                                  <Star size={9} fill="currentColor" />
                                  <span className="text-[10px] text-muted-foreground">{rating}</span>
                                </div>
                              </div>
                              <p className="text-xs font-medium truncate text-foreground">{shortName}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{catName}</p>
                            </RouterLink>
                          );
                        })
                      : [1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={cn(
                              'p-2.5 rounded-xl border',
                              isDark ? 'bg-white/[0.03] border-white/5' : 'bg-amber-50/50 border-amber-500/15'
                            )}
                          >
                            <div className="h-4 w-4 rounded bg-muted mb-2" />
                            <div className="h-3 w-8 bg-muted rounded mb-1" />
                            <div className="h-2.5 w-12 bg-muted rounded" />
                          </div>
                        ))}
                  </div>

                  <Button
                    asChild
                    variant="outline"
                    className={cn(
                      'w-full py-2.5 rounded-xl text-amber-600 dark:text-amber-400 text-sm transition-all duration-200 hover:bg-amber-500/15',
                      'border-amber-500/20 bg-amber-500/6'
                    )}
                  >
                    <RouterLink to="/masters">
                      {t('home.heroViewAllMasters')} →
                    </RouterLink>
                  </Button>
                </div>
              </div>

              {/* Floating stat cards */}
              <div
                className={cn(
                  'absolute -left-4 lg:-left-8 top-16 px-4 py-3 rounded-2xl backdrop-blur-xl border shadow-xl hidden lg:block transition-all duration-500',
                  isDark ? 'bg-black/90 border-white/10' : 'bg-amber-50/92 border-amber-500/35'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-amber-500 bg-amber-500/12">
                    <Shield size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{t('home.heroVerified100')}</p>
                    <p className="text-[10px] text-muted-foreground">{t('home.heroVerifiedDesc')}</p>
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  'absolute -right-4 lg:-right-6 bottom-24 px-4 py-3 rounded-2xl backdrop-blur-xl border shadow-xl hidden lg:block transition-all duration-500',
                  isDark ? 'bg-black/90 border-white/10' : 'bg-sky-50/92 border-sky-500/40'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sky-500 bg-sky-500/12">
                    <Zap size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{t('home.heroResponseTime')}</p>
                    <p className="text-[10px] text-muted-foreground">{t('home.heroResponseDesc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-4 sm:mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <div
              key={stat.labelKey}
              className={cn(
                'relative group px-6 py-5 rounded-2xl border transition-all duration-300 overflow-hidden',
                isDark
                  ? 'bg-white/[0.03] border-white/6'
                  : 'bg-amber-50/50 border-amber-500/15'
              )}
            >
              <div className="relative flex items-start gap-3">
                <div className={cn('mt-0.5 opacity-60', stat.colorClass)}>{stat.icon}</div>
                <div>
                  <div className={cn('text-2xl font-black tabular-nums', stat.colorClass)}>
                    {stat.value}
                  </div>
                  <div className="text-xs mt-0.5 text-muted-foreground">
                    {t(`home.${stat.labelKey}`)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom links - Autentificare master | Inregistrare */}
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
              className="text-amber-600 dark:text-amber-400 text-sm hover:text-amber-500 dark:hover:text-amber-300 transition-colors underline underline-offset-4 decoration-amber-500/30"
            >
              {t('home.masterLogin')}
            </RouterLink>
            <div
              className="w-1 h-1 rounded-full bg-muted-foreground/30"
            />
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
