import { StatusChip } from '@/components/ui/StatusChip';

interface StatusCellProps {
  status: string | undefined;
}

export default function StatusCell({ status }: StatusCellProps) {
  return <StatusChip kind="payment" value={String(status ?? '')} />;
}
