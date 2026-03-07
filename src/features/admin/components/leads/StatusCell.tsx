import { Star } from 'lucide-react';
import { StatusChip } from '@/components/ui/StatusChip';
import { Badge } from '@/components/ui/badge';

interface StatusCellProps {
  status: string;
  isPremium: boolean;
}

export default function StatusCell({ status, isPremium }: StatusCellProps) {
  return (
    <div className="flex flex-col gap-1 items-center">
      <StatusChip kind="lead" value={String(status ?? '')} />
      {isPremium && (
        <Badge variant="secondary" className="text-amber-600 bg-amber-500/20 border-amber-500/30 gap-1 text-[10px] h-5 font-semibold">
          <Star className="size-3" />
          Premium
        </Badge>
      )}
    </div>
  );
}
