import { Phone } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mediaUrl } from '@/utils/media';
import { getRoleGradient, getRoleColor } from '@/utils/user';
import { useIsDark } from '@/hooks/useIsDark';

type AdminUserCellUser = {
  role?: string | null;
  avatarUrl?: string | null;
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
  const isDark = useIsDark();
  const role = (user.role ?? 'USER') as string;
  const avatarPath = user.avatarFile?.path || user.masterProfile?.avatarFile?.path;
  const avatarUrl =
    typeof avatarPath === 'string' && avatarPath
      ? mediaUrl(avatarPath)
      : user.avatarUrl ?? undefined;
  const hasAvatar = Boolean(avatarUrl);
  const fallbackBg =
    hasAvatar ? 'transparent' : (getRoleGradient(role, isDark) || getRoleColor(role, isDark));
  const initial =
    user.email?.[0]?.toUpperCase() || user.firstName?.[0]?.toUpperCase() || 'U';

  return (
    <div className="flex items-center gap-4 w-full h-full min-w-0">
      <Avatar
        className={`
          size-14 shrink-0 rounded-lg
          ${user.role?.toUpperCase() === 'ADMIN' ? 'shadow-[0_3px_10px_rgba(220,20,60,0.4)]' : 'shadow-md'}
          ${hasAvatar ? 'border-2 border-slate-200 dark:border-white/[0.08]' : ''}
        `}
        style={hasAvatar ? undefined : { background: fallbackBg }}
      >
        {hasAvatar && <AvatarImage src={avatarUrl} className="object-cover" />}
        <AvatarFallback className="rounded-lg text-xl font-semibold bg-transparent text-white">
          {!hasAvatar && initial}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 flex flex-col gap-0.5">
        <p className="text-[0.95rem] font-semibold text-foreground truncate leading-tight">
          {user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.email || '—'}
        </p>
        <p className="text-xs text-muted-foreground truncate leading-tight">
          {user.email}
        </p>
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
