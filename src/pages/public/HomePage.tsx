import { useEffect, Suspense, useState, useCallback } from 'react';
import { lazyWithRetry } from '@/utils/lazyWithRetry';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/app/hooks';
import { useMastersPopularQuery } from '@/features/masters/mastersApi';
import { publicCachePolicy } from '@/config/publicCache';
import { selectIsAuthed, selectRole } from '@/features/auth/selectors';
import { USER_ROLE } from '@/constants/roles';
import { useIsDark } from '@/hooks/useIsDark';
import { SEOHead } from '@/components/seo/SEOHead';
import { HeroSection } from '@/components/home/HeroSection';
import { SectionHead } from '@/components/home/SectionHead';
import { HomeClosingCtaSection } from '@/components/home/HomeClosingCtaSection';
import { POPULAR_MASTERS_HOME_LIMIT, JOBS_SECTION_ACCENT } from '@/constants/home';
import { paths } from '@/constants/routes';
import { cn } from '@/lib/utils';

const MastersGridSection = lazyWithRetry(() =>
  import('@/components/home/MastersGridSection').then((m) => ({ default: m.MastersGridSection })),
);
const PopularCategoriesSection = lazyWithRetry(() =>
  import('@/components/home/PopularCategoriesSection').then((m) => ({ default: m.PopularCategoriesSection })),
);
const HowItWorksSection = lazyWithRetry(() =>
  import('@/components/home/HowItWorksSection').then((m) => ({ default: m.HowItWorksSection })),
);
const PopularCitiesSection = lazyWithRetry(() =>
  import('@/components/home/PopularCitiesSection').then((m) => ({ default: m.PopularCitiesSection })),
);
const ActiveJobsSection = lazyWithRetry(() =>
  import('@/components/home/ActiveJobsSection').then((m) => ({ default: m.ActiveJobsSection })),
);
const JobsFlowSection = lazyWithRetry(() =>
  import('@/components/home/JobsFlowSection').then((m) => ({ default: m.JobsFlowSection })),
);
const FAQSection = lazyWithRetry(() =>
  import('@/components/home/FAQSection').then((m) => ({ default: m.FAQSection })),
);
const CompaniiTeaserSection = lazyWithRetry(() =>
  import('@/components/home/CompaniiTeaserSection').then((m) => ({ default: m.CompaniiTeaserSection })),
);

const prefetchMasters = () => import('@/pages/public/MastersPage');

interface SectionDef {
  id: string;
  label: string;
}

interface MobileSectionPillsProps {
  sections: SectionDef[];
  active: string;
  isDark: boolean;
  onSectionClick: (id: string) => void;
}

