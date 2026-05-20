import { useTranslation } from 'react-i18next';
import { MasterCard } from '@/components/ui/MasterCard';
import { ErrorState } from '@/components/common/States';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { cn } from '@/lib/utils';
import { surfaceCardCls } from '@/lib/surfaceCard';
import type { PublicMaster } from '@/types';

interface MastersGridSectionProps {
  title: string;
  subtitle?: string;
  masters: PublicMaster[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  iconBgColor?: string;
  horizontalScroll?: boolean;
  sectionBg?: boolean;
  sectionBadge?: 'popular' | 'new';
  hideTitle?: boolean;
  className?: string;
}

function CardSkeleton() {
  return (
    <div className={cn('rounded-xl p-4 space-y-3', surfaceCardCls)}>
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

const GRID_CLASS = 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6';

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
  hideTitle = false,
  className,
}: MastersGridSectionProps) => {
  const { t } = useTranslation();
  const list = masters.slice(0, horizontalScroll ? 12 : 4);
  const skeletonCount = horizontalScroll ? 6 : 4;

  return (
    <div className={cn('mb-6 md:mb-8', className)}>
      {!hideTitle && Icon ? (
        <div className="mb-4">
          <div className="flex flex-row items-start gap-3">
            <div
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full shrink-0 shadow-sm text-primary-foreground',
                iconBgColor ?? 'bg-primary',
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
      ) : !hideTitle ? (
        <div className="mb-8 text-center">
          <h2
            className={cn(
              'text-2xl sm:text-3xl font-bold tracking-tight',
              'text-slate-800 dark:text-slate-100',
            )}
          >
            {title}
          </h2>
          {subtitle ? (
            <p
              className={cn(
                'mt-2 text-sm sm:text-base max-w-lg mx-auto',
                'text-slate-500 dark:text-slate-400',
              )}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
      ) : null}
      {isLoading ? (
        <div className={GRID_CLASS}>
          {Array.from({ length: skeletonCount }, (_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState error={error} onRetry={onRetry} />
      ) : list.length === 0 ? null : (
        <div className={GRID_CLASS}>
          {list.map((m, idx: number) => (
            <ScrollReveal key={m.id} delay={idx * 0.04} duration={0.4} className={horizontalScroll ? 'h-full' : undefined}>
              <MasterCard
                master={{
                  ...m,
                  displayName: `${m?.user?.firstName || ''} ${m?.user?.lastName || ''}`.trim() || t('masterDetails.masterLabel'),
                }}
                compact
                sectionBadge={sectionBadge}
              />
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
};
