import { CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StatusCellProps {
  isVerified: boolean | undefined;
}

export default function StatusCell({ isVerified }: StatusCellProps) {
  const verified = Boolean(isVerified);

  return (
    <Badge
      variant={verified ? 'default' : 'secondary'}
      className={
        verified
          ? 'bg-emerald-600 hover:bg-emerald-600 text-white gap-1 font-semibold text-xs h-8'
          : 'bg-amber-500/90 hover:bg-amber-500/90 text-white gap-1 font-semibold text-xs h-8'
      }
    >
      {verified && <CheckCircle className="size-3.5" />}
      {verified ? 'Verified' : 'Pending'}
    </Badge>
  );
}
