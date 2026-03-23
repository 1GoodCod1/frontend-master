import { Phone } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarPlaceholder } from '@/components/ui/AvatarPlaceholder';
import { mediaUrl } from '@/utils/media';
import type { LeadDto } from '@/types/leads';

interface ClientCellProps {
  lead: LeadDto;
}

export default function ClientCell({ lead }: ClientCellProps) {
  const name = (lead.clientName ?? '').trim() || '—';
  const phone = lead.clientPhone ?? '';

  const rawPath =
    lead.client?.avatarFile?.path ??
    lead.client?.clientPhotos?.[0]?.file?.path ??
    null;
  const avatarSrc = rawPath ? mediaUrl(rawPath) : undefined;

  return (
    <div className="flex items-center gap-3 w-full min-w-0">
      <Avatar className="size-12 rounded-lg shrink-0 overflow-hidden shadow-sm">
        {avatarSrc ? (
          <AvatarImage key={avatarSrc} src={avatarSrc} className="object-cover" alt="" />
        ) : null}
        <AvatarFallback className="rounded-lg p-0 bg-transparent">
          <AvatarPlaceholder role="client" height={48} fillParent />
        </AvatarFallback>
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
