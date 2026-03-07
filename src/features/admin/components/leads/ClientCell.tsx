import { Phone } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { LeadDto } from '@/types/leads';

interface ClientCellProps {
  lead: LeadDto;
}

export default function ClientCell({ lead }: ClientCellProps) {
  const name = (lead.clientName ?? '').trim() || '—';
  const phone = lead.clientPhone ?? '';

  return (
    <div className="flex items-center gap-3 w-full min-w-0">
      <Avatar className="size-12 rounded-lg shrink-0 bg-gradient-to-br from-primary to-primary/80 text-base font-semibold shadow-sm">
        <AvatarFallback>{name[0]?.toUpperCase() || 'C'}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-foreground truncate">{name}</span>
        {phone && (
          <span className="text-xs text-muted-foreground flex items-center gap-1 truncate">
            <Phone className="size-3 shrink-0" />
            {phone}
          </span>
        )}
      </div>
    </div>
  );
}
