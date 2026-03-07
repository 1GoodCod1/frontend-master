import { useTranslation } from 'react-i18next';
import { Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PremiumAfterVerificationBanner() {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        'bg-gradient-to-br from-[#fff5eb] to-[#ffe8cc] dark:from-[#1f1008] dark:to-[#2a1500]',
        'border-[#ffd0a0] dark:border-[#3d1f00]'
      )}
    >
      <div className="flex gap-3">
        <Gift
          size={17}
          className="mt-0.5 shrink-0 text-[#f97316]"
          strokeWidth={2}
        />
        <div>
          <p
            className={cn(
              'mb-1.5 text-[0.78rem] font-bold',
              'text-[#7a3800] dark:text-[#f0a060]'
            )}
          >
            {t('auth.premiumSteps.title')}
          </p>
          {[
            t('auth.premiumSteps.step1'),
            t('auth.premiumSteps.step2'),
            t('auth.premiumSteps.step3'),
          ].map((s, i) => (
            <div key={i} className="mb-1 flex items-start gap-2">
              <span
                className={cn(
                  'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[0.6rem] font-extrabold text-white',
                  'bg-[#f97316]'
                )}
              >
                {i + 1}
              </span>
              <span
                className={cn(
                  'text-[0.75rem] leading-relaxed',
                  'text-[#9a4c00] dark:text-[#cc7a30]'
                )}
              >
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
