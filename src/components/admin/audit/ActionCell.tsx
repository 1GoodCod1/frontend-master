import { Badge } from '@/components/ui/badge';

interface ActionCellProps {
  action: string | undefined;
}

export default function ActionCell({ action }: ActionCellProps) {
  const actionValue = action || '—';

  return (
    <Badge variant="secondary" className="font-semibold text-xs bg-primary/10 text-primary border-primary/20">
      {actionValue}
    </Badge>
  );
}
