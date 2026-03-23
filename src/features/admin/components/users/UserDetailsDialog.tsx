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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AvatarPlaceholder } from '@/components/ui/AvatarPlaceholder';

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
  const avatarSrc = avatarPath ? mediaUrl(avatarPath) : undefined;
  /** Join non-empty parts; do not require both names; never use email as the title (avoids duplicate with line below). */
  const nameLine = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  const displayName = nameLine || '—';

  const mp = user.masterProfile;
  const rawTariff = (mp?.effectiveTariffType ?? mp?.tariffType ?? mp?.tariff ?? 'BASIC') as string;
  const expRaw = mp?.tariffExpiresAt ?? mp?.planExpiresAt ?? null;
  const expMs = expRaw ? new Date(expRaw).getTime() : 0;
  const isActivePaid = rawTariff !== 'BASIC' && !!expMs && expMs > now;
  const effectiveTariff =
    rawTariff === 'BASIC' ? 'BASIC' : isActivePaid ? rawTariff : 'BASIC';
  const tariffUpper = String(effectiveTariff).toUpperCase();

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[min(90vh,calc(100dvh-2rem))] w-[calc(100vw-2rem)] max-w-xl flex-col gap-0 p-0 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">User details</DialogTitle>
          <p className="pr-2 text-sm text-muted-foreground">
            Profile summary and moderation actions for this account.
          </p>
        </DialogHeader>

        <DialogBody className="space-y-6 py-5">
          <section className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="size-20 shrink-0 overflow-hidden rounded-xl shadow-md">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="" className="size-full object-cover" />
                ) : (
                  <AvatarPlaceholder
                    role={role === 'MASTER' ? 'master' : 'client'}
                    height={80}
                    fillParent
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="mb-0.5 text-lg font-semibold text-foreground">{displayName}</p>
                <p className="mb-3 text-sm text-muted-foreground">{user.email}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    className="border-0 font-semibold text-white"
                    style={{
                      background: getRoleGradient(role, isDark) || getRoleColor(role, isDark),
                      boxShadow: user.role?.toUpperCase() === 'ADMIN' ? '0 2px 8px rgba(220, 20, 60, 0.4)' : undefined,
                    }}
                  >
                    {formatRole(role)}
                  </Badge>
                  {user.isVerified && !user.isBanned && (
                    <Badge className="gap-1 border-0 bg-emerald-600 font-semibold text-white">
                      <CheckCircle className="size-4" /> Active
                    </Badge>
                  )}
                  {!user.isVerified && user.isBanned && (
                    <Badge className="gap-1 border-0 bg-destructive font-semibold text-white">
                      <Ban className="size-4" /> Blocked
                    </Badge>
                  )}
                  {!user.isVerified && !user.isBanned && (
                    <Badge className="gap-1 border-0 bg-amber-500 font-semibold text-white">
                      <Clock className="size-4" /> Pending
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </section>

          {user.role === 'MASTER' && user.masterProfile && (
            <>
              <Separator className="bg-border/60" />
              <section className="space-y-3">
                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Master profile
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground/90">
                    Tariff, category, and public stats for this master.
                  </p>
                </div>
                <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-4 dark:bg-amber-500/10">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <div>
                      <p className="mb-0.5 text-xs text-muted-foreground">Tariff</p>
                      <Badge
                        className="border-0 font-semibold text-white"
                        style={{
                          backgroundColor:
                            tariffUpper === 'VIP'
                              ? '#DC143C'
                              : tariffUpper === 'PREMIUM'
                                ? '#F39C12'
                                : '#4A90E2',
                        }}
                      >
                        {tariffUpper}
                      </Badge>
                    </div>
                    {user.masterProfile.category && (
                      <div>
                        <p className="mb-0.5 text-xs text-muted-foreground">Category</p>
                        <p className="text-sm font-medium">
                          {getTranslatedCategoryName(t, user.masterProfile.category)}
                        </p>
                      </div>
                    )}
                    {user.masterProfile.city && (
                      <div>
                        <p className="mb-0.5 text-xs text-muted-foreground">City</p>
                        <p className="text-sm font-medium">
                          {getTranslatedCityName(t, user.masterProfile.city)}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="mb-0.5 text-xs text-muted-foreground">Views</p>
                      <p className="text-sm font-medium">{user.masterProfile.views ?? 0}</p>
                    </div>
                    <div>
                      <p className="mb-0.5 text-xs text-muted-foreground">Rating</p>
                      <p className="text-sm font-medium">
                        {user.masterProfile.rating ?? user.masterProfile.avgRating
                          ? `⭐ ${Number(user.masterProfile.rating ?? user.masterProfile.avgRating).toFixed(1)}`
                          : 'No reviews'}
                      </p>
                    </div>
                    {user.masterProfile.experienceYears !== undefined && (
                      <div>
                        <p className="mb-0.5 text-xs text-muted-foreground">Experience</p>
                        <p className="text-sm font-medium">
                          {user.masterProfile.experienceYears}{' '}
                          {user.masterProfile.experienceYears === 1 ? 'year' : 'years'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </>
          )}

          <Separator className="bg-border/60" />

          <section className="space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Contact
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200/90 bg-stone-50/60 px-4 py-3 shadow-sm dark:border-white/[0.12] dark:bg-white/[0.04]">
                <div className="mb-2 flex items-center gap-2">
                  <Mail className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-semibold text-foreground">Email</span>
                </div>
                <p className="text-sm text-muted-foreground break-all pl-6">{user.email || '—'}</p>
              </div>
              {user.phone ? (
                <div className="rounded-xl border border-slate-200/90 bg-stone-50/60 px-4 py-3 shadow-sm dark:border-white/[0.12] dark:bg-white/[0.04]">
                  <div className="mb-2 flex items-center gap-2">
                    <Phone className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm font-semibold text-foreground">Phone</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">{user.phone}</p>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-3 text-sm text-muted-foreground sm:flex sm:items-center">
                  No phone on file
                </div>
              )}
            </div>
          </section>

          {(user.createdAt || user.lastLoginAt) && (
            <>
              <Separator className="bg-border/60" />
              <section className="space-y-3">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Activity
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {user.createdAt && (
                    <div className="rounded-xl border border-slate-200/90 bg-stone-50/60 px-4 py-3 shadow-sm dark:border-white/[0.12] dark:bg-white/[0.04]">
                      <p className="mb-1 text-sm font-semibold text-foreground">Account created</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTimeLong(user.createdAt, locale)}
                      </p>
                    </div>
                  )}
                  {user.lastLoginAt && (
                    <div className="rounded-xl border border-slate-200/90 bg-stone-50/60 px-4 py-3 shadow-sm dark:border-white/[0.12] dark:bg-white/[0.04]">
                      <p className="mb-1 text-sm font-semibold text-foreground">Last login</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTimeLong(user.lastLoginAt, locale)}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </DialogBody>

        <DialogFooter className="gap-2 sm:gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="min-w-[7rem] border-amber-500/50 bg-transparent text-amber-800 hover:bg-amber-50 dark:border-amber-500/40 dark:text-amber-300 dark:hover:bg-amber-950/40"
          >
            Close
          </Button>
          <Button
            type="button"
            onClick={onVerify}
            className="min-w-[7rem] border-0 bg-amber-600 text-white shadow-md transition-all hover:bg-amber-700 hover:shadow-lg dark:bg-amber-600 dark:hover:bg-amber-500"
          >
            {user?.isVerified ? 'Unverify' : 'Verify'}
          </Button>
          {user?.isBanned ? (
            <Button
              type="button"
              className="min-w-[7rem] bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              onClick={onBan}
            >
              Unban
            </Button>
          ) : (
            <Button type="button" variant="destructive" className="min-w-[7rem]" onClick={onBan}>
              Ban
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
