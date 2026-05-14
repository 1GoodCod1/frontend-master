import { useTranslation } from 'react-i18next';
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 max-w-3xl mx-auto">
        {HOW_IT_WORKS_STEPS.map(({ icon: Icon, titleKey, descKey, accent, bg, ring }, i) => (
          <div
            key={titleKey}
            className={cn(
              'relative h-full flex flex-col items-center text-center px-4 py-6 sm:px-5 sm:py-7 rounded-xl sm:rounded-2xl min-w-0',
              'bg-[#F9FAFB] border border-gray-200/80 shadow-sm',
              'dark:bg-white/[0.06] dark:border-white/[0.08] dark:shadow-lg dark:shadow-black/20',
              'hover:-translate-y-1 hover:shadow-md hover:shadow-black/10',
              'transition duration-300',
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
