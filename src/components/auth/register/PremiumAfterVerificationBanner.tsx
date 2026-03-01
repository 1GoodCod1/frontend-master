import { useTranslation } from 'react-i18next';
import { Gift } from 'lucide-react';

export default function PremiumAfterVerificationBanner() {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border border-amber-300/60 dark:border-amber-500/20 bg-gradient-to-br from-amber-50 to-amber-100/90 dark:from-amber-900/20 dark:to-amber-900/15 p-5 shadow-lg shadow-amber-900/5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-200/90 dark:bg-amber-800/40">
          <Gift className="h-5 w-5 text-amber-800 dark:text-amber-500" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1 text-foreground">
          <h3 className="mb-3 text-base font-semibold">
            {t('auth.premiumSteps.title')}
          </h3>
          <ol className="mb-3 space-y-2">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-300 dark:bg-amber-700/40 text-foreground text-xs font-bold">
                1
              </span>
              <span className="text-sm font-medium">
                {t('auth.premiumSteps.step1')}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-300 dark:bg-amber-700/40 text-foreground text-xs font-bold">
                2
              </span>
              <span className="text-sm font-medium">
                {t('auth.premiumSteps.step2')}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-300 dark:bg-amber-700/40 text-foreground text-xs font-bold">
                3
              </span>
              <span className="text-sm font-medium">
                {t('auth.premiumSteps.step3')}
              </span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
