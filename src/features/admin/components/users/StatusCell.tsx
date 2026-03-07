import { CheckCircle, Ban, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StatusCellProps {
  isVerified: boolean;
  isBanned: boolean;
}

export default function StatusCell({ isVerified, isBanned }: StatusCellProps) {
  if (isVerified && !isBanned) {
    return (
      <Badge
        className="gap-1.5 font-semibold text-sm h-8 px-3 rounded-lg text-white border-0 bg-emerald-600 shadow-[0_3px_8px_rgba(39,174,96,0.35)]"
      >
        <CheckCircle className="size-4" />
        Active
      </Badge>
    );
  }
  if (!isVerified && isBanned) {
    return (
      <Badge
        className="gap-1.5 font-semibold text-sm h-8 px-3 rounded-lg text-white border-0 bg-destructive shadow-[0_3px_8px_rgba(220,20,60,0.45)]"
      >
        <Ban className="size-4" />
        Blocked
      </Badge>
    );
  }
  return (
    <Badge
      className="gap-1.5 font-semibold text-sm h-8 px-3 rounded-lg text-white border-0 bg-amber-600 dark:bg-amber-500 shadow-[0_3px_8px_rgba(245,158,11,0.35)]"
    >
      <Clock className="size-4" />
      Pending
    </Badge>
  );
}
