import { StatusChip } from '@/components/ui/StatusChip';

interface StatusCellProps {
  status: string;
}

export default function StatusCell({ status }: StatusCellProps) {
  return (
    <div className="flex flex-col gap-1 items-center">
      <StatusChip kind="lead" value={String(status ?? '')} />
    </div>
  );
}
