import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';

interface EntityCellProps {
  entity: string | undefined;
}

export default function EntityCell({ entity }: EntityCellProps) {
  const { t } = useTranslation();
  const raw = entity?.trim() || '';
  const label = raw
    ? t(`admin.audit.entityType_${raw}`, raw)
    : '—';

  return (
    <Badge variant="outline" className="max-w-full whitespace-normal text-left font-medium text-xs leading-snug border-purple-500/30 text-purple-600 dark:text-purple-400">
      {label}
    </Badge>
  );
}
