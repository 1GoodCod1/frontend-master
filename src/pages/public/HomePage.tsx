import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/app/hooks';
import { useMastersPopularQuery } from '@/features/masters/mastersApi';
import { usePromotionsActiveQuery } from '@/features/promotions/promotionsApi';
import { selectIsAuthed } from '@/features/auth/selectors';
import { useIsDark } from '@/hooks/useIsDark';
import { HeroSection } from '@/components/home/HeroSection';
import { PopularCategoriesSection } from '@/components/home/PopularCategoriesSection';
import { MastersGridSection } from '@/components/home/MastersGridSection';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const { t } = useTranslation();
  const isAuthed = useAppSelector(selectIsAuthed);
  const isDark = useIsDark();
  const popular = useMastersPopularQuery({ limit: 5 });
  const { data: activePromotions = [] } = usePromotionsActiveQuery({ limit: 50 });

  const popularList = (popular.data ?? []).slice(0, 5);

  const promotionDiscountByMasterId = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of activePromotions) {
      const id = p.masterId ?? (p.master as { id?: string })?.id;
      if (id && typeof p.discount === 'number' && !map.has(id)) {
        map.set(id, p.discount);
      }
    }
    return map;
  }, [activePromotions]);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'relative min-h-screen w-full transition-colors duration-500',
        'bg-[#faf8f0] dark:bg-black'
      )}
    >
      {/* Background effects - applied to entire HomePage */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3 transition-all duration-700"
          style={{
            background: isDark ? 'rgba(245,162,0,0.04)' : 'rgba(245,162,0,0.1)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[100px] -translate-x-1/4 translate-y-1/4 transition-all duration-700"
          style={{
            background: isDark ? 'rgba(79,195,247,0.03)' : 'rgba(79,195,247,0.06)',
          }}
        />
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            opacity: isDark ? 0.02 : 0.05,
            backgroundImage: `linear-gradient(rgba(245,162,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(245,162,0,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <section className="relative">
        <HeroSection isAuthed={isAuthed} />
      </section>

      <section className="relative min-w-0">
        <div className="container mx-auto min-w-0 max-w-7xl px-4 pt-4 pb-6 md:pt-6 md:pb-12">
          <div className="border-b border-amber-500/15 dark:border-amber-500/10 mb-4 md:mb-6" />

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
            promotionDiscountByMasterId={promotionDiscountByMasterId}
          />

          <div className="border-b border-slate-200 dark:border-white/[0.08] my-6 md:my-8" />

          <PopularCategoriesSection />

          <div className="border-b border-slate-200 dark:border-white/[0.08] my-6 md:my-8" />

          <HowItWorksSection />
        </div>
      </section>
    </motion.main>
  );
}
