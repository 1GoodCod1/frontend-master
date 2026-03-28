import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { useIsDark } from '@/hooks/useIsDark';
import OptimizedImage from '@/components/common/OptimizedImage';
import { cn } from '@/lib/utils';

interface EarlyBirdBannerProps {
  remainingSlots: number;
  totalSlots: number;
}

export default function EarlyBirdBanner({ remainingSlots, totalSlots }: EarlyBirdBannerProps) {
  const { t } = useTranslation();
  const isDark = useIsDark();

  if (remainingSlots <= 0 || totalSlots <= 0) return null;

  const taken = totalSlots - remainingSlots;
  const pct = Math.min((taken / totalSlots) * 100, 100);

  return (
    <div className="mb-6 overflow-hidden rounded-2xl shadow-lg dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5)]">
      <div className="relative">
        <OptimizedImage
          basePath={isDark ? '/images/early-bird-banner-dark' : '/images/early-bird-banner'}
          alt={t('auth.earlyBird.title')}
          className="w-full h-auto block"
          loading="eager"
          draggable={false}
        />
      </div>

      <div
        className={cn(
          'px-5 py-4',
          'bg-gradient-to-r from-amber-50 via-amber-100/80 to-orange-50',
          'dark:from-amber-950/40 dark:via-amber-900/30 dark:to-amber-950/40',
          'border-t border-amber-200/50 dark:border-amber-500/15',
        )}
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="size-5 text-amber-500 dark:text-amber-400 shrink-0" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            {t('auth.earlyBird.title')}
          </h3>
        </div>

        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-3">
          {t('auth.earlyBird.description')}
          <strong className="text-amber-700 dark:text-amber-400">
            {t('auth.earlyBird.descriptionBold')}
          </strong>
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-600 dark:text-slate-400">
              {t('auth.earlyBird.remainingSlots')}
            </span>
            <span className="font-extrabold text-lg tabular-nums text-amber-600 dark:text-amber-400">
              {remainingSlots}
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500 ml-1">
                / {totalSlots}
              </span>
            </span>
          </div>

          <div className="relative h-3 w-full rounded-full bg-slate-200/80 dark:bg-white/10 overflow-hidden">
            <div
              className={cn(
                'absolute inset-y-0 left-0 rounded-full transition duration-700 ease-out',
                'bg-gradient-to-r from-amber-400 via-orange-400 to-red-400',
                'dark:from-amber-500 dark:via-orange-500 dark:to-red-500',
              )}
              style={{ width: `${pct}%` }}
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/25 to-transparent" />
          </div>

          {remainingSlots <= 20 && (
            <p className="text-xs font-semibold text-red-500 dark:text-red-400 animate-pulse">
              {t('auth.earlyBird.hurry', { defaultValue: '' })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
