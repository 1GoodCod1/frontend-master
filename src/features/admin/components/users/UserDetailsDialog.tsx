import { useTranslation } from 'react-i18next';
import { Mail, Phone, CheckCircle, Ban, Clock, Calendar, LogIn, Star, Eye, Briefcase, MapPin, ShieldCheck, Activity, FileX } from 'lucide-react';
import { useAdminUserConsentsQuery, useAdminUserAuditLogsQuery } from '@/features/admin/adminApi';
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
import { AvatarPlaceholder } from '@/components/ui/AvatarPlaceholder';

import { mediaUrl } from '@/utils/media';
import { getRoleGradient, getRoleColor, formatRole } from '@/utils/user';
import { formatDateTimeLong, getLocaleFromLanguage } from '@/utils/date';
import { getTranslatedCityName, getTranslatedCategoryName } from '@/utils/translateCityCategory';
import { useIsDark } from '@/hooks/useIsDark';
import { useNow } from '@/hooks/useNow';
import { USER_ROLE } from '@/constants/roles';

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

  const userId = (user?.id ?? '') as string;
  const { data: consents } = useAdminUserConsentsQuery(userId, {
    skip: !open || !userId,
  });
  const { data: auditData } = useAdminUserAuditLogsQuery(
    { userId, limit: 20 },
    { skip: !open || !userId },
  );

  if (!user) return null;
  const role = (user.role ?? 'USER') as string;

  const documentsPurgedLog = auditData?.logs?.find(
    (log) => log.action === 'VERIFICATION_DOCUMENTS_PURGED',
  ) ?? null;

  const avatarPath = user.avatarFile?.path || user.masterProfile?.avatarFile?.path;
  const avatarSrc = avatarPath ? mediaUrl(avatarPath) : undefined;
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

  // Premium card styling without ugly black borders
  const blockClass = "group flex flex-col justify-center rounded-2xl bg-slate-50/80 p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-md dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-transparent dark:border-white/[0.02]";
  const rowBlockClass = "group flex items-center gap-4 rounded-2xl bg-slate-50/80 p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-md dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-transparent dark:border-white/[0.02]";

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[min(90vh,calc(100dvh-2rem))] w-[calc(100vw-2rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl border-none shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-2xl font-bold tracking-tight">{t('admin.users.userDetails')}</DialogTitle>
          <p className="text-sm text-muted-foreground">{t('admin.users.detailSubtitle')}</p>
        </DialogHeader>

        <DialogBody className="space-y-8 overflow-y-auto px-6 py-4 custom-scrollbar">
          {/* Profile Section */}
          <section className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="relative size-24 shrink-0 overflow-hidden rounded-full ring-[4px] ring-white shadow-xl dark:ring-slate-900 sm:size-28">
              {avatarSrc ? (
                <img src={avatarSrc} alt="" className="size-full object-cover" />
              ) : (
                <AvatarPlaceholder
                  role={role === USER_ROLE.MASTER ? 'master' : 'client'}
                  height={112}
                  fillParent
                />
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col items-center text-center sm:items-start sm:text-left pt-2">
              <h2 className="mb-1.5 truncate text-2xl font-bold tracking-tight text-foreground">{displayName}</h2>
              <p className="mb-4 truncate text-sm font-medium text-muted-foreground">{user.email}</p>
              
              <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                <Badge
                  className="border-0 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm"
                  style={{
                    background: getRoleGradient(role, isDark) || getRoleColor(role, isDark),
                  }}
                >
                  {formatRole(role)}
                </Badge>
                {user.isVerified && !user.isBanned && (
                  <Badge className="gap-1.5 border-0 bg-emerald-500/15 px-3 py-1.5 text-emerald-700 hover:bg-emerald-500/25 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <CheckCircle className="size-3.5" /> {t('admin.users.badgeActive')}
                  </Badge>
                )}
                {!user.isVerified && user.isBanned && (
                  <Badge className="gap-1.5 border-0 bg-rose-500/15 px-3 py-1.5 text-rose-700 hover:bg-rose-500/25 dark:bg-rose-500/20 dark:text-rose-400">
                    <Ban className="size-3.5" /> {t('admin.users.badgeBlocked')}
                  </Badge>
                )}
                {!user.isVerified && !user.isBanned && (
                  <Badge className="gap-1.5 border-0 bg-amber-500/15 px-3 py-1.5 text-amber-700 hover:bg-amber-500/25 dark:bg-amber-500/20 dark:text-amber-400">
                    <Clock className="size-3.5" /> {t('admin.users.badgePending')}
                  </Badge>
                )}
              </div>

              {documentsPurgedLog && (
                <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-slate-200/60 bg-slate-50/80 px-3.5 py-2.5 dark:border-white/[0.06] dark:bg-white/[0.03]">
                  <FileX className="mt-0.5 size-4 shrink-0 text-muted-foreground/60" />
                  <div className="min-w-0 text-xs text-muted-foreground leading-relaxed">
                    <span>{t('admin.users.docsPurgedNotice')}</span>
                    {documentsPurgedLog.createdAt && (
                      <span className="ml-1 font-medium text-foreground/70">
                        {t('admin.users.docsPurgedOn')}: {formatDateTimeLong(documentsPurgedLog.createdAt, locale)}.
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {user.role === USER_ROLE.MASTER && user.masterProfile && (
            <section className="space-y-4 pt-2">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
                <Briefcase className="size-4" />
                {t('admin.users.masterProfileSection')}
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className={blockClass}>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{t('admin.masters.tariff')}</p>
                  <div>
                    <Badge
                      className="border-0 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm"
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
                </div>
                {user.masterProfile.category && (
                  <div className={blockClass}>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{t('admin.masters.category')}</p>
                    <p className="truncate text-sm font-semibold text-foreground">
                      {getTranslatedCategoryName(t, user.masterProfile.category)}
                    </p>
                  </div>
                )}
                {user.masterProfile.city && (
                  <div className={blockClass}>
                    <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                      <MapPin className="size-3" />
                      {t('admin.masters.city')}
                    </p>
                    <p className="truncate text-sm font-semibold text-foreground">
                      {getTranslatedCityName(t, user.masterProfile.city)}
                    </p>
                  </div>
                )}
                <div className={blockClass}>
                  <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                    <Eye className="size-3" />
                    {t('admin.masters.views')}
                  </p>
                  <p className="truncate text-sm font-semibold text-foreground">{user.masterProfile.views ?? 0}</p>
                </div>
                <div className={blockClass}>
                  <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                    <Star className="size-3" />
                    {t('admin.masters.rating')}
                  </p>
                  <p className="truncate text-sm font-semibold text-foreground">
                    {user.masterProfile.rating ?? user.masterProfile.avgRating
                      ? `${Number(user.masterProfile.rating ?? user.masterProfile.avgRating).toFixed(1)}`
                      : t('admin.users.noReviews')}
                  </p>
                </div>
                {user.masterProfile.experienceYears !== undefined && (
                  <div className={blockClass}>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{t('admin.users.experienceLabel')}</p>
                    <p className="truncate text-sm font-semibold text-foreground">
                      {user.masterProfile.experienceYears}{' '}
                      {user.masterProfile.experienceYears === 1
                        ? t('admin.users.experienceYear')
                        : t('admin.users.experienceYears')}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="space-y-4 pt-2">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
              {t('admin.users.contactSection')}
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className={rowBlockClass}>
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                  <Mail className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{t('admin.users.email')}</p>
                  <p className="truncate text-sm font-semibold text-foreground">{user.email || '—'}</p>
                </div>
              </div>
              {user.phone ? (
                <div className={rowBlockClass}>
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <Phone className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{t('admin.reviews.phoneLabel')}</p>
                    <p className="truncate text-sm font-semibold text-foreground">{user.phone}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center rounded-2xl border border-dashed border-border/40 bg-slate-50/50 p-4 text-sm text-muted-foreground dark:bg-white/[0.02]">
                  {t('admin.users.noPhoneOnFile')}
                </div>
              )}
            </div>
          </section>

          {(user.createdAt || user.lastLoginAt) && (
            <section className="space-y-4 pt-2">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
                {t('admin.users.activitySection')}
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {user.createdAt && (
                  <div className={rowBlockClass}>
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                      <Calendar className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{t('admin.users.accountCreated')}</p>
                      <p className="truncate text-sm font-semibold text-foreground">
                        {formatDateTimeLong(user.createdAt, locale)}
                      </p>
                    </div>
                  </div>
                )}
                {user.lastLoginAt && (
                  <div className={rowBlockClass}>
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
                      <LogIn className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{t('admin.users.lastLogin')}</p>
                      <p className="truncate text-sm font-semibold text-foreground">
                        {formatDateTimeLong(user.lastLoginAt, locale)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Consents Section (GDPR) */}
          <section className="space-y-4 pt-2">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
              <ShieldCheck className="size-4" />
              {t('admin.users.consentsSection')}
            </h3>
            {consents && consents.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-border/40">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40 bg-slate-50/80 dark:bg-white/[0.03]">
                      <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{t('admin.users.consentType')}</th>
                      <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{t('admin.users.consentDate')}</th>
                      <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{t('admin.users.consentVersion')}</th>
                      <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{t('admin.users.consentIp')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consents.map((c) => (
                      <tr key={c.id} className="border-b border-border/20 last:border-0">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              className={`border-0 px-2 py-0.5 text-[10px] font-bold uppercase ${
                                c.granted && !c.revokedAt
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                                  : 'bg-rose-500/15 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                              }`}
                            >
                              {c.granted && !c.revokedAt ? t('admin.users.consentGranted') : t('admin.users.consentRevoked')}
                            </Badge>
                            <span className="text-xs font-medium text-foreground">
                              {t(`admin.users.consentTypeLabels_${c.consentType}`, c.consentType)}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">
                          {formatDateTimeLong(c.createdAt, locale)}
                        </td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">
                          v{c.version}
                        </td>
                        <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">
                          {c.ipAddress || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-2xl border border-dashed border-border/40 bg-slate-50/50 p-4 text-sm text-muted-foreground dark:bg-white/[0.02]">
                {t('admin.users.consentNoData')}
              </div>
            )}
          </section>

          {/* Recent Activity (audit logs) */}
          <section className="space-y-4 pt-2">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
              <Activity className="size-4" />
              {t('admin.users.recentActivitySection')}
            </h3>
            {auditData?.logs && auditData.logs.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-border/40">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40 bg-slate-50/80 dark:bg-white/[0.03]">
                      <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{t('admin.users.auditAction')}</th>
                      <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{t('admin.users.auditDate')}</th>
                      <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{t('admin.users.auditIp')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditData.logs.map((log) => (
                      <tr key={log.id} className="border-b border-border/20 last:border-0">
                        <td className="px-3 py-2">
                          <span className="text-xs font-medium text-foreground">
                            {t(`admin.users.auditAction_${log.action}`, log.action)}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">
                          {formatDateTimeLong(log.createdAt, locale)}
                        </td>
                        <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">
                          {log.ip || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-2xl border border-dashed border-border/40 bg-slate-50/50 p-4 text-sm text-muted-foreground dark:bg-white/[0.02]">
                {t('admin.users.auditNoData')}
              </div>
            )}
          </section>
        </DialogBody>

        <DialogFooter className="flex-col-reverse gap-3 border-t border-black/5 dark:border-white/5 bg-slate-50/50 px-6 py-5 dark:bg-slate-900/50 sm:flex-row sm:justify-between sm:gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="w-full sm:w-auto font-medium"
          >
            {t('admin.users.closeDialog')}
          </Button>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button
              type="button"
              onClick={onVerify}
              className={`w-full sm:w-auto font-medium shadow-sm transition ${
                user?.isVerified
                  ? 'border border-amber-600/30 bg-white text-amber-700 hover:bg-amber-50 dark:border-amber-500/40 dark:bg-transparent dark:text-amber-400 dark:hover:bg-amber-500/10'
                  : 'bg-amber-600 text-white hover:bg-amber-700 hover:shadow-md dark:bg-amber-600 dark:hover:bg-amber-500'
              }`}
            >
              {user?.isVerified ? t('admin.users.unverify') : t('admin.users.verify')}
            </Button>
            {user?.isBanned ? (
              <Button
                type="button"
                className="w-full bg-emerald-500 text-white font-medium shadow-sm hover:bg-emerald-600 hover:shadow-md dark:bg-emerald-600 dark:hover:bg-emerald-500 sm:w-auto"
                onClick={onBan}
              >
                {t('admin.users.unban')}
              </Button>
            ) : (
              <Button 
                type="button" 
                className="w-full sm:w-auto bg-red-500 text-white font-medium shadow-sm hover:bg-red-600 hover:shadow-md dark:bg-red-600 dark:hover:bg-red-500" 
                onClick={onBan}
              >
                {t('admin.users.ban')}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
