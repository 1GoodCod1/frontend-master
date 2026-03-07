import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface BulkActionsProps {
  bulkIdsLength: number;
  onCreate: () => void;
  onBulkDelete: () => void;
}

export default function BulkActions({
  bulkIdsLength,
  onCreate,
  onBulkDelete,
}: BulkActionsProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="font-medium text-foreground">{t('admin.tariffs.list')}</p>
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={onCreate}>{t('admin.tariffs.create')}</Button>
        <Separator orientation="vertical" className="hidden h-6 sm:block" />
        <Button
          variant="destructive"
          onClick={onBulkDelete}
          disabled={!bulkIdsLength}
        >
          {t('admin.tariffs.bulkDelete')}
        </Button>
      </div>
    </div>
  );
}
