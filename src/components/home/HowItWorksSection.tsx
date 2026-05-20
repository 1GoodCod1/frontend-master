import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { surfaceCardCls } from '@/lib/surfaceCard';

type HowItWorksSectionProps = {
  hideHeader?: boolean;
};

export const HowItWorksSection = ({ hideHeader = false }: HowItWorksSectionProps) => {
  const { t } = useTranslation();

  const paths = [
    { titleKey: 'home.howItWorks.pathSearchTitle', descKey: 'home.howItWorks.pathSearchDesc' },
    { titleKey: 'home.howItWorks.pathJobsTitle', descKey: 'home.howItWorks.pathJobsDesc' },
  ] as const;

  return (
    <div className="w-full">
      {!hideHeader ? (
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {t('home.howItWorks.title')}
          </h2>
        </div>
      ) : null}

      <div className={cn('rounded-xl sm:rounded-2xl p-5 sm:p-7 md:p-8 w-full', surfaceCardCls)}>
        <p className="text-[15px] sm:text-base text-foreground leading-relaxed max-w-3xl">
          {t('home.howItWorks.summary')}
        </p>

        <ul className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-5">
          {paths.map(({ titleKey, descKey }) => (
            <li
              key={titleKey}
              className={cn(
                'rounded-xl px-4 py-4 border',
                'border-[#e8e8e8] dark:border-[#2d2d2d]',
                'bg-[hsl(var(--secondary)/0.35)] dark:bg-white/[0.03]',
              )}
            >
              <p className="font-semibold text-sm text-foreground">{t(titleKey)}</p>
              <p className="mt-1.5 text-sm text-muted-foreground leading-snug">{t(descKey)}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
