import { Phone } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { AvatarPlaceholder } from '@/components/ui/AvatarPlaceholder';
import { mediaUrl } from '@/utils/media';

type AdminMasterCellMaster = {
  avatarFile?: { path?: string | null } | null;
  phone?: string | null;
  fullName?: string | null;
  user?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    phone?: string | null;
    avatarFile?: { path?: string | null } | null;
  } | null;
} & Record<string, unknown>;

interface MasterCellProps {
  master: AdminMasterCellMaster | null;
}

export default function MasterCell({ master }: MasterCellProps) {
  if (!master) return <span className="text-sm text-muted-foreground">—</span>;

  const avatarPath = master.avatarFile?.path || master.user?.avatarFile?.path;
  const avatarSrc = avatarPath ? mediaUrl(avatarPath) : undefined;
  const firstName = master.user?.firstName ?? '';
  const lastName = master.user?.lastName ?? '';
  const fullName = `${firstName} ${lastName}`.trim() || master.fullName || '—';
  const phone = master.user?.phone ?? master.phone;

  return (
    <div className="flex items-center gap-3 w-full min-w-0">
      <Avatar className="size-14 rounded-lg shrink-0 overflow-hidden shadow-sm">
        {avatarSrc && <AvatarImage src={avatarSrc} className="object-cover" />}
        <AvatarFallback className="rounded-lg p-0 bg-transparent">
          <AvatarPlaceholder role="master" height={56} fillParent />
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-foreground truncate">{fullName}</span>
        {master.user?.email && (
          <span className="text-xs text-muted-foreground truncate block">{master.user.email}</span>
        )}
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
