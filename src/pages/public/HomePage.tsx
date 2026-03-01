import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/app/hooks';
import { useMastersPopularQuery } from '@/features/masters/mastersApi';
import { usePromotionsActiveQuery } from '@/features/promotions/promotionsApi';
import { selectIsAuthed } from '@/features/auth/selectors';
import { HeroSection } from '@/components/home/HeroSection';
import { PopularCategoriesSection } from '@/components/home/PopularCategoriesSection';
import { MastersGridSection } from '@/components/home/MastersGridSection';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { Flame } from 'lucide-react';

export default function HomePage() {
  const { t } = useTranslation();
  const isAuthed = useAppSelector(selectIsAuthed);
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
      className="relative min-h-screen w-full bg-background"
    >
      <section className="relative">
        <HeroSection isAuthed={isAuthed} />
      </section>

      <section className="relative min-w-0 bg-transparent">
        <div className="container mx-auto min-w-0 max-w-7xl px-4 pt-6 pb-6 md:pt-8 md:pb-12">
          <div className="border-b border-slate-200 dark:border-white/[0.08] mb-6 md:mb-8" />

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
