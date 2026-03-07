import { Badge } from '@/components/ui/badge';

interface EntityCellProps {
  entity: string | undefined;
}

export default function EntityCell({ entity }: EntityCellProps) {
  const entityValue = entity || '—';

  return (
    <Badge variant="outline" className="font-medium text-xs border-purple-500/30 text-purple-600 dark:text-purple-400">
      {entityValue}
    </Badge>
  );
}
