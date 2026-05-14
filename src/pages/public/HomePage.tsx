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
import { ArrowRight, Sparkles } from 'lucide-react';
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
    <section id={id} className="relative scroll-mt-28 pt-10 md:pt-16 first:pt-2">
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

  // Smooth-scroll to anchor with navbar offset — rAF-based, works on whichever element actually scrolls
  const handleSectionClick = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const OFFSET = 80; // navbar (3.5rem) + gap

    // Detect the real scroll container (html / body / a parent with overflow-y)
    const scroller =
      (document.scrollingElement as HTMLElement | null) || document.documentElement;
    const startY = scroller.scrollTop;
    const targetY = el.getBoundingClientRect().top + startY - OFFSET;
    const distance = targetY - startY;
    if (Math.abs(distance) < 2) return;

    const duration = Math.min(900, 350 + Math.abs(distance) * 0.35);
    const startTime = performance.now();
    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      scroller.scrollTop = startY + distance * easeInOutCubic(progress);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);

    setActive(id);
    if (typeof history !== 'undefined') {
      history.replaceState(null, '', `#${id}`);
    }
  }, []);

  // Active-section tracking via IntersectionObserver
  useEffect(() => {
    const root = mainRef.current;
    if (!root) return;
    const targets = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        {/* Page-wide ambient backdrop */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          <div
            className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3"
            style={{ background: isDark ? 'hsl(var(--primary)/0.05)' : 'hsl(var(--primary)/0.07)' }}
          />
          <div
            className="absolute top-[60%] left-0 w-[500px] h-[500px] rounded-full blur-[100px] -translate-x-1/4"
            style={{ background: isDark ? 'rgba(139,92,246,0.05)' : 'rgba(139,92,246,0.06)' }}
          />
          <div
            className="absolute inset-0"
            style={{
              opacity: isDark ? 0.025 : 0.045,
              backgroundImage:
                'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
              maskImage: 'radial-gradient(ellipse at center, black 25%, transparent 75%)',
            }}
          />
        </div>

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

              {/* Final CTA — guests only */}
              {!isAuthed && (
                <div className="relative mt-20">
                  <div
                    className={cn(
                      'relative overflow-hidden rounded-3xl border p-8 md:p-12 text-center',
                      isDark
                        ? 'border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01]'
                        : 'border-gray-200/70 bg-gradient-to-br from-white to-gray-50',
                    )}
                  >
                    <div className="absolute inset-0 pointer-events-none" aria-hidden>
                      <div
                        className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[100px]"
                        style={{
                          background: isDark
                            ? 'hsl(var(--primary)/0.10)'
                            : 'hsl(var(--primary)/0.12)',
                        }}
                      />
                    </div>
                    <div className="relative">
                      <Sparkles size={28} className="mx-auto mb-3 text-primary dark:text-[#E97525]" />
                      <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {t('home.ctaReadyTitle', { defaultValue: 'Готовы начать?' })}
                      </h3>
                      <p className="mt-2 text-sm md:text-base text-slate-600 dark:text-white/60 max-w-xl mx-auto">
                        {t('home.subtitle')}
                      </p>
                      <div className="mt-6 flex items-center justify-center flex-wrap gap-3">
                        <Button asChild className="px-6 py-3 rounded-2xl font-semibold">
                          <RouterLink to="/register">
                            {t('nav.register')}
                            <ArrowRight size={16} className="ml-1.5" />
                          </RouterLink>
                        </Button>
                        <Button asChild variant="outline" className="px-6 py-3 rounded-2xl font-semibold">
                          <RouterLink to="/masters">{t('home.findMasters')}</RouterLink>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
