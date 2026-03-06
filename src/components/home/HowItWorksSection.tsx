import { useTranslation } from 'react-i18next';
import { Search, MessageCircle, ThumbsUp } from 'lucide-react';
import { useIsDark } from '@/hooks/useIsDark';
import OptimizedImage from '@/components/common/OptimizedImage';
import { cn } from '@/lib/utils';

const steps = [
  {
    icon: Search,
    titleKey: 'home.howItWorks.step1Title',
    descKey: 'home.howItWorks.step1Desc',
    accent: 'text-primary dark:text-teal-400',
    bg: 'bg-primary/10 dark:bg-teal-400/10',
    ring: 'ring-primary/20 dark:ring-teal-400/20',
  },
  {
    icon: MessageCircle,
    titleKey: 'home.howItWorks.step2Title',
    descKey: 'home.howItWorks.step2Desc',
    accent: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10 dark:bg-amber-400/10',
    ring: 'ring-amber-500/20 dark:ring-amber-400/20',
  },
  {
    icon: ThumbsUp,
    titleKey: 'home.howItWorks.step3Title',
    descKey: 'home.howItWorks.step3Desc',
    accent: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10 dark:bg-emerald-400/10',
    ring: 'ring-emerald-500/20 dark:ring-emerald-400/20',
  },
] as const;

export const HowItWorksSection = () => {
  const { t } = useTranslation();
  const isDark = useIsDark();

  return (
    <div className="py-2">
      <div className="text-center mb-6 sm:mb-8">
        <h2
          className={cn(
            'text-2xl sm:text-3xl font-bold tracking-tight',
            'text-slate-800 dark:text-slate-100'
          )}
        >
          {t('home.howItWorks.title')}
        </h2>
        <p
          className={cn(
            'mt-2 text-sm sm:text-base max-w-lg mx-auto',
            'text-slate-500 dark:text-slate-400'
          )}
        >
          {t('home.howItWorks.subtitle')}
        </p>
      </div>

      <div className="mx-auto mb-8 max-w-3xl">
        <OptimizedImage
          basePath={isDark ? '/images/how-it-works-dark' : '/images/how-it-works'}
          alt=""
          className="w-full h-auto rounded-2xl"
          loading="lazy"
          draggable={false}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
        {steps.map(({ icon: Icon, titleKey, descKey, accent, bg, ring }, i) => (
          <div
            key={titleKey}
            className={cn(
              'relative flex flex-col items-center text-center px-5 py-6 rounded-xl border-0',
              'bg-card shadow-md shadow-black/5',
              'dark:bg-white/[0.04] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5)]',
              'transition-all duration-250 hover:shadow-lg',
              'dark:hover:shadow-[0_8px_28px_-4px_rgba(0,0,0,0.6)]',
              'hover:-translate-y-0.5'
            )}
          >
            <span
              className={cn(
                'absolute -top-3 -left-2 text-xs font-bold px-2.5 py-0.5 rounded-full ring-2',
                bg,
                accent,
                ring
              )}
            >
              {i + 1}
            </span>
            <div className={cn('p-3 rounded-xl mb-3', bg)}>
              <Icon className={cn('w-6 h-6', accent)} strokeWidth={2} />
            </div>
            <h3 className={cn('font-semibold text-base mb-1', 'text-slate-800 dark:text-slate-100')}>
              {t(titleKey)}
            </h3>
            <p className={cn('text-sm leading-relaxed', 'text-slate-500 dark:text-slate-400')}>
              {t(descKey)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
