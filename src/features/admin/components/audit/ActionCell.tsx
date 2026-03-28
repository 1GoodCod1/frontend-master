import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';

interface ActionCellProps {
  action: string | undefined;
}

export default function ActionCell({ action }: ActionCellProps) {
  const { t } = useTranslation();
  const raw = action?.trim() || '';
  const label = raw
    ? t(`admin.users.auditAction_${raw}`, raw)
    : '—';

  return (
    <Badge variant="secondary" className="max-w-full whitespace-normal text-left font-semibold text-xs leading-snug bg-primary/10 text-primary border-primary/20">
      {label}
    </Badge>
  );
}
