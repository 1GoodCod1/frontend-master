import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MastersPaginationProps {
  page: number;
  totalPages: number;
  canPrev: boolean;
  canNext: boolean;
  isFetching: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function MastersPagination({
  page,
  totalPages,
  canPrev,
  canNext,
  isFetching,
  onPrev,
  onNext,
}: MastersPaginationProps) {
  const { t } = useTranslation();

  return (
    <Card className="mt-6 sm:mt-8 mb-4 border border-gray-200 dark:border-white/[0.08] shadow-lg shadow-black/5 dark:shadow-none">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <Button
            variant="outline"
            disabled={!canPrev || isFetching}
            onClick={onPrev}
            className="min-h-[44px] sm:min-h-11 border-gray-200 dark:border-white/10 hover:bg-primary/10 hover:border-primary/30 hover:-translate-x-0.5 transition-transform"
          >
            {t('common.prev')}
          </Button>
          <span className="px-3 sm:px-4 py-2 rounded-md bg-primary/10 font-semibold text-primary text-xs sm:text-sm md:text-base">
            {t('common.page')} {page}{' '}
            {totalPages > 0 && t('common.pageOf', { total: totalPages })}
          </span>
          <Button
            variant="outline"
            disabled={!canNext || isFetching}
            onClick={onNext}
            className="min-h-[44px] sm:min-h-11 border-gray-200 dark:border-white/10 hover:bg-primary/10 hover:border-primary/30 hover:translate-x-0.5 transition-transform"
          >
            {t('common.next')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
