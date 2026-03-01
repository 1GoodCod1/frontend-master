import { LayoutGrid } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CategoryCellProps {
  category: { name?: string | null } | null;
  categoryName?: string;
}

export default function CategoryCell({ category, categoryName }: CategoryCellProps) {
  const name = category?.name ?? categoryName ?? '—';

  return (
    <Badge variant="secondary" className="font-medium text-xs gap-1 bg-primary/10 text-primary border-primary/20">
      <LayoutGrid className="size-3.5" />
      {name}
    </Badge>
  );
}
