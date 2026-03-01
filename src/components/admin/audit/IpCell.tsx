import { MapPin } from 'lucide-react';

interface IpCellProps {
  ip: string | undefined;
}

export default function IpCell({ ip }: IpCellProps) {
  const ipValue = ip || '—';

  return (
    <div className="flex items-center gap-2 min-w-0">
      <MapPin className="size-4 text-primary shrink-0" />
      <span className="font-mono text-sm">{ipValue}</span>
    </div>
  );
}
