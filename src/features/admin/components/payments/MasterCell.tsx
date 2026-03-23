import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarPlaceholder } from '@/components/ui/AvatarPlaceholder';
import { mediaUrl } from '@/utils/media';

type PaymentMaster = {
  avatarUrl?: string | null;
  avatarFile?: { path?: string | null } | null;
  user?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    avatarFile?: { path?: string | null } | null;
  } | null;
} & Record<string, unknown>;

interface MasterCellProps {
  master: PaymentMaster | null;
}

export default function MasterCell({ master }: MasterCellProps) {
  if (!master) return <span className="text-sm text-muted-foreground">—</span>;

  const rawPath =
    master.avatarUrl ||
    master.avatarFile?.path ||
    master.user?.avatarFile?.path ||
    null;
  const avatarSrc = rawPath ? mediaUrl(rawPath) : undefined;
  const fullName = `${master.user?.firstName || ''} ${master.user?.lastName || ''}`.trim() || '—';

  return (
    <div className="flex items-center gap-3 w-full min-w-0">
      <Avatar className="size-12 rounded-lg shrink-0 overflow-hidden border-2 border-border shadow-sm">
        {avatarSrc ? (
          <AvatarImage key={avatarSrc} src={avatarSrc} className="object-cover" alt="" />
        ) : null}
        <AvatarFallback className="rounded-lg p-0 bg-transparent">
          <AvatarPlaceholder role="master" height={48} fillParent />
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-foreground truncate">{fullName}</span>
        {master.user?.email && (
          <span className="text-xs text-muted-foreground truncate block">{master.user.email}</span>
        )}
      </div>
    </div>
  );
}
