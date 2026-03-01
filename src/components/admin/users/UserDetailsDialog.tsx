import { useTranslation } from 'react-i18next';
import { Mail, Phone, CheckCircle, Ban, Clock } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';

import { mediaUrl } from '@/utils/media';
import { getRoleGradient, getRoleColor, formatRole } from '@/utils/user';
import { formatDateTimeLong, getLocaleFromLanguage } from '@/utils/date';
import { getTranslatedCityName, getTranslatedCategoryName } from '@/utils/translateCityCategory';
import { useIsDark } from '@/hooks/useIsDark';
import { useNow } from '@/hooks/useNow';

type UserDetailsUser = {
  role?: string | null;
  isVerified?: boolean | null;
  isBanned?: boolean | null;
  avatarUrl?: string | null;
  avatarFile?: { path?: string | null } | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  createdAt?: string | null;
  lastLoginAt?: string | null;
  masterProfile?: {
    avatarFile?: { path?: string | null } | null;
    city?: { name?: string | null } | null;
    category?: { name?: string | null } | null;
    views?: number | null;
    rating?: number | null;
    avgRating?: number | null;
    experienceYears?: number | null;
    effectiveTariffType?: string | null;
    tariffType?: string | null;
    tariff?: string | null;
    tariffExpiresAt?: string | number | null;
    planExpiresAt?: string | number | null;
    lifetimePremium?: boolean | null;
  } | null;
} & Record<string, unknown>;

interface UserDetailsDialogProps {
  open: boolean;
  user: UserDetailsUser | null;
  onClose: () => void;
  onVerify: () => void;
  onBan: () => void;
}

