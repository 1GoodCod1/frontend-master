import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { mediaUrl } from '@/utils/media';

type PaymentMaster = {
  avatarUrl?: string | null;
  avatarFile?: { path?: string | null } | null;
  user?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  } | null;
} & Record<string, unknown>;

interface MasterCellProps {
  master: PaymentMaster | null;
}

export default function MasterCell({ master }: MasterCellProps) {
  if (!master) return <span className="text-sm text-muted-foreground">—</span>;

  const avatarPath = master.avatarFile?.path;
  const avatarUrl = avatarPath ? mediaUrl(avatarPath) : master.avatarUrl;
  const fullName = `${master.user?.firstName || ''} ${master.user?.lastName || ''}`.trim() || '—';

  return (
    <div className="flex items-center gap-3 w-full min-w-0">
      <Avatar className="size-12 rounded-lg shrink-0 border-2 border-border bg-gradient-to-br from-primary to-primary/80 text-base font-semibold shadow-sm">
        <AvatarImage src={avatarUrl ?? undefined} className="object-cover" />
        <AvatarFallback>{master.user?.firstName?.[0]?.toUpperCase() || 'M'}</AvatarFallback>
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
