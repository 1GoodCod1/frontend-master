import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { mediaUrl } from '@/utils/media';
import type { LeadDto } from '@/types/leads';

interface MasterCellProps {
  master: LeadDto['master'];
}

export default function MasterCell({ master }: MasterCellProps) {
  if (!master) return <span className="text-sm text-muted-foreground">—</span>;

  const avatarSrc = mediaUrl(
    master.avatarFile?.path || master.avatarUrl || null,
  ) || undefined;
  const fullName = `${master.user?.firstName || ''} ${master.user?.lastName || ''}`.trim() || '—';
  const initials = (master.user?.firstName?.[0] ?? 'M').toUpperCase();

  return (
    <div className="flex items-center gap-2">
      <Avatar className="size-10 rounded-md text-sm font-semibold">
        {avatarSrc && <AvatarImage src={avatarSrc} className="object-cover" />}
        <AvatarFallback className="rounded-md bg-amber-600 text-white">
          {initials}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium truncate">{fullName}</span>
    </div>
  );
}
