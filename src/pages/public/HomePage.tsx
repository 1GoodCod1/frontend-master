import { useEffect, Suspense, useState, useRef, useCallback, type ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { lazyWithRetry } from '@/utils/lazyWithRetry';
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
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
const JobsFlowSection = lazyWithRetry(() =>
  import('@/components/home/JobsFlowSection').then((m) => ({ default: m.JobsFlowSection })),
);
const RoadmapSection = lazyWithRetry(() =>
  import('@/components/home/RoadmapSection').then((m) => ({ default: m.RoadmapSection })),
);

// Prefetch MastersPage chunk on idle — most likely next navigation
const prefetchMasters = () => import('@/pages/public/MastersPage');

type Accent = 'violet' | 'orange' | 'cyan' | 'amber' | 'emerald';

const accentText: Record<Accent, string> = {
  violet: 'text-violet-600 dark:text-violet-400',
  orange: 'text-[#E97525] dark:text-[#E97525]',
  cyan: 'text-sky-600 dark:text-sky-400',
  amber: 'text-amber-600 dark:text-amber-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
};
const accentBg: Record<Accent, string> = {
  violet: 'bg-violet-500',
  orange: 'bg-[#E97525]',
  cyan: 'bg-sky-500',
  amber: 'bg-amber-500',
  emerald: 'bg-emerald-500',
};

interface SectionDef {
  id: string;
  index: string;
  label: string;
  accent: Accent;
}

interface FlowSectionProps {
  id: string;
  index: string;
  kicker: string;
  accent: Accent;
  trailing?: ReactNode;
  children: ReactNode;
  isDark: boolean;
}

function FlowSection({ id, index, kicker, accent, trailing, children, isDark }: FlowSectionProps) {
  return (
    <section id={id} className="relative scroll-mt-20 pt-10 md:pt-16 first:pt-2">
      {/* Slim marker strip — does NOT duplicate the inner section title */}
      <div className="flex items-center justify-between gap-3 mb-5 md:mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <span className={cn('inline-block w-1 h-6 rounded-full', accentBg[accent])} aria-hidden />
          <span
            className={cn(
              'font-mono text-[11px] tracking-[0.2em] uppercase px-1.5 py-0.5 rounded',
              isDark ? 'bg-white/[0.06] text-white/55' : 'bg-gray-100 text-gray-500',
            )}
          >
            {index}
          </span>
          <span
            className={cn(
              'text-[11px] font-semibold uppercase tracking-[0.18em] truncate',
              accentText[accent],
            )}
          >
            {kicker}
          </span>
        </div>
        {trailing ? <div className="shrink-0">{trailing}</div> : null}
      </div>

      {children}
    </section>
  );
}

interface SideNavProps {
  sections: SectionDef[];
  active: string;
  isDark: boolean;
  onSectionClick: (id: string) => void;
  onlineMasters?: number;
}

const NAV_OFFSET_TOP = 80; // navbar (3.5rem) + ~24px gap

function SideNav({ sections, active, isDark, onSectionClick }: SideNavProps) {
  const { t } = useTranslation();
  const asideRef = useRef<HTMLElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [geom, setGeom] = useState<{ left: number; width: number }>({ left: 0, width: 220 });
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const measure = () => {
      const el = asideRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setGeom({ left: rect.left, width: rect.width });
    };
    measure();
    window.addEventListener('resize', measure);

    const sentinel = sentinelRef.current;
    if (!sentinel) return () => window.removeEventListener('resize', measure);

    // IO watches the sentinel relative to the viewport (NOT scrollY of any element).
    // rootMargin shrinks the viewport top by NAV_OFFSET_TOP so the intersection edge
    // sits exactly where we want to pin.
    const io = new IntersectionObserver(
      ([entry]) => {
        // Pinned when sentinel has scrolled above the NAV_OFFSET_TOP line
        setPinned(entry.boundingClientRect.top < NAV_OFFSET_TOP);
      },
      {
        rootMargin: `-${NAV_OFFSET_TOP}px 0px 0px 0px`,
        threshold: [0, 1],
      },
    );
    io.observe(sentinel);

    return () => {
      window.removeEventListener('resize', measure);
      io.disconnect();
    };
  }, []);

  return (
    <aside ref={asideRef} className="hidden lg:block w-[220px] shrink-0 relative">
      <div
        ref={sentinelRef}
        aria-hidden
        style={{ position: 'absolute', top: 0, left: 0, width: 1, height: 1, pointerEvents: 'none' }}
      />
      <div
        style={
          pinned
            ? { position: 'fixed', top: NAV_OFFSET_TOP, left: geom.left, width: geom.width }
            : undefined
        }
      >
        <div
          className={cn(
            'text-[10px] font-mono uppercase tracking-[0.25em] mb-4 px-1',
            isDark ? 'text-white/35' : 'text-gray-400',
          )}
        >
          {t('home.onThisPage', { defaultValue: 'on this page' })}
        </div>
        <nav className="relative">
          <div
            className={cn(
              'absolute left-[7px] top-1 bottom-1 w-px',
              isDark ? 'bg-white/[0.07]' : 'bg-gray-200',
            )}
            aria-hidden
          />
          <ul className="space-y-0.5">
            {sections.map((s) => {
              const isActive = active === s.id;
              return (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onSectionClick(s.id);
                    }}
                    className={cn(
                      'group relative flex items-center gap-3 pl-5 pr-3 py-2 rounded-lg text-sm transition-colors',
                      isActive
                        ? isDark
                          ? 'text-white bg-white/[0.04]'
                          : 'text-slate-900 bg-gray-100/80'
                        : isDark
                          ? 'text-white/55 hover:text-white/85'
                          : 'text-gray-500 hover:text-gray-900',
                    )}
                  >
                    <span
                      className={cn(
                        'absolute left-[3px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ring-2 transition-all',
                        isActive ? accentBg[s.accent] : isDark ? 'bg-white/20' : 'bg-gray-300',
                        isDark ? 'ring-[#0a0a0a]' : 'ring-white',
                      )}
                      aria-hidden
                    />
                    <span
                      className={cn(
                        'font-mono text-[10px] tracking-wider opacity-70',
                        isActive && accentText[s.accent],
                      )}
                    >
                      {s.index}
                    </span>
                    <span className="truncate">{s.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

      </div>
    </aside>
  );
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
              <span className="font-mono text-[9px] opacity-60">{s.index}</span>
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
  const isDark = useIsDark();
  const [active, setActive] = useState<string>('flow');
  const mainRef = useRef<HTMLDivElement>(null);

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
    { id: 'flow', index: '01', label: t('home.jobsFlow.title', { defaultValue: 'Live jobs' }), accent: 'violet' },
    { id: 'masters', index: '02', label: t('home.popularMasters'), accent: 'orange' },
    { id: 'categories', index: '03', label: t('home.popularCategories.title'), accent: 'cyan' },
    { id: 'how', index: '04', label: t('home.howItWorks.title', { defaultValue: 'How it works' }), accent: 'amber' },
    { id: 'roadmap', index: '05', label: t('home.roadmap.title', { defaultValue: 'Roadmap' }), accent: 'emerald' },
  ];

  // Smooth-scroll to anchor — native scrollIntoView with explicit smooth behavior
  const handleSectionClick = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    // Temporarily force smooth scrolling — overrides CSS `scroll-behavior: auto` set globally
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = 'smooth';
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Restore CSS after animation completes
    window.setTimeout(() => {
      html.style.scrollBehavior = prev;
    }, 900);

    setActive(id);
    if (typeof history !== 'undefined') {
      history.replaceState(null, '', `#${id}`);
    }
  }, []);

  // Active-section tracking — scroll listener picks the section closest to the top of viewport
  useEffect(() => {
    const sectionIds = ['flow', 'masters', 'categories', 'how', 'roadmap'];
    const OFFSET = 120; // section is "active" once its top crosses this line below navbar

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
    // Listen on multiple potential scroll sources — page may scroll via window OR an inner overflow container
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
        {/* HERO */}
        <section className="relative">
          <HeroSection isAuthed={isAuthed} />
        </section>

        {/* Dashboard-style split */}
        <div className="container mx-auto max-w-[1400px] px-4 sm:px-6 pt-2 pb-20">
          <MobileSectionPills sections={sections} active={active} isDark={isDark} onSectionClick={handleSectionClick} />

          <div className="flex gap-10">
            <SideNav sections={sections} active={active} isDark={isDark} onSectionClick={handleSectionClick} />

            <div ref={mainRef} className="min-w-0 flex-1">
              {/* 01 — start with energy: live jobs flow */}
              <FlowSection
                id="flow"
                index="01"
                kicker={t('home.kickerLive', { defaultValue: 'Live · Jobs' })}
                accent="violet"
                isDark={isDark}
                trailing={
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border',
                      isDark
                        ? 'border-violet-400/30 text-violet-300 bg-violet-400/10'
                        : 'border-violet-300/60 text-violet-700 bg-violet-100/60',
                    )}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                    live
                  </span>
                }
              >
                <Suspense fallback={null}>
                  <JobsFlowSection />
                </Suspense>
              </FlowSection>

              {/* 02 — proof: who answers */}
              <FlowSection
                id="masters"
                index="02"
                kicker={t('home.kickerTrending', { defaultValue: 'Trending now' })}
                accent="orange"
                isDark={isDark}
                trailing={
                  <Button asChild variant="ghost" size="sm" className="group gap-1.5">
                    <RouterLink to="/masters">
                      {t('home.findMasters')}
                      <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                    </RouterLink>
                  </Button>
                }
              >
                <Suspense fallback={null}>
                  <MastersGridSection
                    title={t('home.popularMasters')}
                    subtitle={t('home.popularSubtitle', { defaultValue: '' })}
                    masters={popularList}
                    isLoading={popular.isLoading}
                    isError={popular.isError}
                    error={popular.error}
                    onRetry={popular.refetch}
                    horizontalScroll
                    sectionBadge="popular"
                  />
                </Suspense>
              </FlowSection>

              {/* 03 — discover by category */}
              <FlowSection
                id="categories"
                index="03"
                kicker={t('home.kickerDiscover', { defaultValue: 'Discover' })}
                accent="cyan"
                isDark={isDark}
              >
                <Suspense fallback={null}>
                  <PopularCategoriesSection className="!mb-0" />
                </Suspense>
              </FlowSection>

              {/* 04 — only after the visitor has seen the value: explain */}
              <FlowSection
                id="how"
                index="04"
                kicker={t('home.kickerLearn', { defaultValue: 'Learn' })}
                accent="amber"
                isDark={isDark}
              >
                <Suspense fallback={null}>
                  <HowItWorksSection />
                </Suspense>
              </FlowSection>

              {/* 05 — vision */}
              <FlowSection
                id="roadmap"
                index="05"
                kicker={t('home.kickerVision', { defaultValue: 'Vision · What’s next' })}
                accent="emerald"
                isDark={isDark}
              >
                <Suspense fallback={null}>
                  <RoadmapSection />
                </Suspense>
              </FlowSection>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
