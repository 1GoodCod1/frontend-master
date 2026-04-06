import { useEffect, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/app/hooks';
import { useMastersPopularQuery } from '@/features/masters/mastersApi';
import { publicCachePolicy } from '@/config/publicCache';
import { selectIsAuthed } from '@/features/auth/selectors';
import { useIsDark } from '@/hooks/useIsDark';
import { SEOHead } from '@/components/seo/SEOHead';
import { HeroSection } from '@/components/home/HeroSection';
import { POPULAR_MASTERS_HOME_LIMIT } from '@/constants/home';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

const MastersGridSection = lazy(() =>
  import('@/components/home/MastersGridSection').then((m) => ({ default: m.MastersGridSection }))
);
const PopularCategoriesSection = lazy(() =>
  import('@/components/home/PopularCategoriesSection').then((m) => ({ default: m.PopularCategoriesSection }))
);
const HowItWorksSection = lazy(() =>
  import('@/components/home/HowItWorksSection').then((m) => ({ default: m.HowItWorksSection }))
);

// Prefetch MastersPage chunk on idle — most likely next navigation
const prefetchMasters = () => import('@/pages/public/MastersPage');

export default function HomePage() {
  const { t } = useTranslation();
  const isAuthed = useAppSelector(selectIsAuthed);
  const isDark = useIsDark();

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(prefetchMasters);
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(prefetchMasters, 2000);
    return () => clearTimeout(id);
  }, []);
  const popular = useMastersPopularQuery(
    { limit: POPULAR_MASTERS_HOME_LIMIT },
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: publicCachePolicy.mastersPopularRefetchOnFocus,
    },
  );

  const popularList = (popular.data ?? []).slice(0, POPULAR_MASTERS_HOME_LIMIT);

  return (
    <>
      <SEOHead
        description={t('home.subtitle')}
        keywords={t('home.seoKeywords')}
      />
      <Helmet>
        <link
          rel="preload"
          as="image"
          href="/images/hero-masters-universal.webp"
          type="image/webp"
          fetchPriority="high"
        />
      </Helmet>
      <div
        className="relative min-h-screen w-full animate-fade-in"
      >
      {/* Background effects - applied to entire HomePage */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3 transition duration-700"
          style={{
            background: isDark ? 'hsl(var(--primary)/0.04)' : 'hsl(var(--primary)/0.06)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[100px] -translate-x-1/4 translate-y-1/4 transition duration-700"
          style={{
            background: isDark ? 'rgba(79,195,247,0.03)' : 'rgba(79,195,247,0.06)',
          }}
        />
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            opacity: isDark ? 0.02 : 0.04,
            backgroundImage: `linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <section className="relative">
        <HeroSection isAuthed={isAuthed} />
      </section>

      <section className="relative min-w-0">
        <div className="container mx-auto min-w-0 max-w-7xl px-4 pt-4 pb-6 md:pt-6 md:pb-12">
          <div
            className={cn(
              'rounded-2xl border p-5 sm:p-6 md:p-8 mb-6 md:mb-8 transition-colors duration-500',
              isDark
                ? 'bg-white/[0.03] border-white/[0.08] shadow-none'
                : 'bg-[#F9FAFB] border-gray-200/80 shadow-sm',
            )}
          >
            <Suspense fallback={null}>
              <MastersGridSection
                title={t('home.popularMasters')}
                masters={popularList}
                isLoading={popular.isLoading}
                isError={popular.isError}
                error={popular.error}
                onRetry={popular.refetch}
                icon={Flame}
                horizontalScroll
                sectionBadge="popular"
              />
            </Suspense>

            <Suspense fallback={null}>
              <PopularCategoriesSection className="!mb-0" />
            </Suspense>
          </div>

          <Suspense fallback={null}>
            <HowItWorksSection />
          </Suspense>
        </div>
      </section>
    </div>
    </>
  );
}
