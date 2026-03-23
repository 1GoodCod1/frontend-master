import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarPlaceholder } from '@/components/ui/AvatarPlaceholder';
import { mediaUrl } from '@/utils/media';

export type ReviewMasterLike = {
  avatarUrl?: string | null;
  avatarFile?: { path?: string | null } | null;
  user?: { firstName?: string | null; lastName?: string | null; avatarFile?: { path?: string | null } | null } | null;
} & Record<string, unknown>;

interface MasterCellProps {
  master: ReviewMasterLike | null;
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
    <div className="flex items-center gap-2">
      <Avatar className="size-10 rounded-md overflow-hidden text-sm font-semibold">
        {avatarSrc ? (
          <AvatarImage key={avatarSrc} src={avatarSrc} className="object-cover" alt="" />
        ) : null}
        <AvatarFallback className="rounded-md p-0 bg-transparent">
          <AvatarPlaceholder role="master" height={40} fillParent />
        </AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium truncate">{fullName}</span>
    </div>
  );
}
