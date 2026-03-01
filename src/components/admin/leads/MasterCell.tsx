import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { mediaUrl } from '@/utils/media';
import type { LeadDto } from '@/types/leads';

interface MasterCellProps {
  master: LeadDto['master'];
}

export default function MasterCell({ master }: MasterCellProps) {
  if (!master) return <span className="text-sm text-muted-foreground">—</span>;

  const avatarPath = master.avatarFile?.path;
  const avatarUrl = avatarPath ? mediaUrl(avatarPath) : master.avatarUrl;
  const fullName = `${master.user?.firstName || ''} ${master.user?.lastName || ''}`.trim() || '—';

  return (
    <div className="flex items-center gap-2">
      <Avatar className="size-10 rounded-md border border-border bg-gradient-to-br from-primary to-primary/80 text-sm font-semibold">
        <AvatarImage src={avatarUrl ?? undefined} className="object-cover" />
        <AvatarFallback>{master.user?.firstName?.[0]?.toUpperCase() || 'M'}</AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium truncate">{fullName}</span>
    </div>
  );
}
