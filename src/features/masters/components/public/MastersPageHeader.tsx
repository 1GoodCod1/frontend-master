import { useTranslation } from 'react-i18next';

interface MastersPageHeaderProps {
  totalCount?: number;
  isFetching?: boolean;
}

export function MastersPageHeader({ totalCount, isFetching }: MastersPageHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-3 sm:mb-4">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          {t('masters.title')}
        </h1>
        {typeof totalCount === 'number' && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            {t('masters.found', { count: totalCount })}
            {isFetching && (
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            )}
          </span>
        )}
      </div>
    </div>
  );
}