export default function UserDetailsDialog({
  open,
  user,
  onClose,
  onVerify,
  onBan,
}: UserDetailsDialogProps) {
  const { t, i18n } = useTranslation();
  const locale = getLocaleFromLanguage(i18n.language);
  const isDark = useIsDark();
  const now = useNow();

  if (!user) return null;
  const role = (user.role ?? 'USER') as string;

  const avatarPath = user.avatarFile?.path || user.masterProfile?.avatarFile?.path;
  const avatarUrl =
    typeof avatarPath === 'string' && avatarPath
      ? mediaUrl(avatarPath)
      : user.avatarUrl ?? undefined;
  const fallbackBg = getRoleGradient(role, isDark) || getRoleColor(role, isDark);
  const initial =
    user.email?.[0]?.toUpperCase() || user.firstName?.[0]?.toUpperCase() || 'U';
  const displayName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.email || '—';

  const mp = user.masterProfile;
  const rawTariff = (mp?.effectiveTariffType ?? mp?.tariffType ?? mp?.tariff ?? 'BASIC') as string;
  const expRaw = mp?.tariffExpiresAt ?? mp?.planExpiresAt ?? null;
  const expMs = expRaw ? new Date(expRaw).getTime() : 0;
  const isActivePaid = rawTariff !== 'BASIC' && !!expMs && expMs > now;
  const effectiveTariff = mp?.lifetimePremium
    ? 'PREMIUM'
    : rawTariff === 'BASIC'
      ? 'BASIC'
      : isActivePaid
        ? rawTariff
        : 'BASIC';
  const tariffUpper = String(effectiveTariff).toUpperCase();

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Mail className="size-4" />
            </div>
            User Details
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-white/[0.08]">
            <Avatar
              className="size-20 rounded-lg shrink-0 border-[3px] border-slate-200 dark:border-white/[0.08] shadow-md"
              style={!avatarUrl ? { background: fallbackBg } : undefined}
            >
              {avatarUrl && <AvatarImage src={avatarUrl} className="object-cover" />}
              <AvatarFallback className="rounded-lg text-2xl font-semibold bg-transparent text-white">
                {!avatarUrl && initial}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold text-foreground mb-0.5">{displayName}</p>
              <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
              <div className="flex flex-wrap gap-2 items-center">
                <Badge
                  className="font-semibold text-white border-0"
                  style={{
                    background: getRoleGradient(role, isDark) || getRoleColor(role, isDark),
                    boxShadow: user.role?.toUpperCase() === 'ADMIN' ? '0 2px 8px rgba(220, 20, 60, 0.4)' : undefined,
                  }}
                >
                  {formatRole(role)}
                </Badge>
                {user.isVerified && !user.isBanned && (
                  <Badge className="gap-1 bg-emerald-600 text-white border-0 font-semibold">
                    <CheckCircle className="size-4" /> Active
                  </Badge>
                )}
                {!user.isVerified && user.isBanned && (
                  <Badge className="gap-1 bg-destructive text-white border-0 font-semibold">
                    <Ban className="size-4" /> Blocked
                  </Badge>
                )}
                {!user.isVerified && !user.isBanned && (
                  <Badge className="gap-1 bg-amber-500 text-white border-0 font-semibold">
                    <Clock className="size-4" /> Pending
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {user.role === 'MASTER' && user.masterProfile && (
            <div className="p-4 rounded-lg border border-slate-200 dark:border-white/[0.08] border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10">
              <p className="text-sm font-bold text-foreground mb-4">Master Profile</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Tariff</p>
                  <Badge
                    className="font-semibold text-white border-0"
                    style={{
                      backgroundColor:
                        tariffUpper === 'VIP' ? '#DC143C' : tariffUpper === 'PREMIUM' ? '#F39C12' : '#4A90E2',
                    }}
                  >
                    {tariffUpper}
                  </Badge>
                </div>
                {user.masterProfile.category && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Category</p>
                    <p className="text-sm font-medium">{getTranslatedCategoryName(t, user.masterProfile.category)}</p>
                  </div>
                )}
                {user.masterProfile.city && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">City</p>
                    <p className="text-sm font-medium">{getTranslatedCityName(t, user.masterProfile.city)}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Views</p>
                  <p className="text-sm font-medium">{user.masterProfile.views ?? 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Rating</p>
                  <p className="text-sm font-medium">
                    {(user.masterProfile.rating ?? user.masterProfile.avgRating)
                      ? `⭐ ${Number(user.masterProfile.rating ?? user.masterProfile.avgRating).toFixed(1)}`
                      : 'No reviews'}
                  </p>
                </div>
                {user.masterProfile.experienceYears !== undefined && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Experience</p>
                    <p className="text-sm font-medium">
                      {user.masterProfile.experienceYears}{' '}
                      {user.masterProfile.experienceYears === 1 ? 'year' : 'years'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-amber-500/5 dark:bg-amber-500/10">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="size-5 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-semibold text-foreground">Email</span>
              </div>
              <p className="text-sm text-muted-foreground ml-7">{user.email || '—'}</p>
            </div>

            {user.phone && (
              <div className="p-4 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-amber-500/5 dark:bg-amber-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="size-5 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-semibold text-foreground">Phone</span>
                </div>
                <p className="text-sm text-muted-foreground ml-7">{user.phone}</p>
              </div>
            )}

            {user.createdAt && (
              <div className="p-4 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-amber-500/5 dark:bg-amber-500/10">
                <p className="text-sm font-semibold text-foreground mb-1">Account Created</p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTimeLong(user.createdAt, locale)}
                </p>
              </div>
            )}

            {user.lastLoginAt && (
              <div className="p-4 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-amber-500/5 dark:bg-amber-500/10">
                <p className="text-sm font-semibold text-foreground mb-1">Last Login</p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTimeLong(user.lastLoginAt, locale)}
                </p>
              </div>
            )}
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            onClick={onClose}
            className="border-0 bg-amber-50 text-amber-700 shadow-sm transition-all hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-800/40"
          >
            Close
          </Button>
          <Button
            onClick={onVerify}
            className="border-0 bg-amber-600 text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-amber-700 hover:shadow-xl dark:bg-amber-700 dark:hover:bg-amber-600"
          >
            {user?.isVerified ? 'Unverify' : 'Verify'}
          </Button>
          {user?.isBanned ? (
            <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700" onClick={onBan}>
              Unban
            </Button>
          ) : (
            <Button variant="destructive" onClick={onBan}>
              Ban
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
