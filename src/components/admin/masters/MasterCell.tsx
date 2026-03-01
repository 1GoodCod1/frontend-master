import { Phone } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { mediaUrl } from '@/utils/media';

type AdminMasterCellMaster = {
  avatarUrl?: string | null;
  avatarFile?: { path?: string | null } | null;
  phone?: string | null;
  fullName?: string | null;
  user?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    avatarFile?: { path?: string | null } | null;
  } | null;
} & Record<string, unknown>;

interface MasterCellProps {
  master: AdminMasterCellMaster | null;
}

export default function MasterCell({ master }: MasterCellProps) {
  if (!master) return <span className="text-sm text-muted-foreground">—</span>;

  const avatarPath = master.avatarFile?.path || master.user?.avatarFile?.path;
  const avatarUrl = avatarPath ? mediaUrl(avatarPath) : master.avatarUrl;
  const firstName = master.user?.firstName ?? '';
  const lastName = master.user?.lastName ?? '';
  const fullName = `${firstName} ${lastName}`.trim() || master.fullName || '—';

  return (
    <div className="flex items-center gap-3 w-full min-w-0">
      <Avatar className="size-14 rounded-lg shrink-0 border-2 border-border bg-gradient-to-br from-primary to-primary/80 text-lg font-semibold shadow-sm">
        <AvatarImage src={avatarUrl ?? undefined} className="object-cover" />
        <AvatarFallback>{firstName[0]?.toUpperCase() || 'M'}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-foreground truncate">{fullName}</span>
        {master.user?.email && (
          <span className="text-xs text-muted-foreground truncate block">{master.user.email}</span>
        )}
        {master.phone && (
          <span className="text-xs text-muted-foreground flex items-center gap-1 truncate">
            <Phone className="size-3 shrink-0" />
            {master.phone}
          </span>
        )}
      </div>
    </div>
  );
}
