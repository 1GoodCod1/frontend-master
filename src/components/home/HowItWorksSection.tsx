import { useTranslation } from 'react-i18next';
import OptimizedImage from '@/components/common/OptimizedImage';
import { cn } from '@/lib/utils';
import { HOW_IT_WORKS_STEPS } from '@/constants';

export const HowItWorksSection = () => {
  const { t } = useTranslation();

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

      <div
        className={cn(
          'mx-auto mb-8 max-w-3xl rounded-2xl overflow-hidden transition-colors duration-500',
          /* light: без ring (не тянуть тёмную обводку), заметная тень */
          'shadow-[0_12px_40px_-8px_rgba(15,23,42,0.14)] shadow-slate-900/12',
          'ring-0',
          'dark:shadow-[0_4px_32px_-4px_rgba(0,0,0,0.55)]',
          'dark:ring-1 dark:ring-white/[0.08]',
          'bg-muted/25 dark:bg-[#1b1709]/85',
        )}
      >
        <OptimizedImage
          basePath="/images/how-it-works-universal"
          alt=""
          className="w-full h-auto block"
          loading="lazy"
          draggable={false}
        />
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 max-w-3xl mx-auto">
        {HOW_IT_WORKS_STEPS.map(({ icon: Icon, titleKey, descKey, accent, bg, ring }, i) => (
          <div
            key={titleKey}
            className={cn(
              'relative flex flex-col items-center text-center px-2 py-3 sm:px-4 sm:py-5 md:px-5 md:py-6 rounded-lg sm:rounded-xl border-0 min-w-0',
              'bg-card shadow-md shadow-black/5',
              'dark:bg-white/[0.04] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5)]',
              'transition duration-250 hover:shadow-lg',
              'dark:hover:shadow-[0_8px_28px_-4px_rgba(0,0,0,0.6)]',
              'hover:-translate-y-0.5'
            )}
          >
            <span
              className={cn(
                'absolute -top-2 -left-1 sm:-top-3 sm:-left-2 text-[10px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2.5 rounded-full ring-2',
                bg,
                accent,
                ring
              )}
            >
              {i + 1}
            </span>
            <div className={cn('p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl mb-2 sm:mb-3', bg)}>
              <Icon className={cn('w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6', accent)} strokeWidth={2} />
            </div>
            <h3 className={cn('font-semibold text-xs sm:text-sm md:text-base mb-0.5 sm:mb-1', 'text-slate-800 dark:text-slate-100')}>
              {t(titleKey)}
            </h3>
            <p className={cn('text-[10px] sm:text-xs md:text-sm leading-snug sm:leading-relaxed', 'text-slate-500 dark:text-slate-400')}>
              {t(descKey)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
