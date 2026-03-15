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
import { useCitiesListQuery } from '@/features/cities/citiesApi';
import { useIsDark } from '@/hooks/useIsDark';
import { useUserCity, USER_CITY_STORAGE_KEY } from '@/hooks/useUserCity';
import { safeStorage } from '@/utils/safeStorage';
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
    { value: stats.verified, labelKey: 'statVerified' as const, icon: <Users size={18} />, colorClass: 'text-primary' },
    { value: stats.projects, labelKey: 'statProjects' as const, icon: <CheckCircle size={18} />, colorClass: 'text-sky-600 dark:text-sky-400' },
    { value: stats.rating, labelKey: 'statRating' as const, icon: <Star size={18} />, colorClass: 'text-sky-600 dark:text-sky-400' },
    { value: stats.support, labelKey: 'statSupport' as const, icon: <Clock size={18} />, colorClass: 'text-emerald-600 dark:text-emerald-400' },
  ];

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
                <span className={cn(
                  'font-bold',
                  isDark ? 'text-[#E97525]' : 'text-primary'
                )}>
                  {t('home.heroTitleLine2Masters')}
                </span>
                <br />
                <span className="text-slate-900 dark:text-white font-medium">
                  {t('home.heroTitleLine2From')}{' '}
                </span>
                <span className="relative inline-block">
                  <span className={cn(
                    'font-bold',
                    isDark ? 'text-[#E97525]' : 'text-primary'
                  )}>
                    Moldova
                  </span>
                  <svg className="absolute -bottom-0.5 left-0 w-full" height="4" viewBox="0 0 200 4" fill="none">
                    <path d="M0 3 Q50 0 100 2.5 Q150 4 200 1.5" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" className={isDark ? 'text-[#E97525]' : 'text-primary'} />
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

            <div className="h-px shrink-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" aria-hidden />

            {/* Search */}
            <form onSubmit={handleSearch}>
              <div
                className={cn(
                  'flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl backdrop-blur-md border transition-all duration-500 focus-within:shadow-[0_0_30px_hsl(var(--primary)/0.15)]',
                  isDark
                    ? 'bg-white/[0.06] border border-white/10 shadow-lg shadow-black/20'
                    : 'bg-white/90 border border-gray-200 shadow-md shadow-black/5'
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
                    'flex items-center gap-2 px-3 border-t sm:border-t-0 sm:border-l min-h-[44px] min-w-0 flex-1 sm:flex-initial sm:min-w-[160px]',
                    isDark ? 'border-white/10 sm:border-l' : 'border-black/8 sm:border-l'
                  )}
                >
                  <MapPin size={16} className="text-muted-foreground shrink-0" />
                  <Select
                    value={effectiveCityId || 'all'}
                    onValueChange={(v) => {
                    const id = v === 'all' ? '' : v;
                    setCityId(id);
                    if (id) {
                      const city = cities.find((c) => c.id === id);
                      const name = city?.name ?? city?.slug ?? '';
                      if (name) {
                        safeStorage.setItem(USER_CITY_STORAGE_KEY, name);
                      }
                    } else {
                      safeStorage.removeItem(USER_CITY_STORAGE_KEY);
                    }
                  }}
                  >
                    <SelectTrigger
                      className={cn(
                        'flex-1 min-w-0 w-full border-0 bg-transparent shadow-none focus:ring-0',
                        'h-auto py-2 text-sm font-medium [&>span]:truncate [&>span]:max-w-full'
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
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 bg-[hsl(var(--button-bg))] text-white hover:bg-[hsl(var(--button-bg-hover))]"
                >
                  {t('home.searchButton')} <ChevronRight size={16} />
                </Button>
              </div>
            </form>

            <div className="h-px shrink-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" aria-hidden />

            {/* Category pills - Categorii populare */}
            <div
              className={cn(
                'rounded-xl p-4 transition-all duration-500',
                isDark ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-white/40 border border-gray-200/60'
              )}
            >
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
                        'hover:text-primary',
                        isDark
                          ? 'bg-white/[0.04] border border-white/8 hover:bg-primary/10 hover:border-primary/30'
                          : 'bg-secondary/80 border border-border hover:bg-primary/10 hover:border-primary/30',
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

            {/* Trust badges */}
            <div
              className={cn(
                'flex flex-wrap items-center gap-0 rounded-xl px-4 py-3 transition-all duration-500',
                isDark ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-white/50 border border-gray-200/60'
              )}
            >
              {badges.map((b, idx) => (
                <div key={b.textKey} className="flex items-center shrink-0">
                  {idx > 0 && (
                    <div
                      className="w-px h-5 mx-3 shrink-0"
                      style={{
                        background: isDark
                          ? 'linear-gradient(to bottom, transparent, rgba(233,117,37,0.4), transparent)'
                          : 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.12), transparent)',
                      }}
                    />
                  )}
                  <div
                    className={cn(
                      'flex items-center gap-2 py-1.5 px-2 rounded-lg transition-colors',
                      'text-xs font-medium',
                      isDark ? 'text-white/80' : 'text-slate-600'
                    )}
                  >
                    <span className={isDark ? 'text-[#E97525]' : 'text-primary'}>{b.icon}</span>
                    {t(`home.${b.textKey}`)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="relative flex items-center justify-center order-first lg:order-none mt-6 sm:mt-8 lg:mt-16">
            <div
              className="absolute inset-0 rounded-2xl sm:rounded-[2rem] lg:rounded-[3rem] blur-2xl sm:blur-3xl transition-all duration-500"
              style={{
                background: isDark
                  ? 'radial-gradient(ellipse, hsl(var(--primary)/0.08), transparent 70%)'
                  : 'radial-gradient(ellipse, hsl(var(--primary)/0.06), transparent 70%)',
              }}
            />

            <div className="relative w-full max-w-[340px] sm:max-w-[400px] md:max-w-[480px] lg:max-w-lg">
              {/* Main card */}
              <div
                className={cn(
                  'relative rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] border overflow-hidden transition-all duration-500',
                  isDark
                    ? 'bg-[#1a1a1a] border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.4)] sm:shadow-[0_20px_60px_rgba(0,0,0,0.5)]'
                    : 'bg-card border-gray-200 shadow-lg shadow-black/5'
                )}
              >
                {/* Card top bar */}
                <div className="flex items-center justify-between px-3 sm:px-4 md:px-5 py-2 sm:py-3 transition-all duration-500">
                  <div className="flex gap-1 sm:gap-1.5">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500" />
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-green-500" />
                  </div>
                  <div
                    className={cn(
                      'flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs transition-all duration-500',
                      isDark ? 'bg-white/5 text-white/40' : 'bg-primary/10 text-foreground/80'
                    )}
                  >
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="truncate max-w-[100px] sm:max-w-none">{t('home.heroSpecialistsAvailable')}</span>
                  </div>
                  <div className={cn('text-[10px] sm:text-xs shrink-0', 'text-muted-foreground')}>
                    master-hub.md
                  </div>
                </div>

                {/* Image area */}
                <div
                  className={cn(
                    'relative h-48 sm:h-64 md:h-72 lg:h-80 xl:h-[22rem] transition-all duration-500',
                    isDark ? 'bg-[#1a1a1a]' : 'bg-muted/50'
                  )}
                >
                  <OptimizedImage
                    basePath={isDark ? '/images/hero-masters-dark' : '/images/hero-masters'}
                    alt=""
                    className="w-full h-full object-contain object-bottom transition-opacity duration-500"
                    loading="eager"
                    draggable={false}
                  />
                  <div
                    className="absolute inset-0 transition-all duration-500"
                    style={{
                      background: isDark
                        ? 'linear-gradient(to top, #1a1a1a 10%, transparent 60%)'
                        : 'linear-gradient(to top, rgba(248,250,252,0.6) 0%, transparent 40%)',
                    }}
                  />
                  {/* Floating badge */}
                  <div
                    className={cn(
                      'absolute top-2 right-2 sm:top-3 sm:right-3 lg:top-4 lg:right-4 flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl backdrop-blur-md transition-all duration-500',
                      isDark ? 'bg-[#1a1a1a]/90' : 'bg-card/90'
                    )}
                  >
                    <div className="flex -space-x-0.5 sm:-space-x-1">
                      {['bg-blue-400', 'bg-green-400', 'bg-sky-400'].map((c, i) => (
                        <div
                          key={i}
                          className={cn(`w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 rounded-full ${c}`)}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] sm:text-xs text-foreground">
                      +{landingStats?.verifiedOnlineMastersCount ?? 120} activi
                    </span>
                  </div>
                </div>

              </div>

              {/* Floating stat cards — visible from md */}
              <div
                className={cn(
                  'absolute -left-2 sm:-left-4 lg:-left-8 top-12 sm:top-16 px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl shadow-xl hidden md:block transition-all duration-500',
                  isDark ? 'bg-[#1a1a1a] border border-white/[0.06] shadow-lg shadow-black/30' : 'bg-white/95 shadow-md shadow-black/5'
                )}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center text-primary bg-primary/12 shrink-0">
                    <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-semibold text-foreground truncate">{t('home.heroVerified100')}</p>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground line-clamp-1">{t('home.heroVerifiedDesc')}</p>
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  'absolute -right-2 sm:-right-4 lg:-right-6 bottom-4 sm:bottom-6 px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl shadow-xl hidden md:block transition-all duration-500',
                  isDark ? 'bg-[#1a1a1a] border border-white/[0.06] shadow-lg shadow-black/30' : 'bg-white/95 shadow-md shadow-black/5'
                )}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center text-sky-500 bg-sky-500/12 shrink-0">
                    <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-semibold text-foreground truncate">{t('home.heroResponseTime')}</p>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground line-clamp-1">{t('home.heroResponseDesc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-10 sm:mt-14 md:mt-16 flex justify-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
            {statCards.map((stat) => (
            <div
              key={stat.labelKey}
              className={cn(
                'relative group px-6 py-5 rounded-2xl transition-all duration-300 overflow-hidden',
                isDark
                  ? 'bg-white/[0.06] shadow-lg shadow-black/20'
                  : 'bg-white/95 shadow-md shadow-black/5'
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
              className="text-primary text-sm hover:text-primary/80 transition-colors underline underline-offset-4 decoration-primary/30"
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