function MobileSectionPills({ sections, active, isDark, onSectionClick }: MobileSectionPillsProps) {
  return (
    <div
      className={cn(
        'lg:hidden sticky top-14 z-30 -mx-4 px-4 py-2 border-b backdrop-blur',
        isDark ? 'bg-[#0a0a0a]/85 border-white/[0.06]' : 'bg-white/85 border-gray-200/70',
      )}
    >
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {sections.map((s) => {
          const isActive = active === s.id;
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={(e) => {
                e.preventDefault();
                onSectionClick(s.id);
              }}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition-colors',
                isActive
                  ? isDark
                    ? 'bg-white/[0.08] border-white/15 text-white'
                    : 'bg-gray-900 border-gray-900 text-white'
                  : isDark
                    ? 'border-white/[0.08] text-white/60'
                    : 'border-gray-200 text-gray-600',
              )}
            >
              {s.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { t } = useTranslation();
  const isAuthed = useAppSelector(selectIsAuthed);
  const role = useAppSelector(selectRole);
  const isDark = useIsDark();
  const [active, setActive] = useState<string>('categories');

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

  const sections: SectionDef[] = [
    { id: 'categories', label: t('home.popularCategories.title') },
    { id: 'jobs', label: t('home.activeJobs.shortTitle', { defaultValue: 'Jobs' }) },
    { id: 'masters', label: t('home.popularMasters') },
    { id: 'cities', label: t('home.popularCities.shortTitle', { defaultValue: 'Cities' }) },
    { id: 'companii', label: t('home.companii.shortTitle', { defaultValue: 'Companies' }) },
    { id: 'how', label: t('home.howItWorks.title', { defaultValue: 'How it works' }) },
  ];

  const handleSectionClick = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = 'smooth';
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => {
      html.style.scrollBehavior = prev;
    }, 900);

    setActive(id);
    if (typeof history !== 'undefined') {
      history.replaceState(null, '', `#${id}`);
    }
  }, []);

  useEffect(() => {
    const sectionIds = ['categories', 'jobs', 'masters', 'cities', 'companii', 'how'];
    const OFFSET = 120;

    let ticking = false;
    const update = () => {
      ticking = false;
      let currentId: string | null = null;
      for (const id of sectionIds) {
        const node = document.getElementById(id);
        if (!node) continue;
        const top = node.getBoundingClientRect().top;
        if (top <= OFFSET) currentId = id;
        else break;
      }
      setActive(currentId ?? sectionIds[0]);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('scroll', onScroll, { capture: true } as EventListenerOptions);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <>
      <SEOHead description={t('home.subtitle')} keywords={t('home.seoKeywords')} />
      <Helmet>
        <link
          rel="preload"
          as="image"
          href="/images/hero-masters-universal.webp"
          type="image/webp"
          fetchPriority="high"
        />
      </Helmet>

      <div className="relative min-h-screen w-full animate-fade-in">
        <section className="relative">
          <HeroSection isAuthed={isAuthed} role={role} />
        </section>

        <div className="container mx-auto max-w-[1280px] px-4 sm:px-8 pt-2 pb-20">
          <MobileSectionPills sections={sections} active={active} isDark={isDark} onSectionClick={handleSectionClick} />

          <div className="min-w-0">
            <section id="categories" className="relative scroll-mt-20 pt-10 md:pt-14">
              <Suspense fallback={null}>
                <PopularCategoriesSection />
              </Suspense>
            </section>

            <section id="jobs" className="relative scroll-mt-20 pt-10 md:pt-14">
              <Suspense fallback={null}>
                <ActiveJobsSection />
              </Suspense>
              <div className="mt-8 md:mt-10">
                <SectionHead
                  kicker={t('home.jobsFlow.badge')}
                  title={t('home.jobsFlow.title')}
                  accent={JOBS_SECTION_ACCENT}
                  link={{ label: t('home.jobsFlow.ctaLearn'), href: paths.howItWorks }}
                />
                <Suspense fallback={null}>
                  <JobsFlowSection
                    hideHeader
                    showPostJobCta={role !== USER_ROLE.MASTER}
                    isAuthed={isAuthed}
                    role={role}
                  />
                </Suspense>
              </div>
            </section>

            <section id="masters" className="relative scroll-mt-20 pt-10 md:pt-14">
              <SectionHead
                kicker={t('home.kickerTrending', { defaultValue: 'Trending' })}
                title={t('home.popularMasters')}
                accent="#E97525"
                link={{ label: t('home.findMasters'), href: paths.masters }}
              />
              <Suspense fallback={null}>
                <MastersGridSection
                  title=""
                  masters={popularList}
                  isLoading={popular.isLoading}
                  isError={popular.isError}
                  error={popular.error}
                  onRetry={popular.refetch}
                  horizontalScroll
                  sectionBadge="popular"
                  hideTitle
                />
              </Suspense>
            </section>

            <section id="cities" className="relative scroll-mt-20 pt-10 md:pt-14">
              <Suspense fallback={null}>
                <PopularCitiesSection />
              </Suspense>
            </section>

            <section id="companii" className="relative scroll-mt-20 pt-10 md:pt-14">
              <Suspense fallback={null}>
                <CompaniiTeaserSection />
              </Suspense>
            </section>

            <section id="how" className="relative scroll-mt-20 pt-10 md:pt-14">
              <SectionHead
                kicker={t('home.kickerLearn', { defaultValue: 'Learn' })}
                title={t('home.howItWorks.title')}
                accent="#EC4899"
                link={{ label: t('home.howItWorks.cta'), href: paths.howItWorks }}
              />
              <Suspense fallback={null}>
                <HowItWorksSection hideHeader isAuthed={isAuthed} role={role} />
              </Suspense>
            </section>

            {isAuthed && role === USER_ROLE.MASTER ? (
              <HomeClosingCtaSection />
            ) : null}

            <section id="faq" className="relative scroll-mt-20 pt-10 md:pt-14">
              <Suspense fallback={null}>
                <FAQSection />
              </Suspense>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
