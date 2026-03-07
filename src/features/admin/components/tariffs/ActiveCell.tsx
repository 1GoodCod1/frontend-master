import { Badge } from '@/components/ui/badge';

interface ActiveCellProps {
  isActive: boolean | undefined;
}

export default function ActiveCell({ isActive }: ActiveCellProps) {
  const checked = Boolean(isActive);
  return (
    <Badge variant={checked ? 'default' : 'secondary'} className="text-xs">
      {checked ? 'Active' : 'Inactive'}
    </Badge>
  );
}
