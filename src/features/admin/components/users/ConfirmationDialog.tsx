import { Clock, ShieldCheck, CheckCircle, Ban } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mediaUrl } from '@/utils/media';
import { getRoleGradient, getRoleColor } from '@/utils/user';
import { useIsDark } from '@/hooks/useIsDark';

type ConfirmUser = {
  role?: string | null;
  isVerified?: boolean | null;
  isBanned?: boolean | null;
  avatarUrl?: string | null;
  avatarFile?: { path?: string | null } | null;
  masterProfile?: { avatarFile?: { path?: string | null } | null } | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
} & Record<string, unknown>;

interface ConfirmationDialogProps {
  open: boolean;
  action: 'verify' | 'ban' | null;
  user: ConfirmUser | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmationDialog({
  open,
  action,
  user,
  onClose,
  onConfirm,
}: ConfirmationDialogProps) {
  const isDark = useIsDark();
  const role = (user?.role ?? 'USER') as string;

  if (!action || !user) return null;

  const avatarUrl =
    typeof user?.avatarFile?.path === 'string' && user.avatarFile.path
      ? mediaUrl(user.avatarFile.path)
      : typeof user?.masterProfile?.avatarFile?.path === 'string' && user.masterProfile.avatarFile.path
        ? mediaUrl(user.masterProfile.avatarFile.path)
        : user?.avatarUrl ?? undefined;

  const isVerify = action === 'verify';
  const isUnverify = isVerify && user?.isVerified;
  const isUnban = !isVerify && user?.isBanned;

  const iconBg =
    isVerify
      ? isUnverify
        ? 'linear-gradient(135deg, #F39C12 0%, #D68910 100%)'
        : 'linear-gradient(135deg, #27AE60 0%, #229954 100%)'
      : isUnban
        ? 'linear-gradient(135deg, #27AE60 0%, #229954 100%)'
        : 'linear-gradient(135deg, #DC143C 0%, #B0122E 100%)';

  const Icon =
    isVerify
      ? (isUnverify ? Clock : ShieldCheck)
      : (isUnban ? CheckCircle : Ban);

  const title =
    isVerify
      ? (isUnverify ? 'Unverify User' : 'Verify User')
      : (isUnban ? 'Unban User' : 'Ban User');

  const confirmLabel =
    isVerify
      ? (isUnverify ? 'Yes, Unverify' : 'Yes, Verify')
      : (isUnban ? 'Yes, Unban' : 'Yes, Ban');

  const message =
    isVerify
      ? isUnverify
        ? '⚠️ This will remove verification status from this user. They will need to be verified again.'
        : '✅ This will verify the user and grant them full access to the platform.'
      : isUnban
        ? '✅ This will unban the user and restore their access to the platform.'
        : '⚠️ This will ban the user and prevent them from accessing the platform.';

  const isBanAction = !isUnverify && !isUnban;
  const confirmVariant = isBanAction ? 'destructive' : 'default';
  const confirmClassName =
    isUnverify
      ? 'bg-amber-600 hover:bg-amber-700'
      : (isUnban || (isVerify && !isUnverify))
        ? 'bg-emerald-600 hover:bg-emerald-700'
        : '';

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
          <div
            className="size-14 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: iconBg }}
          >
            <Icon className="size-8 text-white" />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold mb-0.5">{title}</DialogTitle>
            <p className="text-sm text-muted-foreground">Please confirm your action</p>
          </div>
        </DialogHeader>

        <div className="rounded-lg border border-slate-200 dark:border-white/[0.08] bg-muted/30 dark:bg-white/[0.03] p-4 space-y-4">
          <div className="flex items-center gap-4">
            <Avatar
              className="size-12 rounded-lg shrink-0"
              style={{
                background: getRoleGradient(role, isDark) || getRoleColor(role, isDark),
              }}
            >
              {avatarUrl && <AvatarImage src={avatarUrl} className="object-cover" />}
              <AvatarFallback className="rounded-lg text-lg font-semibold bg-transparent text-white">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground truncate">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email || '—'}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>

          <div
            className="rounded-lg p-4 border text-sm font-medium text-foreground"
            style={{
              backgroundColor: isUnverify
                ? 'rgba(243, 156, 18, 0.1)'
                : (isUnban || (isVerify && !isUnverify))
                  ? 'rgba(39, 174, 96, 0.1)'
                  : 'rgba(220, 20, 60, 0.1)',
              borderColor: isUnverify
                ? 'rgba(243, 156, 18, 0.3)'
                : (isUnban || (isVerify && !isUnverify))
                  ? 'rgba(39, 174, 96, 0.3)'
                  : 'rgba(220, 20, 60, 0.3)',
            }}
          >
            {message}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            onClick={onClose}
            className="border-0 bg-amber-50 text-amber-700 shadow-sm transition-all hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-800/40"
          >
            Cancel
          </Button>
          <Button variant={confirmVariant} className={confirmClassName} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
