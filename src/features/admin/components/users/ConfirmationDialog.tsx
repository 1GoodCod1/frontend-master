import { Clock, ShieldCheck, CheckCircle, Ban } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mediaUrl } from '@/utils/media';
import { getRoleGradient, getRoleColor } from '@/utils/user';
import { useIsDark } from '@/hooks/useIsDark';
import { cn } from '@/lib/utils';

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
      ? (isUnverify ? 'Unverify user' : 'Verify user')
      : (isUnban ? 'Unban user' : 'Ban user');

  const confirmLabel =
    isVerify
      ? (isUnverify ? 'Yes, unverify' : 'Yes, verify')
      : (isUnban ? 'Yes, unban' : 'Yes, ban');

  const message =
    isVerify
      ? isUnverify
        ? 'This will remove verification status from this user. They will need to be verified again.'
        : 'This will verify the user and grant them full access to the platform.'
      : isUnban
        ? 'This will unban the user and restore their access to the platform.'
        : 'This will ban the user and prevent them from accessing the platform.';

  const isBanAction = !isUnverify && !isUnban;
  const confirmVariant = isBanAction ? 'destructive' : 'default';
  const confirmClassName =
    isUnverify
      ? 'bg-amber-600 hover:bg-amber-700 dark:hover:bg-amber-500'
      : (isUnban || (isVerify && !isUnverify))
        ? 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500'
        : '';

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[min(90vh,calc(100dvh-2rem))] w-[calc(100vw-2rem)] max-w-md flex-col gap-0 p-0 sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-row items-start gap-4">
            <div
              className="flex size-14 shrink-0 items-center justify-center rounded-xl shadow-md"
              style={{ background: iconBg }}
            >
              <Icon className="size-8 text-white" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <DialogTitle className="text-xl font-bold tracking-tight">{title}</DialogTitle>
              <p className="mt-1 text-sm text-muted-foreground">Please confirm this action.</p>
            </div>
          </div>
        </DialogHeader>

        <DialogBody className="space-y-4 py-5">
          <div className="rounded-xl border border-slate-200/90 bg-stone-50/60 p-4 shadow-sm dark:border-white/[0.12] dark:bg-white/[0.04]">
            <div className="flex items-center gap-4">
              <Avatar
                className="size-12 shrink-0 rounded-xl"
                style={{
                  background: getRoleGradient(role, isDark) || getRoleColor(role, isDark),
                }}
              >
                {avatarUrl && <AvatarImage src={avatarUrl} className="object-cover" />}
                <AvatarFallback className="rounded-xl bg-transparent text-lg font-semibold text-white">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-foreground">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email || '—'}
                </p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>

          <div
            className="rounded-xl border p-4 text-sm font-medium leading-relaxed text-foreground"
            style={{
              backgroundColor: isUnverify
                ? 'rgba(243, 156, 18, 0.1)'
                : (isUnban || (isVerify && !isUnverify))
                  ? 'rgba(39, 174, 96, 0.1)'
                  : 'rgba(220, 20, 60, 0.1)',
              borderColor: isUnverify
                ? 'rgba(243, 156, 18, 0.35)'
                : (isUnban || (isVerify && !isUnverify))
                  ? 'rgba(39, 174, 96, 0.35)'
                  : 'rgba(220, 20, 60, 0.35)',
            }}
          >
            {message}
          </div>
        </DialogBody>

        <DialogFooter className="gap-2 sm:gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="min-w-[7rem] border-amber-500/50 bg-transparent text-amber-800 hover:bg-amber-50 dark:border-amber-500/40 dark:text-amber-300 dark:hover:bg-amber-950/40"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            className={cn(
              'min-w-[7rem] shadow-md transition hover:shadow-lg',
              confirmVariant === 'default' && confirmClassName && 'border-0 text-white',
              confirmClassName,
            )}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
