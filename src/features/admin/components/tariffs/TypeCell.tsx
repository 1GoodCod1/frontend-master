import { Badge } from '@/components/ui/badge';

interface TypeCellProps {
  type: string | undefined;
}

export default function TypeCell({ type }: TypeCellProps) {
  if (!type) return <span className="text-sm text-muted-foreground">—</span>;
  const variant = type === 'PLUS' ? 'destructive' : type === 'PRO' ? 'secondary' : 'outline';
  return <Badge variant={variant} className="text-xs">{type}</Badge>;
}
