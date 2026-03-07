import { User } from 'lucide-react';

interface ActorCellProps {
  actorId: string | undefined;
}

export default function ActorCell({ actorId }: ActorCellProps) {
  const actorValue = actorId || '—';

  return (
    <div className="flex items-center gap-2 min-w-0">
      <User className="size-4 text-muted-foreground shrink-0" />
      <span className="font-mono text-xs truncate">{actorValue}</span>
    </div>
  );
}
