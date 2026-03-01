import { useTranslation } from 'react-i18next';
import { MasterCard } from '@/components/ui/MasterCard';
import { ErrorState } from '@/components/common/States';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { cn } from '@/lib/utils';
import type { PublicMaster } from '@/types';

interface MastersGridSectionProps {
  title: string;
  subtitle?: string;
  masters: PublicMaster[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  icon: React.ComponentType<{ className?: string }>;
  iconBgColor?: string;
  horizontalScroll?: boolean;
  sectionBg?: boolean;
  sectionBadge?: 'popular' | 'new';
  /** Map masterId -> discount % for promotion badge on card */
  promotionDiscountByMasterId?: Map<string, number>;
}

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border p-4 space-y-3">
      <Skeleton className="h-14 w-14 rounded-full" />
      <Skeleton className="h-6 w-[70%]" />
      <Skeleton className="h-5 w-[50%]" />
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-3.5 w-3.5 rounded" />
        ))}
      </div>
    </div>
  );
}

export const MastersGridSection = ({
  title,
  subtitle,
  masters,
  isLoading,
  isError,
  error,
  onRetry,
  icon: Icon,
  iconBgColor,
  horizontalScroll = false,
  sectionBadge,
  promotionDiscountByMasterId,
}: MastersGridSectionProps) => {
  const { t } = useTranslation();
  const effectiveIconBg =
    iconBgColor ??
    (sectionBadge === 'popular' ? 'bg-amber-500' : sectionBadge === 'new' ? 'bg-primary' : 'bg-primary');
  const list = masters.slice(0, horizontalScroll ? 12 : 4);

  if (horizontalScroll) {
    return (
      <div className="mb-6 md:mb-8">
        <div className="mb-4">
          <div className="flex flex-row items-start gap-3">
            <div
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full shrink-0 shadow-sm',
                sectionBadge === 'new'
                  ? 'bg-primary text-teal-200 dark:text-teal-300'
                  : 'text-primary-foreground',
                effectiveIconBg
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-normal text-foreground">{title}</h3>
              {subtitle ? (
                <p className="text-muted-foreground text-[0.9375rem] mt-0.5">{subtitle}</p>
              ) : null}
            </div>
          </div>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <ErrorState error={error} onRetry={onRetry} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {list.map((m, idx: number) => (
              <ScrollReveal key={m.id} delay={idx * 0.04} duration={0.4}>
                <MasterCard
                  master={{
                    ...m,
                    displayName: `${m?.user?.firstName || ''} ${m?.user?.lastName || ''}`.trim() || t('masterDetails.masterLabel'),
                  }}
                  compact
                  sectionBadge={sectionBadge}
                  promotionDiscount={m?.id ? promotionDiscountByMasterId?.get(m.id) : undefined}
                />
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mb-6 md:mb-8">
      <div className="mb-4">
        <div className="flex flex-row items-start gap-3">
          <div
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-full shrink-0 shadow-sm',
              sectionBadge === 'new'
                ? 'bg-primary text-teal-200 dark:text-teal-300'
                : 'text-primary-foreground',
              iconBgColor ?? effectiveIconBg
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-normal text-foreground">{title}</h3>
            {subtitle ? (
              <p className="text-muted-foreground text-[0.9375rem] mt-0.5">{subtitle}</p>
            ) : null}
          </div>
        </div>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState error={error} onRetry={onRetry} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {list.map((m, idx: number) => (
            <ScrollReveal key={m.id} delay={idx * 0.04} duration={0.4}>
              <MasterCard
                master={{
                  ...m,
                  displayName: `${m?.user?.firstName || ''} ${m?.user?.lastName || ''}`.trim() || t('masterDetails.masterLabel'),
                }}
                compact
                sectionBadge={sectionBadge}
                promotionDiscount={m?.id ? promotionDiscountByMasterId?.get(m.id) : undefined}
              />
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
};
