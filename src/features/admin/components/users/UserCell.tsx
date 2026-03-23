import { Phone } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarPlaceholder } from '@/components/ui/AvatarPlaceholder';
import { mediaUrl } from '@/utils/media';

type AdminUserCellUser = {
  role?: string | null;
  avatarFile?: { path?: string | null } | null;
  masterProfile?: { avatarFile?: { path?: string | null } | null } | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
} & Record<string, unknown>;

interface UserCellProps {
  user: AdminUserCellUser;
}

export default function UserCell({ user }: UserCellProps) {
  const avatarPath = user.avatarFile?.path || user.masterProfile?.avatarFile?.path;
  const avatarSrc = avatarPath ? mediaUrl(avatarPath) : undefined;
  const nameLine = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  const hasName = Boolean(nameLine);
  const displayName = nameLine || user.email || '—';

  return (
    <div className="flex items-center gap-4 w-full h-full min-w-0">
      <Avatar className="size-14 shrink-0 rounded-lg overflow-hidden shadow-md">
        {avatarSrc && <AvatarImage src={avatarSrc} className="object-cover" />}
        <AvatarFallback className="rounded-lg p-0 bg-transparent">
          <AvatarPlaceholder
            role={user.role?.toUpperCase() === 'MASTER' ? 'master' : 'client'}
            height={56}
            fillParent
          />
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 flex flex-col gap-0.5">
        <p className="text-[0.95rem] font-semibold text-foreground truncate leading-tight">
          {displayName}
        </p>
        {user.email && hasName && (
          <p className="text-xs text-muted-foreground truncate leading-tight">{user.email}</p>
        )}
        {user.phone && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
            <Phone className="size-3 shrink-0 text-amber-600 dark:text-amber-400" />
            {user.phone}
          </p>
        )}
      </div>
    </div>
  );
}
